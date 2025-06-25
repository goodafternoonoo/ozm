import threading
import time
import uuid
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import RateLimitException, create_error_response
from app.core.logging import RequestLogger, get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """요청 로깅 미들웨어"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 요청 ID 생성
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # 사용자 ID 추출 (인증된 경우)
        user_id = None
        if hasattr(request.state, "user"):
            user_id = str(request.state.user.id)

        # 요청 로깅
        with RequestLogger(logger, request_id) as req_logger:
            req_logger.log_request(
                method=request.method, endpoint=str(request.url.path), user_id=user_id
            )

            # 요청 처리
            start_time = time.time()
            try:
                response = await call_next(request)
                duration = time.time() - start_time

                # 응답 로깅
                req_logger.log_response(
                    status_code=response.status_code, user_id=user_id
                )

                # 응답 헤더에 요청 ID 추가
                response.headers["X-Request-ID"] = request_id
                response.headers["X-Response-Time"] = f"{duration:.3f}s"

                return response

            except Exception as e:
                duration = time.time() - start_time
                req_logger.log_error(e, user_id)

                # 에러 응답 생성
                error_response = create_error_response(
                    error="Internal Server Error",
                    detail="서버 내부 오류가 발생했습니다.",
                    status_code=500,
                    request_id=request_id,
                    path=str(request.url.path),
                    method=request.method,
                )

                return JSONResponse(
                    status_code=500,
                    content=jsonable_encoder(error_response),
                    headers={"X-Request-ID": request_id},
                )


class RateLimitMiddleware(BaseHTTPMiddleware):
    """요청 제한 미들웨어"""

    def __init__(
        self, app, requests_per_minute: int = 60, requests_per_hour: int = 1000
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.minute_requests = defaultdict(list)
        self.hour_requests = defaultdict(list)
        self.lock = threading.Lock()

    def _get_client_ip(self, request: Request) -> str:
        """클라이언트 IP 추출"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup_old_requests(self, client_ip: str):
        """오래된 요청 기록 정리"""
        current_time = time.time()

        # 1분 이전 요청 제거
        self.minute_requests[client_ip] = [
            req_time
            for req_time in self.minute_requests[client_ip]
            if current_time - req_time < 60
        ]

        # 1시간 이전 요청 제거
        self.hour_requests[client_ip] = [
            req_time
            for req_time in self.hour_requests[client_ip]
            if current_time - req_time < 3600
        ]

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        with self.lock:
            self._cleanup_old_requests(client_ip)

            # 분당 요청 수 확인
            if len(self.minute_requests[client_ip]) >= self.requests_per_minute:
                raise RateLimitException("분당 요청 제한을 초과했습니다.")

            # 시간당 요청 수 확인
            if len(self.hour_requests[client_ip]) >= self.requests_per_hour:
                raise RateLimitException("시간당 요청 제한을 초과했습니다.")

            # 요청 기록 추가
            self.minute_requests[client_ip].append(current_time)
            self.hour_requests[client_ip].append(current_time)

        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """보안 헤더 미들웨어"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # 보안 헤더 추가
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        # HTTPS 강제 (프로덕션 환경에서만)
        if settings.env == "prod":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """전역 에러 처리 미들웨어"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except RateLimitException as e:
            request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
            error_response = create_error_response(
                error="Rate Limit Exceeded",
                detail=str(e),
                status_code=429,
                request_id=request_id,
                path=str(request.url.path),
                method=request.method,
            )
            return JSONResponse(
                status_code=429,
                content=jsonable_encoder(error_response),
                headers={"X-Request-ID": request_id},
            )
        except Exception as e:
            request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
            logger.error(f"Unhandled exception: {str(e)}", exc_info=True)

            error_response = create_error_response(
                error="Internal Server Error",
                detail="서버 내부 오류가 발생했습니다.",
                status_code=500,
                request_id=request_id,
                path=str(request.url.path),
                method=request.method,
            )
            return JSONResponse(
                status_code=500,
                content=jsonable_encoder(error_response),
                headers={"X-Request-ID": request_id},
            )


def setup_middleware(app):
    """미들웨어 설정"""

    # 에러 처리 미들웨어 (가장 먼저)
    app.add_middleware(ErrorHandlingMiddleware)

    # 요청 제한 미들웨어
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=settings.rate_limit_per_minute,
        requests_per_hour=settings.rate_limit_per_hour,
    )

    # 요청 로깅 미들웨어
    app.add_middleware(RequestLoggingMiddleware)

    # 보안 헤더 미들웨어
    app.add_middleware(SecurityHeadersMiddleware)

    # CORS 미들웨어
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )

    # 신뢰할 수 있는 호스트 미들웨어 (프로덕션에서만)
    if settings.env == "prod":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"],  # 실제 운영에서는 구체적인 도메인 지정
        )

    # Gzip 압축 미들웨어
    app.add_middleware(GZipMiddleware, minimum_size=1000)


class DatabaseConnectionMiddleware(BaseHTTPMiddleware):
    """데이터베이스 연결 상태 확인 미들웨어"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 헬스체크 엔드포인트는 데이터베이스 연결 확인 생략
        if request.url.path == "/health":
            return await call_next(request)

        # 데이터베이스 연결 상태 확인 (필요시)
        # 실제 구현에서는 데이터베이스 연결 풀 상태를 확인
        return await call_next(request)


class CacheMiddleware(BaseHTTPMiddleware):
    """캐시 미들웨어"""

    def __init__(self, app, cache_ttl: int = 3600):
        super().__init__(app)
        self.cache_ttl = cache_ttl
        self.cache = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # GET 요청만 캐시 적용
        if request.method != "GET":
            return await call_next(request)

        # 캐시 키 생성
        cache_key = f"{request.method}:{request.url.path}:{request.url.query}"

        # 캐시된 응답이 있는지 확인
        if cache_key in self.cache:
            cached_response, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return cached_response

        # 원본 요청 처리
        response = await call_next(request)

        # 성공적인 GET 응답만 캐시
        if response.status_code == 200:
            self.cache[cache_key] = (response, time.time())

        return response

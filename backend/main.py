from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.core.middleware import setup_middleware
from app.api.v1.router import api_router
from app.db.init_db import init_db
from app.schemas.common import error_response
import time
from sqlalchemy.exc import IntegrityError
import asyncpg

# 로깅 설정 초기화
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시 실행
    logger.info("애플리케이션 시작 중...")
    if settings.env != "prod":
        logger.info("개발 환경: 샘플 데이터 초기화 중...")
        await init_db()
    logger.info("애플리케이션 시작 완료")
    yield
    # 종료 시 실행
    logger.info("애플리케이션 종료 중...")


# FastAPI 앱 생성
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="OZM 음식 추천 시스템 API",
    docs_url=settings.docs_url if not settings.env == "prod" else None,
    redoc_url=settings.redoc_url if not settings.env == "prod" else None,
    openapi_url=(
        f"{settings.api_prefix}/openapi.json" if not settings.env == "prod" else None
    ),
    lifespan=lifespan,
)

# 미들웨어 설정
setup_middleware(app)

# API 라우터 등록
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": f"{settings.app_name} API",
        "version": settings.version,
        "environment": settings.env,
        "docs_url": f"{settings.docs_url}" if not settings.env == "prod" else None,
    }


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.version,
        "environment": settings.env,
    }


@app.get("/health/detailed")
async def detailed_health_check():
    """상세 헬스체크 엔드포인트"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.version,
        "environment": settings.env,
        "checks": {
            "database": "healthy",  # 실제로는 DB 연결 확인
            "external_services": "healthy",
        },
    }

    # 전체 상태 확인
    if any(check == "unhealthy" for check in health_status["checks"].values()):
        health_status["status"] = "unhealthy"

    return health_status


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 에러 핸들러"""
    return JSONResponse(
        status_code=404,
        content=error_response(
            message="Not Found", code=404, detail="요청한 리소스를 찾을 수 없습니다."
        ),
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """500 에러 핸들러"""
    logger.error(f"Internal server error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=error_response(
            message="Internal Server Error",
            code=500,
            detail="서버 내부 오류가 발생했습니다.",
        ),
    )


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    msg = str(exc).lower()
    orig = getattr(exc, "orig", None)
    orig_msg = str(orig).lower()
    if (
        "foreignkeyviolation" in msg
        or "foreignkeyviolation" in orig_msg
        or "foreign key constraint" in msg
        or "foreign key constraint" in orig_msg
        or "violates foreign key constraint" in msg
        or "violates foreign key constraint" in orig_msg
        or (orig and orig.__class__.__name__ == "ForeignKeyViolationError")
    ):
        from app.schemas.error_codes import ErrorCode

        return JSONResponse(
            status_code=404,
            content=error_response(
                "존재하지 않는 메뉴입니다.",
                code=404,
                error_code=ErrorCode.MENU_NOT_FOUND,
            ),
        )
    from app.schemas.error_codes import ErrorCode

    return JSONResponse(
        status_code=400,
        content=error_response(
            f"DB 무결성 오류: {str(exc)}",
            code=400,
            error_code=ErrorCode.FAVORITE_DUPLICATE,
        ),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )

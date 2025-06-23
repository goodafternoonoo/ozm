from fastapi import HTTPException, status
from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime
import uuid


class AppException(HTTPException):
    """애플리케이션 기본 예외 클래스"""

    def __init__(
        self, status_code: int, detail: str, headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundException(AppException):
    """리소스를 찾을 수 없을 때 발생하는 예외"""

    def __init__(self, resource: str, resource_id: Any = None):
        detail = f"{resource}을(를) 찾을 수 없습니다."
        if resource_id:
            detail += f" (ID: {resource_id})"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ValidationException(AppException):
    """데이터 검증 실패 시 발생하는 예외"""

    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class DuplicateException(AppException):
    """중복 데이터 생성 시 발생하는 예외"""

    def __init__(self, resource: str, field: str, value: Any):
        detail = f"{resource}의 {field} '{value}'이(가) 이미 존재합니다."
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class AuthenticationException(AppException):
    """인증 실패 시 발생하는 예외"""

    def __init__(self, detail: str = "인증에 실패했습니다."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class AuthorizationException(AppException):
    """권한 부족 시 발생하는 예외"""

    def __init__(self, detail: str = "접근 권한이 없습니다."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class DatabaseException(AppException):
    """데이터베이스 오류 시 발생하는 예외"""

    def __init__(self, detail: str = "데이터베이스 오류가 발생했습니다."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail
        )


class ExternalServiceException(AppException):
    """외부 서비스 오류 시 발생하는 예외"""

    def __init__(self, service: str, detail: str = None):
        if not detail:
            detail = f"{service} 서비스 오류가 발생했습니다."
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)


class RateLimitException(AppException):
    """요청 제한 초과 시 발생하는 예외"""

    def __init__(self, detail: str = "요청 제한을 초과했습니다."):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)


class ServiceUnavailableException(AppException):
    """서비스 일시적 사용 불가 시 발생하는 예외"""

    def __init__(self, detail: str = "서비스를 일시적으로 사용할 수 없습니다."):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


# 구체적인 예외 클래스들
class MenuNotFoundException(NotFoundException):
    """메뉴를 찾을 수 없을 때"""

    def __init__(self, menu_id: Any = None):
        super().__init__("메뉴", menu_id)


class CategoryNotFoundException(NotFoundException):
    """카테고리를 찾을 수 없을 때"""

    def __init__(self, category_id: Any = None):
        super().__init__("카테고리", category_id)


class UserNotFoundException(NotFoundException):
    """사용자를 찾을 수 없을 때"""

    def __init__(self, user_id: Any = None):
        super().__init__("사용자", user_id)


class FavoriteNotFoundException(NotFoundException):
    """즐겨찾기를 찾을 수 없을 때"""

    def __init__(self, favorite_id: Any = None):
        super().__init__("즐겨찾기", favorite_id)


class DuplicateFavoriteException(DuplicateException):
    """중복 즐겨찾기 생성 시"""

    def __init__(self, menu_id: Any):
        super().__init__("즐겨찾기", "메뉴", menu_id)


class DuplicateUserException(DuplicateException):
    """중복 사용자 생성 시"""

    def __init__(self, field: str, value: Any):
        super().__init__("사용자", field, value)


class KakaoAuthenticationException(AuthenticationException):
    """카카오 인증 실패 시"""

    def __init__(self):
        super().__init__("카카오 인증에 실패했습니다.")


class InvalidTokenException(AuthenticationException):
    """유효하지 않은 토큰 시"""

    def __init__(self):
        super().__init__("유효하지 않은 토큰입니다.")


class ExpiredTokenException(AuthenticationException):
    """만료된 토큰 시"""

    def __init__(self):
        super().__init__("만료된 토큰입니다.")


class InvalidCredentialsException(AuthenticationException):
    """잘못된 인증 정보 시"""

    def __init__(self):
        super().__init__("잘못된 인증 정보입니다.")


class InsufficientPermissionsException(AuthorizationException):
    """권한 부족 시"""

    def __init__(self, required_permission: str = None):
        detail = "접근 권한이 없습니다."
        if required_permission:
            detail += f" 필요한 권한: {required_permission}"
        super().__init__(detail)


class DatabaseConnectionException(DatabaseException):
    """데이터베이스 연결 실패 시"""

    def __init__(self):
        super().__init__("데이터베이스 연결에 실패했습니다.")


class DatabaseTimeoutException(DatabaseException):
    """데이터베이스 타임아웃 시"""

    def __init__(self):
        super().__init__("데이터베이스 요청이 시간 초과되었습니다.")


class RedisConnectionException(ExternalServiceException):
    """Redis 연결 실패 시"""

    def __init__(self):
        super().__init__("Redis", "Redis 연결에 실패했습니다.")


class KakaoServiceException(ExternalServiceException):
    """카카오 서비스 오류 시"""

    def __init__(self, detail: str = None):
        super().__init__("카카오", detail)


# 에러 응답 모델
class ErrorResponse(BaseModel):
    """에러 응답 스키마"""

    error: str
    detail: str
    status_code: int
    timestamp: datetime
    request_id: str
    path: Optional[str] = None
    method: Optional[str] = None

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class ValidationErrorResponse(BaseModel):
    """검증 에러 응답 스키마"""

    error: str = "Validation Error"
    detail: str
    status_code: int = 422
    timestamp: datetime
    request_id: str
    field_errors: Dict[str, str] = {}

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


def create_error_response(
    error: str,
    detail: str,
    status_code: int,
    request_id: str = None,
    path: str = None,
    method: str = None,
) -> ErrorResponse:
    """표준화된 에러 응답 생성"""
    return ErrorResponse(
        error=error,
        detail=detail,
        status_code=status_code,
        timestamp=datetime.utcnow(),
        request_id=request_id or str(uuid.uuid4()),
        path=path,
        method=method,
    )


def create_validation_error_response(
    detail: str, field_errors: Dict[str, str] = None, request_id: str = None
) -> ValidationErrorResponse:
    """검증 에러 응답 생성"""
    return ValidationErrorResponse(
        detail=detail,
        timestamp=datetime.utcnow(),
        request_id=request_id or str(uuid.uuid4()),
        field_errors=field_errors or {},
    )

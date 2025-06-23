from fastapi import HTTPException, status
from pydantic import BaseModel
from typing import Any, Dict, Optional


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


class KakaoAuthenticationException(AuthenticationException):
    """카카오 인증 실패 시"""

    def __init__(self):
        super().__init__("카카오 인증에 실패했습니다.")


class InvalidTokenException(AuthenticationException):
    """유효하지 않은 토큰 시"""

    def __init__(self):
        super().__init__("유효하지 않은 토큰입니다.")


# 에러 응답 모델
class ErrorResponse(BaseModel):
    """에러 응답 스키마"""

    error: str
    detail: str
    status_code: int

from typing import Any, Dict, Optional
from fastapi import status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response

from app.schemas.common import error_response, succeed_response
from app.schemas.error_codes import ErrorCode


class ResponseHandler:
    """API 응답 처리를 위한 유틸리티 클래스"""

    @staticmethod
    def success(
        data: Any = None,
        message: str = "성공",
        status_code: int = status.HTTP_200_OK,
        **kwargs,
    ) -> JSONResponse:
        """성공 응답 생성"""
        return JSONResponse(
            content=jsonable_encoder(succeed_response(data)),
            status_code=status_code,
        )

    @staticmethod
    def error(
        message: str,
        error_code: str = ErrorCode.GENERAL_ERROR,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ) -> JSONResponse:
        """에러 응답 생성"""
        return JSONResponse(
            content=jsonable_encoder(
                error_response(message, status_code, error_code, details)
            ),
            status_code=status_code,
        )

    @staticmethod
    def not_found(
        resource: str,
        resource_id: Any = None,
        error_code: str = ErrorCode.NOT_FOUND,
    ) -> JSONResponse:
        """리소스를 찾을 수 없음 응답"""
        message = f"{resource}을(를) 찾을 수 없습니다."
        if resource_id:
            message = f"{resource} '{resource_id}'을(를) 찾을 수 없습니다."
        return ResponseHandler.error(message, error_code, status.HTTP_404_NOT_FOUND)

    @staticmethod
    def created(data: Any = None, message: str = "생성되었습니다.") -> JSONResponse:
        """생성 성공 응답"""
        return ResponseHandler.success(data, message, status.HTTP_201_CREATED)

    @staticmethod
    def no_content() -> Response:
        """삭제 성공 응답 (204 No Content)"""
        return Response(status_code=status.HTTP_204_NO_CONTENT)


# 편의 함수들
def api_success(data: Any = None, **kwargs) -> JSONResponse:
    """API 성공 응답"""
    return ResponseHandler.success(data, **kwargs)


def api_error(message: str, **kwargs) -> JSONResponse:
    """API 에러 응답"""
    return ResponseHandler.error(message, **kwargs)


def api_not_found(resource: str, **kwargs) -> JSONResponse:
    """API 리소스 없음 응답"""
    return ResponseHandler.not_found(resource, **kwargs)


def api_created(data: Any = None, **kwargs) -> JSONResponse:
    """API 생성 성공 응답"""
    return ResponseHandler.created(data, **kwargs)


def api_no_content() -> Response:
    """API 삭제 성공 응답"""
    return ResponseHandler.no_content()

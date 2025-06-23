from typing import Any, Optional, Dict
from pydantic import BaseModel, Field, field_serializer
from datetime import datetime


class StandardResponse(BaseModel):
    """
    표준 성공 응답 스키마
    Args:
        success (bool): 성공 여부
        data (Any): 정상 데이터
        error (Optional[Dict[str, Any]]): 에러 정보
    """

    success: bool = Field(..., description="성공 여부")
    data: Optional[Any] = Field(None, description="정상 데이터")
    error: Optional[Dict[str, Any]] = Field(None, description="에러 정보")

    @field_serializer("data")
    def serialize_data(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value


class ErrorResponse(BaseModel):
    """
    표준 에러 응답 스키마
    Args:
        success (bool): 성공 여부
        data (Any): 정상 데이터
        error (Dict[str, Any]): 에러 정보
    """

    success: bool = Field(False, description="성공 여부")
    data: Optional[Any] = Field(None, description="정상 데이터")
    error: Dict[str, Any] = Field(..., description="에러 정보")

    @field_serializer("data")
    def serialize_data(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value


def succeed_response(data: Any = None) -> dict:
    """
    표준 성공 응답 생성 함수
    Args:
        data (Any): 응답 데이터
    Returns:
        dict: 성공 응답 딕셔너리
    """
    return StandardResponse(success=True, data=data, error=None).model_dump(
        by_alias=True
    )


def error_response(
    message: str, code: int = 400, error_code: str = None, detail: Any = None
) -> dict:
    """
    표준 에러 응답 생성 함수
    Args:
        message (str): 에러 메시지
        code (int): HTTP 상태 코드
        error_code (str): 커스텀 에러 코드
        detail (Any): 상세 정보
    Returns:
        dict: 에러 응답 딕셔너리
    """
    return ErrorResponse(
        success=False,
        data=None,
        error={
            "message": message,
            "code": error_code or code,
            "http_status": code,
            "detail": detail,
        },
    ).model_dump(by_alias=True)

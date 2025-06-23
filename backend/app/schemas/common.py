from typing import Any, Optional, Dict
from pydantic import BaseModel, Field, field_serializer
from datetime import datetime


class StandardResponse(BaseModel):
    success: bool = Field(..., description="성공 여부")
    data: Optional[Any] = Field(None, description="정상 데이터")
    error: Optional[Dict[str, Any]] = Field(None, description="에러 정보")

    @field_serializer("data")
    def serialize_data(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="성공 여부")
    data: Optional[Any] = Field(None, description="정상 데이터")
    error: Dict[str, Any] = Field(..., description="에러 정보")

    @field_serializer("data")
    def serialize_data(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value


def succeed_response(data: Any = None) -> dict:
    return StandardResponse(success=True, data=data, error=None).model_dump(
        by_alias=True
    )


def error_response(
    message: str, code: int = 400, error_code: str = None, detail: Any = None
) -> dict:
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

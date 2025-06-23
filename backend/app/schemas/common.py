from typing import Any, Optional, Dict
from pydantic import BaseModel, Field


class StandardResponse(BaseModel):
    success: bool = Field(..., description="성공 여부")
    data: Optional[Any] = Field(None, description="정상 데이터")
    error: Optional[Dict[str, Any]] = Field(None, description="에러 정보")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="성공 여부")
    data: Optional[Any] = Field(None, description="정상 데이터")
    error: Dict[str, Any] = Field(..., description="에러 정보")


def succeed_response(data: Any = None) -> dict:
    return StandardResponse(success=True, data=data, error=None).model_dump()


def error_response(message: str, code: int = 400, detail: Any = None) -> dict:
    return ErrorResponse(
        success=False,
        data=None,
        error={"message": message, "code": code, "detail": detail},
    ).model_dump()

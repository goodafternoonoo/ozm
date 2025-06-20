from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime


class UserBase(BaseModel):
    """사용자 공통 필드"""

    kakao_id: str
    nickname: Optional[str] = None
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    """카카오 로그인 기반 사용자 생성 요청"""

    pass


class UserResponse(UserBase):
    """사용자 응답 스키마"""

    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT 토큰 응답 스키마"""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """JWT 토큰 내부 데이터"""

    user_id: Optional[str] = None
    kakao_id: Optional[str] = None

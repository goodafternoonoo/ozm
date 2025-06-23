from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional
import uuid
from datetime import datetime


class UserBase(BaseModel):
    """사용자 기본 스키마"""

    username: Optional[str] = None
    email: Optional[EmailStr] = None
    nickname: Optional[str] = None


class UserCreate(UserBase):
    """사용자 생성 스키마"""

    password: str


class UserProfile(UserBase):
    """사용자 프로필 스키마"""

    id: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value):
        return value.isoformat() if isinstance(value, datetime) else value


class UserProfileUpdate(BaseModel):
    """사용자 프로필 업데이트 스키마"""

    nickname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class UserInDB(UserBase):
    """데이터베이스 사용자 스키마"""

    id: str
    hashed_password: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value):
        return value.isoformat() if isinstance(value, datetime) else value


class Token(BaseModel):
    """토큰 스키마"""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """토큰 데이터 스키마"""

    username: Optional[str] = None


class UserResponse(UserBase):
    """사용자 응답 스키마"""

    id: uuid.UUID
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value):
        return value.isoformat() if isinstance(value, datetime) else value


class LoginResponse(BaseModel):
    """로그인 응답 스키마 (토큰 + 사용자 정보)"""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse

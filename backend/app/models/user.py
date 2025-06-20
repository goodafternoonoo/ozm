import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base
import sqlalchemy.types as types


class GUID(types.TypeDecorator):
    """
    플랫폼에 따라 UUID를 String으로 변환 (PostgreSQL/SQLite 호환)
    """

    impl = String(36)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID

            return dialect.type_descriptor(UUID())
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        return value


class User(Base):
    """
    사용자(User) 테이블
    - 카카오 간편로그인(kakao_id) 기반 회원가입/로그인 지원
    - username, email, hashed_password는 소셜로그인만 쓸 경우 nullable
    """

    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    kakao_id = Column(
        String(50), unique=True, nullable=False, index=True
    )  # 카카오 고유 ID
    nickname = Column(String(100), nullable=True)  # 카카오 닉네임
    username = Column(String(50), unique=True, nullable=True, index=True)
    email = Column(String(100), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<User(kakao_id='{self.kakao_id}', nickname='{self.nickname}')>"

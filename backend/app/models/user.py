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
    - username, email은 UNIQUE
    - hashed_password: 해시된 비밀번호(소셜 로그인 등 확장 가능)
    """

    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"

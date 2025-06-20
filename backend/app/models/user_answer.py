import uuid
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import sqlalchemy.types as types


class GUID(types.TypeDecorator):
    """플랫폼에 따라 UUID를 String으로 변환"""

    impl = String(36)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        return value


class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(100), nullable=False, index=True)
    answers = Column(JSON, nullable=False)  # 모든 답변을 JSON으로 저장
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<UserAnswer(session_id='{self.session_id}', created_at='{self.created_at}')>"

import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.database import Base


class Question(Base):
    """질문 모델"""

    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String(500), nullable=False)
    question_type = Column(
        String(50), nullable=False, index=True
    )  # preference, filter 등
    options = Column(Text, nullable=True)  # JSON 형태의 옵션들
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Question(text='{self.text[:50]}...', type='{self.question_type}')>"

import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class UserAnswer(Base):
    """사용자 답변 모델"""

    __tablename__ = "user_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )  # 익명 사용자 허용
    question_id = Column(
        UUID(as_uuid=True), ForeignKey("questions.id"), nullable=True
    )  # 일반 답변 허용
    answer = Column(Text, nullable=False)  # 사용자의 답변
    session_id = Column(String(100), nullable=True, index=True)  # 세션 식별자
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 연관관계
    user = relationship("User", back_populates="answers")
    question = relationship("Question")

    def __repr__(self):
        return (
            f"<UserAnswer(user_id='{self.user_id}', question_id='{self.question_id}')>"
        )

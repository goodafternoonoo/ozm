import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Recommendation(Base):
    """추천 기록 모델"""

    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    menu_id = Column(UUID(as_uuid=True), ForeignKey("menus.id"), nullable=False)
    session_id = Column(String(100), nullable=True, index=True)
    recommendation_type = Column(
        String(50), nullable=False, index=True
    )  # simple, quiz, personalized 등
    score = Column(Float, nullable=True)  # 추천 점수
    reason = Column(Text, nullable=True)  # 추천 이유
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 연관관계
    user = relationship("User", back_populates="recommendations")
    menu = relationship("Menu", back_populates="recommendations")

    def __repr__(self):
        return f"<Recommendation(menu_id='{self.menu_id}', type='{self.recommendation_type}')>"

import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
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


class RecommendationLog(Base):
    """추천 로그 모델 (A/B 테스트 및 상세 정보 저장)"""

    __tablename__ = "recommendation_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=False, index=True)
    ab_group = Column(String(50), nullable=True)  # A/B 테스트 그룹
    weight_set = Column(Text, nullable=True)  # 가중치 세트 (JSON)
    recommended_menus = Column(Text, nullable=True)  # 추천된 메뉴 리스트 (JSON)
    action_type = Column(String(50), nullable=False)  # 추천 타입
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 연관관계
    user = relationship("User", back_populates="recommendation_logs")

    def __repr__(self):
        return f"<RecommendationLog(session_id='{self.session_id}', action_type='{self.action_type}')>"

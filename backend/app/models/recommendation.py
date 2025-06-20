from sqlalchemy import Column, String, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(100), nullable=False, index=True)
    user_answers = Column(JSON)  # 사용자 답변
    recommended_menus = Column(JSON)  # 추천된 메뉴들
    recommendation_type = Column(String(50))  # 'simple' 또는 'quiz'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<RecommendationLog(session_id='{self.session_id}', type='{self.recommendation_type}')>"

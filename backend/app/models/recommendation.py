import uuid
from sqlalchemy import Column, String, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import sqlalchemy.types as types
from datetime import datetime


class GUID(types.TypeDecorator):
    """플랫폼에 따라 UUID를 String으로 변환 (PostgreSQL/SQLite 호환)"""

    impl = String(36)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        return value


class RecommendationLog(Base):
    """추천 결과 로그 테이블"""

    __tablename__ = "recommendation_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(100), nullable=False, index=True)
    user_answers = Column(JSON)  # 사용자 답변
    recommended_menus = Column(JSON)  # 추천된 메뉴들
    recommendation_type = Column(String(50))  # 'simple' 또는 'quiz'
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<RecommendationLog(session_id='{self.session_id}', type='{self.recommendation_type}')>"

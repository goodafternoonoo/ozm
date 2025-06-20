import uuid
from sqlalchemy import Column, Integer, String, Text, JSON
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


class Question(Base):
    """
    추천 질문 테이블
    - options: 선택지 목록(JSON)
    - weight_map: 각 답변별 가중치(JSON)
    """

    __tablename__ = "questions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    text = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    options = Column(JSON, nullable=False)  # 선택지 목록
    weight_map = Column(JSON)  # 각 답변의 가중치 맵
    category = Column(String(50), nullable=True)

    def __repr__(self):
        return f"<Question(text='{self.text[:30]}...', order={self.order})>"

from sqlalchemy import Column, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(Text, nullable=False)
    order = Column(Integer, nullable=False)
    options = Column(JSON)  # 선택지들을 JSON으로 저장
    weight_map = Column(JSON)  # 각 답변의 가중치 맵

    def __repr__(self):
        return f"<Question(text='{self.text[:30]}...', order={self.order})>"

import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Category(Base):
    """
    음식 카테고리 테이블
    - 각 메뉴와 1:N 관계
    - color_code: 프론트엔드 시각 구분용 색상 코드(예: #FF5733)
    """

    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    country = Column(String(50), nullable=False, index=True)
    cuisine_type = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)  # 표시 순서
    icon_url = Column(String(500), nullable=True)
    color_code = Column(String(7), nullable=True)  # HEX 색상 코드
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 메뉴와의 관계
    menus = relationship(
        "Menu", back_populates="category", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Category(name='{self.name}', country='{self.country}')>"

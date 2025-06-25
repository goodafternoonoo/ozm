import enum
import uuid

import sqlalchemy.types as types
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TimeSlot(enum.Enum):
    """
    메뉴 제공 시간대 구분 (아침/점심/저녁)
    """

    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class GUID(types.TypeDecorator):
    """
    플랫폼에 따라 UUID를 String으로 변환 (PostgreSQL/SQLite 호환)
    """

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


class Menu(Base):
    """
    음식 메뉴 테이블
    - category_id: 카테고리와 N:1 관계
    - 영양 정보, 속성, 이미지 등 포함
    """

    __tablename__ = "menus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    time_slot = Column(
        String(20), nullable=False, index=True
    )  # breakfast, lunch, dinner, snack

    # 메뉴 속성
    is_spicy = Column(Boolean, default=False, index=True)
    is_healthy = Column(Boolean, default=False, index=True)
    is_vegetarian = Column(Boolean, default=False, index=True)
    is_quick = Column(Boolean, default=False, index=True)  # 빠른 조리
    has_rice = Column(Boolean, default=False, index=True)
    has_soup = Column(Boolean, default=False, index=True)
    has_meat = Column(Boolean, default=False, index=True)

    # 추가: 재료, 조리시간, 요리타입, 매운맛, 표시순서, 활성화
    ingredients = Column(String(1000), nullable=True)
    cooking_time = Column(Integer, nullable=True)
    cuisine_type = Column(String(50), nullable=True)
    spicy_level = Column(Integer, nullable=True)
    display_order = Column(Integer, nullable=True, index=True)
    is_active = Column(Boolean, default=True, index=True)

    # 영양 정보
    calories = Column(Integer, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)

    # 기타 정보
    prep_time = Column(Integer, nullable=True)  # 조리 시간 (분)
    difficulty = Column(String(20), nullable=True, index=True)  # easy, medium, hard
    rating = Column(Float, default=0.0)
    image_url = Column(String(500), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # 카테고리 연관관계
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="menus")

    # 연관관계
    favorites = relationship(
        "Favorite", back_populates="menu", cascade="all, delete-orphan"
    )
    interactions = relationship(
        "UserInteraction", back_populates="menu", cascade="all, delete-orphan"
    )
    recommendations = relationship(
        "Recommendation", back_populates="menu", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Menu(name='{self.name}', time_slot='{self.time_slot}')>"

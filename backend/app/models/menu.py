import uuid
import enum
import sqlalchemy.types as types
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Float,
    Enum as SQLEnum,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class TimeSlot(enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class GUID(types.TypeDecorator):
    """플랫폼에 따라 UUID를 String으로 변환"""

    impl = String(36)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        return value


class Menu(Base):
    __tablename__ = "menus"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    time_slot = Column(String(9), nullable=False, index=True)

    # 메뉴 속성들
    is_spicy = Column(Boolean, default=False)
    is_healthy = Column(Boolean, default=False)
    is_vegetarian = Column(Boolean, default=False)
    is_quick = Column(Boolean, default=False)
    has_rice = Column(Boolean, default=False)
    has_soup = Column(Boolean, default=False)
    has_meat = Column(Boolean, default=False)

    # 영양 정보
    calories = Column(Integer, default=0)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)

    # 메타 정보
    prep_time = Column(Integer, default=0)  # 준비 시간 (분)
    difficulty = Column(String(50), default="easy")  # 1-5 난이도
    rating = Column(Float, default=0.0)
    image_url = Column(String(255))

    # 카테고리와의 관계
    category_id = Column(GUID(), ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="menus")

    def __repr__(self):
        return f"<Menu(name='{self.name}', time_slot='{self.time_slot}')>"

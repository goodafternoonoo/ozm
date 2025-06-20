from sqlalchemy import Column, Integer, String, Text, Boolean, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid
import enum

class TimeSlot(enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"

class Menu(Base):
    __tablename__ = "menus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    time_slot = Column(SQLEnum(TimeSlot), nullable=False, index=True)

    # 메뉴 속성들
    is_spicy = Column(Boolean, default=False)
    is_healthy = Column(Boolean, default=False)
    is_vegetarian = Column(Boolean, default=False)
    is_quick = Column(Boolean, default=False)
    has_rice = Column(Boolean, default=False)
    has_soup = Column(Boolean, default=False)
    has_meat = Column(Boolean, default=False)

    # 영양 정보
    calories = Column(Integer)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)

    # 메타 정보
    prep_time = Column(Integer)  # 준비 시간 (분)
    difficulty = Column(Integer)  # 1-5 난이도
    rating = Column(Float, default=0.0)
    image_url = Column(String(255))

    def __repr__(self):
        return f"<Menu(name='{self.name}', time_slot='{self.time_slot}')>"

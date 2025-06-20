from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
import uuid


class TimeSlot(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class MenuBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    time_slot: TimeSlot
    is_spicy: bool = False
    is_healthy: bool = False
    is_vegetarian: bool = False
    is_quick: bool = False
    has_rice: bool = False
    has_soup: bool = False
    has_meat: bool = False
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    prep_time: Optional[int] = None
    difficulty: Optional[str] = "easy"
    rating: Optional[float] = Field(0.0, ge=0.0, le=5.0)
    image_url: Optional[str] = None
    category_id: Optional[uuid.UUID] = None


class MenuCreate(MenuBase):
    pass


class MenuUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    time_slot: Optional[TimeSlot] = None
    is_spicy: Optional[bool] = None
    is_healthy: Optional[bool] = None
    is_vegetarian: Optional[bool] = None
    is_quick: Optional[bool] = None
    has_rice: Optional[bool] = None
    has_soup: Optional[bool] = None
    has_meat: Optional[bool] = None
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    prep_time: Optional[int] = None
    difficulty: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    image_url: Optional[str] = None


class Menu(MenuBase):
    id: uuid.UUID
    category_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class MenuRecommendation(BaseModel):
    menu: Menu
    score: float
    reason: str

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
import uuid
from datetime import datetime


class TimeSlot(str, Enum):
    """메뉴 제공 시간대 구분"""

    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class MenuBase(BaseModel):
    """메뉴 공통 필드"""

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
    """메뉴 생성 요청 스키마"""

    # 별도 필드 없음 (MenuBase 상속)
    ...


class MenuUpdate(BaseModel):
    """메뉴 수정 요청 스키마 (부분 업데이트)"""

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
    """메뉴 응답 스키마"""

    id: uuid.UUID
    category_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class MenuRecommendation(BaseModel):
    """추천 결과용 메뉴 + 점수/이유"""

    menu: Menu
    score: float
    reason: str


# 즐겨찾기(찜) 관련 스키마
class FavoriteBase(BaseModel):
    """즐겨찾기(찜) 공통 필드 (user_id 기반)"""

    user_id: uuid.UUID
    menu_id: uuid.UUID


class FavoriteCreate(FavoriteBase):
    """즐겨찾기(찜) 생성 요청 스키마 (user_id 기반)"""

    pass


class FavoriteResponse(FavoriteBase):
    """즐겨찾기(찜) 응답 스키마 (user_id 기반)"""

    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


MenuResponse = Menu

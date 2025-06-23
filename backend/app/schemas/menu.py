from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
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

    name: str = Field(..., min_length=1, max_length=100, description="메뉴 이름")
    description: Optional[str] = Field(None, max_length=500, description="메뉴 설명")
    time_slot: TimeSlot = Field(..., description="시간대 (breakfast/lunch/dinner)")
    is_spicy: Optional[bool] = Field(None, description="매운맛 여부")
    is_healthy: Optional[bool] = Field(None, description="건강식 여부")
    is_vegetarian: Optional[bool] = Field(None, description="채식 여부")
    is_quick: Optional[bool] = Field(None, description="빠른 조리 여부")
    has_rice: Optional[bool] = Field(None, description="밥 포함 여부")
    has_soup: Optional[bool] = Field(None, description="국물 포함 여부")
    has_meat: Optional[bool] = Field(None, description="고기 포함 여부")
    ingredients: Optional[str] = Field(None, max_length=1000, description="재료 목록")
    cooking_time: Optional[int] = Field(None, ge=1, le=480, description="조리 시간(분)")
    difficulty: Optional[str] = Field(None, description="난이도 (쉬움/보통/어려움)")
    cuisine_type: Optional[str] = Field(None, description="요리 타입")
    spicy_level: Optional[int] = Field(
        None, ge=0, le=5, description="매운맛 레벨 (0-5)"
    )
    calories: Optional[int] = Field(None, ge=0, description="칼로리")
    protein: Optional[float] = Field(None, ge=0, description="단백질(g)")
    carbs: Optional[float] = Field(None, ge=0, description="탄수화물(g)")
    fat: Optional[float] = Field(None, ge=0, description="지방(g)")
    prep_time: Optional[int] = Field(None, ge=1, le=480, description="준비 시간(분)")
    rating: Optional[float] = Field(None, ge=0, le=5, description="평점 (0-5)")
    image_url: Optional[str] = Field(None, description="이미지 URL")
    display_order: Optional[int] = Field(None, ge=0, description="표시 순서")
    is_active: bool = Field(True, description="활성화 여부")


class MenuCreate(MenuBase):
    """메뉴 생성 요청 스키마"""

    category_id: uuid.UUID = Field(..., description="카테고리 ID")


class MenuUpdate(BaseModel):
    """메뉴 업데이트 요청 스키마"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    ingredients: Optional[str] = Field(None, max_length=1000)
    cooking_time: Optional[int] = Field(None, ge=1, le=480)
    difficulty: Optional[str] = None
    cuisine_type: Optional[str] = None
    spicy_level: Optional[int] = Field(None, ge=0, le=5)
    is_healthy: Optional[bool] = None
    is_vegetarian: Optional[bool] = None
    calories: Optional[int] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbs: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None


class MenuResponse(MenuBase):
    """메뉴 응답 스키마"""

    id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MenuSearchResponse(BaseModel):
    """메뉴 검색 응답 스키마"""

    items: List[MenuResponse]
    total: int
    skip: int
    limit: int


class MenuRecommendation(BaseModel):
    """추천 결과용 메뉴 + 점수/이유"""

    menu: MenuResponse
    score: float
    reason: str


# 즐겨찾기(찜) 관련 스키마
class FavoriteBase(BaseModel):
    """즐겨찾기 공통 필드"""

    user_id: uuid.UUID
    menu_id: uuid.UUID


class FavoriteCreate(BaseModel):
    """즐겨찾기 생성 요청 스키마"""

    menu_id: uuid.UUID = Field(..., description="메뉴 ID")


class FavoriteResponse(FavoriteBase):
    """즐겨찾기 응답 스키마"""

    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

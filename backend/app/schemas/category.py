from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="카테고리 이름")
    description: Optional[str] = Field(None, description="카테고리 설명")
    country: str = Field(
        ..., min_length=1, max_length=50, description="국가 (한국, 중국, 일본 등)"
    )
    cuisine_type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="요리 타입 (한식, 중식, 일식, 양식 등)",
    )
    is_active: bool = Field(True, description="활성화 여부")
    display_order: int = Field(0, ge=0, description="표시 순서")
    icon_url: Optional[str] = Field(
        None, max_length=255, description="아이콘 이미지 URL"
    )
    color_code: Optional[str] = Field(
        None, pattern=r"^#[0-9A-Fa-f]{6}$", description="색상 코드 (예: #FF5733)"
    )


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    country: Optional[str] = Field(None, min_length=1, max_length=50)
    cuisine_type: Optional[str] = Field(None, min_length=1, max_length=50)
    is_active: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)
    icon_url: Optional[str] = Field(None, max_length=255)
    color_code: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class CategoryResponse(CategoryBase):
    id: UUID
    menu_count: Optional[int] = Field(None, description="해당 카테고리의 메뉴 개수")

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    categories: List[CategoryResponse]
    total_count: int
    page: int
    size: int

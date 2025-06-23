from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.db.database import get_db
from app.services.category_service import CategoryService
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
)
from app.schemas.common import succeed_response, error_response
from app.schemas.error_codes import ErrorCode
from app.models.category import Category
from app.core.utils import category_to_dict

router = APIRouter()


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate, db: AsyncSession = Depends(get_db)
):
    """
    새로운 카테고리 생성
    - 입력: CategoryCreate
    - 출력: CategoryResponse
    """
    service = CategoryService(db)
    try:
        category = await service.create_category(category_data)
    except ValueError as e:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(str(e), code=400, error_code="CATEGORY_ALREADY_EXISTS")
            ),
            status_code=400,
        )
    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                CategoryResponse.model_validate(category_to_dict(category))
            )
        ),
        status_code=status.HTTP_201_CREATED,
    )


@router.get("/", response_model=CategoryListResponse)
async def get_categories(
    page: int = Query(1, ge=1, description="페이지 번호"),
    size: int = Query(20, ge=1, le=100, description="페이지 크기"),
    country: Optional[str] = Query(None, description="국가 필터"),
    cuisine_type: Optional[str] = Query(None, description="요리 타입 필터"),
    include_menu_count: bool = Query(False, description="메뉴 개수 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    카테고리 목록 조회 (필터링/페이징)
    - include_menu_count: True면 각 카테고리별 메뉴 개수 포함
    """
    service = CategoryService(db)
    skip = (page - 1) * size

    if include_menu_count:
        categories_data = await service.get_categories_with_menu_count(skip, size)
        categories = [
            CategoryResponse(
                id=cat["id"],
                name=cat["name"],
                description=cat["description"],
                country=cat["country"],
                cuisine_type=cat["cuisine_type"],
                is_active=cat["is_active"],
                display_order=cat["display_order"],
                icon_url=cat["icon_url"],
                color_code=cat["color_code"],
                menu_count=cat["menu_count"],
            )
            for cat in categories_data
        ]
    else:
        categories = await service.get_categories(
            skip=skip,
            limit=size,
            country=country,
            cuisine_type=cuisine_type,
            is_active=True,
        )
        categories = [
            CategoryResponse.model_validate(category_to_dict(cat)) for cat in categories
        ]

    total_count = await service.get_total_count(country, cuisine_type)

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                CategoryListResponse(
                    categories=categories, total_count=total_count, page=page, size=size
                )
            )
        ),
        status_code=status.HTTP_200_OK,
    )


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    특정 카테고리 상세 조회
    - 입력: category_id
    - 출력: CategoryResponse
    """
    service = CategoryService(db)
    category = await service.get_category_by_id(category_id)

    if not category:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    "카테고리를 찾을 수 없습니다.",
                    code=404,
                    error_code=ErrorCode.CATEGORY_NOT_FOUND,
                )
            ),
            status_code=404,
        )

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                CategoryResponse.model_validate(category_to_dict(category))
            )
        ),
        status_code=status.HTTP_200_OK,
    )


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID, category_data: CategoryUpdate, db: AsyncSession = Depends(get_db)
):
    """카테고리 수정"""
    service = CategoryService(db)
    category = await service.update_category(category_id, category_data)

    if not category:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    "카테고리를 찾을 수 없습니다.",
                    code=404,
                    error_code=ErrorCode.CATEGORY_NOT_FOUND,
                )
            ),
            status_code=404,
        )

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                CategoryResponse.model_validate(category_to_dict(category))
            )
        ),
        status_code=status.HTTP_200_OK,
    )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: UUID, db: AsyncSession = Depends(get_db)):
    """카테고리 삭제 (비활성화)"""
    service = CategoryService(db)
    success = await service.delete_category(category_id)

    if not success:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    "카테고리를 찾을 수 없습니다.",
                    code=404,
                    error_code=ErrorCode.CATEGORY_NOT_FOUND,
                )
            ),
            status_code=404,
        )

    return JSONResponse(
        content=jsonable_encoder(succeed_response()),
        status_code=status.HTTP_204_NO_CONTENT,
    )


@router.get("/country/{country}", response_model=List[CategoryResponse])
async def get_categories_by_country(country: str, db: AsyncSession = Depends(get_db)):
    """국가별 카테고리 조회"""
    service = CategoryService(db)
    categories = await service.get_categories_by_country(country)
    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                [
                    CategoryResponse.model_validate(category_to_dict(cat))
                    for cat in categories
                ]
            )
        ),
        status_code=status.HTTP_200_OK,
    )


@router.get("/cuisine/{cuisine_type}", response_model=List[CategoryResponse])
async def get_categories_by_cuisine_type(
    cuisine_type: str, db: AsyncSession = Depends(get_db)
):
    """요리 타입별 카테고리 조회"""
    service = CategoryService(db)
    categories = await service.get_categories_by_cuisine_type(cuisine_type)
    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                [
                    CategoryResponse.model_validate(category_to_dict(cat))
                    for cat in categories
                ]
            )
        ),
        status_code=status.HTTP_200_OK,
    )

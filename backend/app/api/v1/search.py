from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.utils import menu_to_dict
from app.db.database import AsyncSessionLocal
from app.models.category import Category
from app.models.menu import Menu
from app.schemas.common import error_response, succeed_response
from app.schemas.menu import MenuResponse

router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/menus", response_model=List[MenuResponse])
async def search_menus(
    q: Optional[str] = Query(None, description="검색어"),
    time_slot: Optional[str] = Query(None, description="시간대 (breakfast/lunch/dinner)"),
    is_spicy: Optional[bool] = Query(None, description="매운맛 여부"),
    is_healthy: Optional[bool] = Query(None, description="건강식 여부"),
    is_vegetarian: Optional[bool] = Query(None, description="채식 여부"),
    is_quick: Optional[bool] = Query(None, description="빠른조리 여부"),
    has_rice: Optional[bool] = Query(None, description="밥류 여부"),
    has_soup: Optional[bool] = Query(None, description="국물요리 여부"),
    has_meat: Optional[bool] = Query(None, description="고기요리 여부"),
    difficulty: Optional[str] = Query(None, description="난이도 (easy/medium/hard)"),
    min_calories: Optional[int] = Query(None, description="최소 칼로리"),
    max_calories: Optional[int] = Query(None, description="최대 칼로리"),
    min_rating: Optional[float] = Query(None, description="최소 평점"),
    category_id: Optional[str] = Query(None, description="카테고리 ID"),
    country: Optional[str] = Query(None, description="국가"),
    cuisine_type: Optional[str] = Query(None, description="요리 타입"),
    limit: int = Query(20, description="결과 개수 제한"),
    offset: int = Query(0, description="페이지 오프셋"),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 검색 및 필터링"""

    # 기본 쿼리 생성
    query = (
        select(Menu)
        .options(selectinload(Menu.category))
        .join(Category, Menu.category_id == Category.id)
    )
    conditions = []

    # 검색어 필터
    if q:
        search_condition = or_(
            Menu.name.contains(q),
            Menu.description.contains(q),
            Category.name.contains(q),
        )
        conditions.append(search_condition)

    # 시간대 필터
    if time_slot:
        conditions.append(Menu.time_slot == time_slot)

    # 속성 필터들
    if is_spicy is not None:
        conditions.append(Menu.is_spicy == is_spicy)
    if is_healthy is not None:
        conditions.append(Menu.is_healthy == is_healthy)
    if is_vegetarian is not None:
        conditions.append(Menu.is_vegetarian == is_vegetarian)
    if is_quick is not None:
        conditions.append(Menu.is_quick == is_quick)
    if has_rice is not None:
        conditions.append(Menu.has_rice == has_rice)
    if has_soup is not None:
        conditions.append(Menu.has_soup == has_soup)
    if has_meat is not None:
        conditions.append(Menu.has_meat == has_meat)

    # 난이도 필터
    if difficulty:
        conditions.append(Menu.difficulty == difficulty)

    # 칼로리 범위 필터
    if min_calories is not None:
        conditions.append(Menu.calories >= min_calories)
    if max_calories is not None:
        conditions.append(Menu.calories <= max_calories)

    # 평점 필터
    if min_rating is not None:
        conditions.append(Menu.rating >= min_rating)

    # 카테고리 필터
    if category_id:
        conditions.append(Menu.category_id == category_id)
    if country:
        conditions.append(Category.country == country)
    if cuisine_type:
        conditions.append(Category.cuisine_type == cuisine_type)

    # 조건 적용
    if conditions:
        query = query.where(and_(*conditions))

    # 정렬 및 페이징
    query = query.order_by(Menu.rating.desc(), Menu.name.asc())
    query = query.offset(offset).limit(limit)

    # 실행
    result = await db.execute(query)
    menus = result.scalars().all()

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                [MenuResponse.model_validate(menu_to_dict(menu)) for menu in menus]
            )
        ),
        status_code=200,
    )


@router.get("/categories", response_model=List[dict])
async def search_categories(
    country: Optional[str] = Query(None, description="국가"),
    cuisine_type: Optional[str] = Query(None, description="요리 타입"),
    is_active: Optional[bool] = Query(True, description="활성 상태"),
    db: AsyncSession = Depends(get_db),
):
    """카테고리 검색"""

    query = select(Category)
    conditions = []

    if country:
        conditions.append(Category.country == country)
    if cuisine_type:
        conditions.append(Category.cuisine_type == cuisine_type)
    if is_active is not None:
        conditions.append(Category.is_active == is_active)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(Category.display_order.asc(), Category.name.asc())

    result = await db.execute(query)
    categories = result.scalars().all()

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                [
                    {
                        "id": cat.id,
                        "name": cat.name,
                        "description": cat.description,
                        "country": cat.country,
                        "cuisine_type": cat.cuisine_type,
                        "color_code": cat.color_code,
                        "icon_url": cat.icon_url,
                    }
                    for cat in categories
                ]
            )
        ),
        status_code=200,
    )


@router.get("/stats", response_model=dict)
async def get_search_stats(db: AsyncSession = Depends(get_db)):
    """검색 통계 정보"""

    # 전체 메뉴 수
    menu_count_result = await db.execute(select(Menu))
    total_menus = len(menu_count_result.scalars().all())

    # 시간대별 메뉴 수
    time_slot_stats = {}
    for time_slot in ["breakfast", "lunch", "dinner"]:
        result = await db.execute(select(Menu).where(Menu.time_slot == time_slot))
        time_slot_stats[time_slot] = len(result.scalars().all())

    # 국가별 메뉴 수
    country_stats_result = await db.execute(
        select(Category.country, Menu.id).join(Menu, Category.id == Menu.category_id)
    )
    country_stats = {}
    for country, menu_id in country_stats_result.all():
        if country not in country_stats:
            country_stats[country] = 0
        country_stats[country] += 1

    # 평균 평점
    rating_result = await db.execute(select(Menu.rating))
    ratings = [r for r in rating_result.scalars().all() if r is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                {
                    "total_menus": total_menus,
                    "time_slot_distribution": time_slot_stats,
                    "country_distribution": country_stats,
                    "average_rating": round(avg_rating, 2),
                }
            )
        ),
        status_code=200,
    )

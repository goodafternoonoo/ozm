import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite import Favorite
from app.models.menu import Menu
from app.repositories.base_repository import BaseRepository


class MenuRepository(BaseRepository[Menu]):
    """
    메뉴 도메인 특화 레포지토리
    """

    def __init__(self, db: AsyncSession):
        super().__init__(db, Menu)

    async def get_by_id_with_category(self, menu_id: uuid.UUID) -> Optional[Menu]:
        """카테고리와 함께 메뉴 조회"""
        stmt = (
            select(Menu).options(selectinload(Menu.category)).where(Menu.id == menu_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_with_category(self, skip: int = 0, limit: int = 50) -> List[Menu]:
        """카테고리와 함께 모든 메뉴 조회"""
        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(Menu.is_active)
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_menus_by_category(
        self, category_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Menu]:
        """카테고리별 메뉴 조회"""
        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(Menu.category_id == category_id, Menu.is_active)
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def search_menus(
        self,
        query: str,
        category_id: Optional[uuid.UUID] = None,
        cuisine_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        cooking_time: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Menu]:
        """메뉴 검색 (다중 조건 지원)"""
        conditions = []
        if query:
            search_condition = or_(
                Menu.name.ilike(f"%{query}%"),
                Menu.description.ilike(f"%{query}%"),
                Menu.ingredients.ilike(f"%{query}%"),
            )
            conditions.append(search_condition)
        filters = {
            "category_id": category_id,
            "cuisine_type": cuisine_type,
            "difficulty": difficulty,
        }
        for field, value in filters.items():
            if value is not None:
                conditions.append(getattr(Menu, field) == value)
        if cooking_time:
            conditions.append(Menu.cooking_time <= cooking_time)
        conditions.append(Menu.is_active)
        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(and_(*conditions))
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_popular_menus(self, limit: int = 10) -> List[Menu]:
        """인기 메뉴 조회 (즐겨찾기 수 기준)"""
        stmt = (
            select(Menu, func.count(Favorite.id).label("favorite_count"))
            .options(selectinload(Menu.category))
            .outerjoin(Favorite, Menu.id == Favorite.menu_id)
            .where(Menu.is_active)
            .group_by(Menu.id)
            .order_by(func.count(Favorite.id).desc(), Menu.name)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return [row[0] for row in result.all()]

    async def get_menus_by_attributes(
        self,
        attributes: Dict[str, Any],
        skip: int = 0,
        limit: int = 50,
    ) -> List[Menu]:
        """속성별 메뉴 조회"""
        conditions = [Menu.is_active]
        attribute_filters = {
            "spicy_level": Menu.spicy_level,
            "is_healthy": Menu.is_healthy,
            "is_vegetarian": Menu.is_vegetarian,
        }
        for attr, value in attributes.items():
            if attr in attribute_filters and value is not None:
                if attr == "is_quick" and value:
                    conditions.append(Menu.cooking_time <= 30)
                else:
                    conditions.append(attribute_filters[attr] == value)
        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(and_(*conditions))
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

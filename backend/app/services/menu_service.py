import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.cache import cached
from app.models.favorite import Favorite
from app.models.menu import Menu
from app.services.base_service import BaseService
from app.core.exceptions import NotFoundException


class MenuService(BaseService[Menu]):
    """메뉴 관련 서비스"""

    def __init__(self):
        super().__init__(Menu)

    def _build_menu_query(self, load_category: bool = True, active_only: bool = True):
        """메뉴 쿼리 빌더 - 공통 로직"""
        query = select(Menu)

        if load_category:
            query = query.options(selectinload(Menu.category))

        if active_only:
            query = query.where(Menu.is_active)

        return query.order_by(Menu.display_order, Menu.name)

    @cached(ttl=3600, key_prefix="menu_by_id")  # 1시간 캐싱
    async def get_by_id_with_category(
        self, db: AsyncSession, menu_id: uuid.UUID
    ) -> Optional[Menu]:
        """카테고리와 함께 메뉴 조회 - 캐싱 적용"""
        stmt = (
            select(Menu).options(selectinload(Menu.category)).where(Menu.id == menu_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @cached(ttl=1800, key_prefix="menu_all")  # 30분 캐싱
    async def get_all_with_category(
        self, db: AsyncSession, skip: int = 0, limit: int = 50
    ) -> List[Menu]:
        """카테고리와 함께 모든 메뉴 조회 - 캐싱 적용"""
        stmt = self._build_menu_query(load_category=True, active_only=True)
        stmt = stmt.offset(skip).limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()

    @cached(ttl=1800, key_prefix="menu_by_category")  # 30분 캐싱
    async def get_menus_by_category(
        self, db: AsyncSession, category_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Menu]:
        """카테고리별 메뉴 조회 - 캐싱 적용"""
        stmt = self._build_menu_query(load_category=True, active_only=True)
        stmt = stmt.where(Menu.category_id == category_id).offset(skip).limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def search_menus(
        self,
        db: AsyncSession,
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

        # 텍스트 검색
        if query:
            search_condition = or_(
                Menu.name.ilike(f"%{query}%"),
                Menu.description.ilike(f"%{query}%"),
                Menu.ingredients.ilike(f"%{query}%"),
            )
            conditions.append(search_condition)

        # 필터 조건들
        filters = {
            "category_id": category_id,
            "cuisine_type": cuisine_type,
            "difficulty": difficulty,
        }

        for field, value in filters.items():
            if value is not None:
                conditions.append(getattr(Menu, field) == value)

        # 조리 시간 필터
        if cooking_time:
            conditions.append(Menu.cooking_time <= cooking_time)

        # 활성 메뉴만 조회
        conditions.append(Menu.is_active)

        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(and_(*conditions))
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    @cached(ttl=900, key_prefix="menu_popular")  # 15분 캐싱
    async def get_popular_menus(self, db: AsyncSession, limit: int = 10) -> List[Menu]:
        """인기 메뉴 조회 (즐겨찾기 수 기준) - 캐싱 적용"""
        stmt = (
            select(Menu, func.count(Favorite.id).label("favorite_count"))
            .options(selectinload(Menu.category))
            .outerjoin(Favorite, Menu.id == Favorite.menu_id)
            .where(Menu.is_active)
            .group_by(Menu.id)
            .order_by(func.count(Favorite.id).desc(), Menu.name)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return [row[0] for row in result.all()]

    async def get_menus_by_attributes(
        self,
        db: AsyncSession,
        attributes: Dict[str, Any],
        skip: int = 0,
        limit: int = 50,
    ) -> List[Menu]:
        """속성별 메뉴 조회"""
        conditions = [Menu.is_active]

        # 속성 필터 매핑
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

        result = await db.execute(stmt)
        return result.scalars().all()


class FavoriteService(BaseService[Favorite]):
    """즐겨찾기 관련 서비스"""

    def __init__(self):
        super().__init__(Favorite)

    async def add_favorite(
        self, db: AsyncSession, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> Favorite:
        """즐겨찾기 추가"""
        from app.services.menu_service import menu_service

        menu = await menu_service.get_by_id(db, menu_id)
        if not menu:
            raise NotFoundException("메뉴", menu_id)
        # 중복 체크
        existing = await self.get_favorite_by_user_and_menu(db, user_id, menu_id)
        if existing:
            raise ValueError("이미 찜한 메뉴입니다.")
        favorite_data = {"user_id": user_id, "menu_id": menu_id, "is_active": True}
        try:
            return await self.create(db, favorite_data)
        except IntegrityError as e:
            await db.rollback()
            error_msg = str(e).lower()
            if "foreign key" in error_msg:
                raise NotFoundException("메뉴", menu_id)
            else:
                raise ValueError("즐겨찾기 추가에 실패했습니다.")

    async def get_favorite_by_user_and_menu(
        self, db: AsyncSession, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> Optional[Favorite]:
        """사용자와 메뉴로 즐겨찾기 조회"""
        stmt = (
            select(Favorite)
            .options(selectinload(Favorite.menu))
            .where(
                and_(
                    Favorite.user_id == user_id,
                    Favorite.menu_id == menu_id,
                    Favorite.is_active == True,
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_favorites(
        self, db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Favorite]:
        """사용자 즐겨찾기 목록 조회"""
        stmt = (
            select(Favorite)
            .options(selectinload(Favorite.menu).selectinload(Menu.category))
            .where(
                and_(
                    Favorite.user_id == user_id,
                    Favorite.is_active == True,
                )
            )
            .order_by(Favorite.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def remove_favorite(
        self, db: AsyncSession, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> bool:
        """즐겨찾기 제거 (소프트 삭제)"""
        favorite = await self.get_favorite_by_user_and_menu(db, user_id, menu_id)
        if not favorite:
            return False

        favorite.is_active = False
        await db.commit()
        return True


# 서비스 인스턴스
menu_service = MenuService()
favorite_service = FavoriteService()

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from app.models.menu import Menu
from app.models.category import Category
from app.models.favorite import Favorite
from app.services.base_service import BaseService
import uuid


class MenuService(BaseService[Menu]):
    """메뉴 관련 서비스"""

    def __init__(self):
        super().__init__(Menu)

    async def get_menus_by_category(
        self, db: AsyncSession, category_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Menu]:
        """카테고리별 메뉴 조회"""
        stmt = (
            select(Menu)
            .where(Menu.category_id == category_id)
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )
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

        # 카테고리 필터
        if category_id:
            conditions.append(Menu.category_id == category_id)

        # 요리 타입 필터
        if cuisine_type:
            conditions.append(Menu.cuisine_type == cuisine_type)

        # 난이도 필터
        if difficulty:
            conditions.append(Menu.difficulty == difficulty)

        # 조리 시간 필터
        if cooking_time:
            conditions.append(Menu.cooking_time <= cooking_time)

        # 활성 메뉴만 조회
        conditions.append(Menu.is_active == True)

        stmt = (
            select(Menu)
            .where(and_(*conditions))
            .order_by(Menu.display_order, Menu.name)
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_popular_menus(self, db: AsyncSession, limit: int = 10) -> List[Menu]:
        """인기 메뉴 조회 (즐겨찾기 수 기준)"""
        stmt = (
            select(Menu, func.count(Favorite.id).label("favorite_count"))
            .outerjoin(Favorite, Menu.id == Favorite.menu_id)
            .where(Menu.is_active == True)
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
        conditions = [Menu.is_active == True]

        # 매운맛 필터
        if attributes.get("spicy_level"):
            conditions.append(Menu.spicy_level == attributes["spicy_level"])

        # 건강식 필터
        if attributes.get("is_healthy"):
            conditions.append(Menu.is_healthy == attributes["is_healthy"])

        # 채식 필터
        if attributes.get("is_vegetarian"):
            conditions.append(Menu.is_vegetarian == attributes["is_vegetarian"])

        # 빠른조리 필터
        if attributes.get("is_quick"):
            conditions.append(Menu.cooking_time <= 30)

        stmt = (
            select(Menu)
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
        # 중복 체크
        existing = await self.get_favorite_by_user_and_menu(db, user_id, menu_id)
        if existing:
            raise ValueError("이미 찜한 메뉴입니다.")

        favorite_data = {"user_id": user_id, "menu_id": menu_id, "is_active": True}
        return await self.create(db, favorite_data)

    async def get_favorite_by_user_and_menu(
        self, db: AsyncSession, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> Optional[Favorite]:
        """사용자와 메뉴로 즐겨찾기 조회"""
        stmt = select(Favorite).where(
            and_(
                Favorite.user_id == user_id,
                Favorite.menu_id == menu_id,
                Favorite.is_active == True,
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_favorites(
        self, db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Favorite]:
        """사용자의 즐겨찾기 목록 조회"""
        stmt = (
            select(Favorite)
            .options(selectinload(Favorite.menu))
            .where(and_(Favorite.user_id == user_id, Favorite.is_active == True))
            .order_by(Favorite.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def remove_favorite(
        self, db: AsyncSession, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> bool:
        """즐겨찾기 제거"""
        favorite = await self.get_favorite_by_user_and_menu(db, user_id, menu_id)
        if not favorite:
            return False

        # 논리적 삭제 (is_active = False)
        await self.update(db, favorite.id, {"is_active": False})
        return True


# 서비스 인스턴스 생성
menu_service = MenuService()
favorite_service = FavoriteService()

import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.cache import cached
from app.models.favorite import Favorite
from app.models.menu import Menu
from app.core.exceptions import NotFoundException
from app.repositories.menu_repository import MenuRepository
from app.repositories.favorite_repository import FavoriteRepository


class MenuService:
    """
    메뉴 관련 서비스 (Repository 패턴 적용)
    """

    def __init__(self, db: AsyncSession):
        self.menu_repository = MenuRepository(db)
        self.favorite_repository = FavoriteRepository(db)

    async def create(self, obj_in: Dict[str, Any]) -> Menu:
        return await self.menu_repository.create(obj_in)

    async def update(
        self, menu_id: uuid.UUID, obj_in: Dict[str, Any]
    ) -> Optional[Menu]:
        return await self.menu_repository.update(menu_id, obj_in)

    async def delete(self, menu_id: uuid.UUID) -> bool:
        return await self.menu_repository.delete(menu_id)

    @cached(ttl=3600, key_prefix="menu_by_id")
    async def get_by_id_with_category(self, menu_id: uuid.UUID) -> Optional[Menu]:
        return await self.menu_repository.get_by_id_with_category(menu_id)

    @cached(ttl=1800, key_prefix="menu_all")
    async def get_all_with_category(self, skip: int = 0, limit: int = 50) -> List[Menu]:
        return await self.menu_repository.get_all_with_category(skip, limit)

    @cached(ttl=1800, key_prefix="menu_by_category")
    async def get_menus_by_category(
        self, category_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Menu]:
        return await self.menu_repository.get_menus_by_category(
            category_id, skip, limit
        )

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
        return await self.menu_repository.search_menus(
            query, category_id, cuisine_type, difficulty, cooking_time, skip, limit
        )

    @cached(ttl=900, key_prefix="menu_popular")
    async def get_popular_menus(self, limit: int = 10) -> List[Menu]:
        return await self.menu_repository.get_popular_menus(limit)

    async def get_menus_by_attributes(
        self,
        attributes: Dict[str, Any],
        skip: int = 0,
        limit: int = 50,
    ) -> List[Menu]:
        return await self.menu_repository.get_menus_by_attributes(
            attributes, skip, limit
        )


class FavoriteService:
    """
    즐겨찾기 관련 서비스 (Repository 패턴 적용)
    """

    def __init__(self, db: AsyncSession):
        self.favorite_repository = FavoriteRepository(db)
        self.menu_repository = MenuRepository(db)

    async def add_favorite(self, user_id: uuid.UUID, menu_id: uuid.UUID) -> Favorite:
        menu = await self.menu_repository.get_by_id(menu_id)
        if not menu:
            raise NotFoundException("메뉴", menu_id)
        existing = await self.favorite_repository.get_favorite_by_user_and_menu(
            user_id, menu_id
        )
        if existing:
            raise ValueError("이미 찜한 메뉴입니다.")
        favorite_data = {"user_id": user_id, "menu_id": menu_id, "is_active": True}
        favorite = await self.favorite_repository.create(favorite_data)
        stmt = (
            select(Favorite)
            .options(selectinload(Favorite.menu).selectinload(Menu.category))
            .where(Favorite.id == favorite.id)
        )
        result = await self.favorite_repository.db.execute(stmt)
        return result.scalar_one()

    async def get_favorite_by_user_and_menu(
        self, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> Optional[Favorite]:
        return await self.favorite_repository.get_favorite_by_user_and_menu(
            user_id, menu_id
        )

    async def get_user_favorites(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Favorite]:
        return await self.favorite_repository.get_user_favorites(user_id, skip, limit)

    async def remove_favorite(self, user_id: uuid.UUID, menu_id: uuid.UUID) -> bool:
        favorite = await self.favorite_repository.get_favorite_by_user_and_menu(
            user_id, menu_id
        )
        if not favorite:
            return False
        await self.favorite_repository.delete(favorite.id)
        return True

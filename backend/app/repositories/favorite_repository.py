import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite import Favorite
from app.models.menu import Menu
from app.repositories.base_repository import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):
    """
    즐겨찾기 도메인 특화 레포지토리
    """

    def __init__(self, db: AsyncSession):
        super().__init__(db, Favorite)

    async def get_favorite_by_user_and_menu(
        self, user_id: uuid.UUID, menu_id: uuid.UUID
    ) -> Optional[Favorite]:
        """특정 유저와 메뉴의 즐겨찾기 조회"""
        stmt = select(Favorite).where(
            Favorite.user_id == user_id, Favorite.menu_id == menu_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_favorites(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Favorite]:
        """유저별 즐겨찾기 목록 조회"""
        stmt = (
            select(Favorite)
            .options(selectinload(Favorite.menu).selectinload(Menu.category))
            .where(Favorite.user_id == user_id, Favorite.is_active)
            .order_by(Favorite.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

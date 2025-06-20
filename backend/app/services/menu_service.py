from typing import List, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.menu import Menu, TimeSlot
from app.models.favorite import Favorite
from app.schemas.menu import MenuCreate, MenuUpdate, FavoriteCreate
import uuid
from enum import Enum


class MenuService:
    """메뉴 관련 비즈니스 로직 서비스"""

    @staticmethod
    async def get_menus_by_time_slot(
        db: AsyncSession, time_slot: Union[str, Enum], limit: int = 10
    ) -> List[Menu]:
        """시간대별 메뉴 조회"""
        slot = time_slot.value if isinstance(time_slot, Enum) else time_slot
        stmt = select(Menu).where(Menu.time_slot == slot).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_menu_by_id(db: AsyncSession, menu_id: uuid.UUID) -> Optional[Menu]:
        """ID로 메뉴 조회"""
        stmt = select(Menu).where(Menu.id == menu_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_menu(db: AsyncSession, menu_data: MenuCreate) -> Menu:
        """새 메뉴 생성"""
        db_menu = Menu(**menu_data.model_dump())
        db.add(db_menu)
        await db.commit()
        await db.refresh(db_menu)
        return db_menu

    @staticmethod
    async def update_menu(
        db: AsyncSession, menu_id: uuid.UUID, menu_data: MenuUpdate
    ) -> Optional[Menu]:
        """메뉴 업데이트"""
        stmt = select(Menu).where(Menu.id == menu_id)
        result = await db.execute(stmt)
        db_menu = result.scalar_one_or_none()
        if not db_menu:
            return None
        update_data = menu_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_menu, field, value)
        await db.commit()
        await db.refresh(db_menu)
        return db_menu

    @staticmethod
    async def delete_menu(db: AsyncSession, menu_id: uuid.UUID) -> bool:
        """메뉴 삭제"""
        stmt = select(Menu).where(Menu.id == menu_id)
        result = await db.execute(stmt)
        db_menu = result.scalar_one_or_none()
        if not db_menu:
            return False
        await db.delete(db_menu)
        await db.commit()
        return True

    @staticmethod
    async def get_all_menus(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Menu]:
        """모든 메뉴 조회 (페이징)"""
        stmt = select(Menu).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()


class FavoriteService:
    """즐겨찾기(찜) 관련 비즈니스 로직 서비스"""

    @staticmethod
    async def add_favorite(db: AsyncSession, favorite_data: FavoriteCreate) -> Favorite:
        """즐겨찾기(찜) 추가"""
        favorite = Favorite(**favorite_data.model_dump())
        db.add(favorite)
        await db.commit()
        await db.refresh(favorite)
        return favorite

    @staticmethod
    async def remove_favorite(
        db: AsyncSession,
        session_id: str = None,
        menu_id: uuid.UUID = None,
        user_id: uuid.UUID = None,
    ) -> bool:
        """즐겨찾기(찜) 삭제 (user_id 또는 session_id 기반)"""
        if user_id:
            stmt = delete(Favorite).where(
                Favorite.user_id == str(user_id), Favorite.menu_id == str(menu_id)
            )
        else:
            stmt = delete(Favorite).where(
                Favorite.session_id == session_id, Favorite.menu_id == str(menu_id)
            )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_favorites_by_session(
        db: AsyncSession, session_id: str
    ) -> List[Favorite]:
        """세션별 즐겨찾기(찜) 목록 조회"""
        stmt = select(Favorite).where(Favorite.session_id == session_id)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_favorites_by_user(
        db: AsyncSession, user_id: uuid.UUID
    ) -> List[Favorite]:
        """회원별 즐겨찾기(찜) 목록 조회"""
        stmt = select(Favorite).where(Favorite.user_id == str(user_id))
        result = await db.execute(stmt)
        return result.scalars().all()

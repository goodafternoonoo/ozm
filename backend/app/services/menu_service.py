from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.menu import Menu, TimeSlot
from app.schemas.menu import MenuCreate, MenuUpdate
import uuid

class MenuService:

    @staticmethod
    async def get_menus_by_time_slot(
        db: AsyncSession, 
        time_slot: TimeSlot, 
        limit: int = 10
    ) -> List[Menu]:
        """시간대별 메뉴 조회"""
        stmt = select(Menu).where(Menu.time_slot == time_slot).limit(limit)
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
        db: AsyncSession, 
        menu_id: uuid.UUID, 
        menu_data: MenuUpdate
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
    async def get_all_menus(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Menu]:
        """모든 메뉴 조회 (페이징)"""
        stmt = select(Menu).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

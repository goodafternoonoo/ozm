from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.menu import Menu, MenuCreate, MenuUpdate, TimeSlot
from app.services.menu_service import MenuService
import uuid

router = APIRouter()

@router.get("/", response_model=List[Menu])
async def get_menus(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """모든 메뉴 조회"""
    return await MenuService.get_all_menus(db, skip=skip, limit=limit)

@router.get("/time-slot/{time_slot}", response_model=List[Menu])
async def get_menus_by_time_slot(
    time_slot: TimeSlot,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """시간대별 메뉴 조회"""
    return await MenuService.get_menus_by_time_slot(db, time_slot, limit)

@router.get("/{menu_id}", response_model=Menu)
async def get_menu(
    menu_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """특정 메뉴 조회"""
    menu = await MenuService.get_menu_by_id(db, menu_id)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    return menu

@router.post("/", response_model=Menu, status_code=status.HTTP_201_CREATED)
async def create_menu(
    menu_data: MenuCreate,
    db: AsyncSession = Depends(get_db)
):
    """새 메뉴 생성"""
    return await MenuService.create_menu(db, menu_data)

@router.put("/{menu_id}", response_model=Menu)
async def update_menu(
    menu_id: uuid.UUID,
    menu_data: MenuUpdate,
    db: AsyncSession = Depends(get_db)
):
    """메뉴 업데이트"""
    menu = await MenuService.update_menu(db, menu_id, menu_data)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    return menu

@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(
    menu_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """메뉴 삭제"""
    success = await MenuService.delete_menu(db, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )

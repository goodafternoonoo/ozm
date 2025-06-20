from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.menu import (
    Menu,
    MenuCreate,
    MenuUpdate,
    TimeSlot,
    FavoriteCreate,
    FavoriteResponse,
)
from app.services.menu_service import MenuService, FavoriteService
import uuid

router = APIRouter()


@router.get("/", response_model=List[Menu])
async def get_menus(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    """
    모든 메뉴 목록 조회
    - 입력: skip, limit
    - 출력: List[Menu]
    """
    return await MenuService.get_all_menus(db, skip=skip, limit=limit)


@router.get("/time-slot/{time_slot}", response_model=List[Menu])
async def get_menus_by_time_slot(
    time_slot: TimeSlot, limit: int = 10, db: AsyncSession = Depends(get_db)
):
    """
    시간대별 메뉴 목록 조회
    - 입력: time_slot, limit
    - 출력: List[Menu]
    """
    return await MenuService.get_menus_by_time_slot(db, time_slot, limit)


@router.get("/{menu_id}", response_model=Menu)
async def get_menu(menu_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    특정 메뉴 상세 조회
    - 입력: menu_id
    - 출력: Menu
    """
    menu = await MenuService.get_menu_by_id(db, menu_id)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found"
        )
    return menu


@router.post("/", response_model=Menu, status_code=status.HTTP_201_CREATED)
async def create_menu(menu_data: MenuCreate, db: AsyncSession = Depends(get_db)):
    """
    새 메뉴 생성
    - 입력: MenuCreate
    - 출력: Menu
    """
    return await MenuService.create_menu(db, menu_data)


@router.put("/{menu_id}", response_model=Menu)
async def update_menu(
    menu_id: uuid.UUID, menu_data: MenuUpdate, db: AsyncSession = Depends(get_db)
):
    """
    메뉴 정보 수정
    - 입력: menu_id, MenuUpdate
    - 출력: Menu
    """
    menu = await MenuService.update_menu(db, menu_id, menu_data)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found"
        )
    return menu


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(menu_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    메뉴 삭제
    - 입력: menu_id
    - 출력: 없음(204)
    """
    success = await MenuService.delete_menu(db, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found"
        )


# ------------------- 즐겨찾기(찜) API -------------------


@router.post(
    "/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED
)
async def add_favorite(
    favorite_data: FavoriteCreate, db: AsyncSession = Depends(get_db)
):
    """
    즐겨찾기(찜) 추가
    - 입력: FavoriteCreate(session_id, menu_id)
    - 출력: FavoriteResponse
    """
    favorite = await FavoriteService.add_favorite(db, favorite_data)
    return FavoriteResponse.model_validate(favorite)


@router.delete("/favorites", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    session_id: str = Query(..., description="세션 ID"),
    menu_id: uuid.UUID = Query(..., description="찜 해제할 메뉴 ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    즐겨찾기(찜) 삭제
    - 입력: session_id, menu_id
    - 출력: 없음(204)
    """
    success = await FavoriteService.remove_favorite(db, session_id, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found"
        )


@router.get("/favorites", response_model=List[FavoriteResponse])
async def get_favorites(
    session_id: str = Query(..., description="세션 ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    세션별 즐겨찾기(찜) 목록 조회
    - 입력: session_id
    - 출력: List[FavoriteResponse]
    """
    favorites = await FavoriteService.get_favorites_by_session(db, session_id)
    return [FavoriteResponse.model_validate(fav) for fav in favorites]

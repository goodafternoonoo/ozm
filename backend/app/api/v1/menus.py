from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.menu import Menu
from app.models.favorite import Favorite
from app.schemas.menu import (
    MenuResponse,
    MenuCreate,
    MenuUpdate,
    FavoriteCreate,
    FavoriteResponse,
    MenuSearchResponse,
)
from app.services.menu_service import menu_service, favorite_service
from app.services.auth_service import get_current_user
from app.models.user import User
import uuid
from app.schemas.common import succeed_response, error_response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.schemas.error_codes import ErrorCode

router = APIRouter()


@router.post("/", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
async def create_menu(
    menu_data: MenuCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """새 메뉴 생성"""
    try:
        menu = await menu_service.create(db, menu_data.model_dump())
        return JSONResponse(
            content=jsonable_encoder(
                succeed_response(MenuResponse.model_validate(menu))
            ),
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    f"메뉴 생성 실패: {str(e)}",
                    code=400,
                    error_code=ErrorCode.MENU_CREATE_FAILED,
                )
            ),
            status_code=400,
        )


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(menu_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """ID로 메뉴 조회"""
    menu = await menu_service.get_by_id(db, menu_id, load_relationships=True)
    if not menu:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    "메뉴를 찾을 수 없습니다.",
                    code=404,
                    error_code=ErrorCode.MENU_NOT_FOUND,
                )
            ),
            status_code=404,
        )
    return JSONResponse(
        content=jsonable_encoder(succeed_response(MenuResponse.model_validate(menu)))
    )


@router.get("/", response_model=List[MenuResponse])
async def get_menus(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=100, description="가져올 레코드 수"),
    category_id: Optional[uuid.UUID] = Query(None, description="카테고리 ID"),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 목록 조회"""
    if category_id:
        menus = await menu_service.get_menus_by_category(db, category_id, skip, limit)
    else:
        menus = await menu_service.get_all(db, skip, limit, load_relationships=True)

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response([MenuResponse.model_validate(menu) for menu in menus])
        )
    )


@router.get("/search/", response_model=MenuSearchResponse)
async def search_menus(
    q: str = Query(..., description="검색어"),
    category_id: Optional[uuid.UUID] = Query(None, description="카테고리 ID"),
    cuisine_type: Optional[str] = Query(None, description="요리 타입"),
    difficulty: Optional[str] = Query(None, description="난이도"),
    cooking_time: Optional[int] = Query(None, ge=1, description="최대 조리 시간(분)"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=100, description="가져올 레코드 수"),
    db: AsyncSession = Depends(get_db),
):
    """메뉴 검색"""
    menus = await menu_service.search_menus(
        db=db,
        query=q,
        category_id=category_id,
        cuisine_type=cuisine_type,
        difficulty=difficulty,
        cooking_time=cooking_time,
        skip=skip,
        limit=limit,
    )

    total = await menu_service.count(db)

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                MenuSearchResponse(
                    items=[MenuResponse.model_validate(menu) for menu in menus],
                    total=total,
                    skip=skip,
                    limit=limit,
                )
            )
        )
    )


@router.get("/popular/", response_model=List[MenuResponse])
async def get_popular_menus(
    limit: int = Query(10, ge=1, le=50, description="가져올 레코드 수"),
    db: AsyncSession = Depends(get_db),
):
    """인기 메뉴 조회"""
    menus = await menu_service.get_popular_menus(db, limit)
    return JSONResponse(
        content=jsonable_encoder(
            succeed_response([MenuResponse.model_validate(menu) for menu in menus])
        )
    )


@router.put("/{menu_id}", response_model=MenuResponse)
async def update_menu(
    menu_id: uuid.UUID,
    menu_data: MenuUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """메뉴 업데이트"""
    menu = await menu_service.update(
        db, menu_id, menu_data.model_dump(exclude_unset=True)
    )
    if not menu:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    "메뉴를 찾을 수 없습니다.",
                    code=404,
                    error_code=ErrorCode.MENU_NOT_FOUND,
                )
            ),
            status_code=404,
        )
    return JSONResponse(
        content=jsonable_encoder(succeed_response(MenuResponse.model_validate(menu))),
        status_code=status.HTTP_200_OK,
    )


# 즐겨찾기 관련 엔드포인트
@router.post(
    "/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED
)
async def add_favorite(
    favorite_data: FavoriteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """즐겨찾기 추가"""
    try:
        favorite = await favorite_service.add_favorite(
            db, current_user.id, favorite_data.menu_id
        )
        return JSONResponse(
            content=jsonable_encoder(
                succeed_response(FavoriteResponse.model_validate(favorite))
            ),
            status_code=status.HTTP_201_CREATED,
        )
    except ValueError as e:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    str(e), code=400, error_code=ErrorCode.FAVORITE_DUPLICATE
                )
            ),
            status_code=400,
        )


@router.get("/favorites/", response_model=List[MenuResponse])
async def get_user_favorites(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=100, description="가져올 레코드 수"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자의 즐겨찾기 목록 조회"""
    favorites = await favorite_service.get_user_favorites(
        db, current_user.id, skip, limit
    )
    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                [MenuResponse.model_validate(favorite.menu) for favorite in favorites]
            )
        )
    )


@router.delete("/favorites", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    menu_id: uuid.UUID = Query(..., description="찜 해제할 메뉴 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """즐겨찾기 제거"""
    success = await favorite_service.remove_favorite(db, current_user.id, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="즐겨찾기를 찾을 수 없습니다."
        )
    return JSONResponse(
        content=jsonable_encoder(succeed_response()),
        status_code=status.HTTP_204_NO_CONTENT,
    )


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(
    menu_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """메뉴 삭제"""
    success = await menu_service.delete(db, menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="메뉴를 찾을 수 없습니다."
        )
    return JSONResponse(
        content=jsonable_encoder(succeed_response()),
        status_code=status.HTTP_204_NO_CONTENT,
    )

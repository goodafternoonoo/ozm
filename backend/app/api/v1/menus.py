import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import (
    api_created,
    api_error,
    api_no_content,
    api_not_found,
    api_success,
)
from app.core.utils import favorite_to_dict, menu_to_dict
from app.db.database import get_db
from app.models.user import User
from app.schemas.error_codes import ErrorCode
from app.schemas.menu import (
    FavoriteCreate,
    FavoriteResponse,
    MenuCreate,
    MenuResponse,
    MenuSearchResponse,
    MenuUpdate,
)
from app.services.auth_service import get_current_user
from app.services.menu_service import favorite_service, menu_service
from app.core.exceptions import NotFoundException

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
        menu_with_category = await menu_service.get_by_id_with_category(db, menu.id)
        return api_created(
            MenuResponse.model_validate(menu_to_dict(menu_with_category)),
            message="메뉴가 생성되었습니다.",
        )
    except Exception as e:
        return api_error(
            f"메뉴 생성 실패: {str(e)}",
            error_code=ErrorCode.MENU_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(menu_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """ID로 메뉴 조회"""
    menu = await menu_service.get_by_id_with_category(db, menu_id)
    if not menu:
        return api_not_found(
            "메뉴", resource_id=menu_id, error_code=ErrorCode.MENU_NOT_FOUND
        )

    return api_success(MenuResponse.model_validate(menu_to_dict(menu)))


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
        menus = await menu_service.get_all_with_category(db, skip, limit)

    return api_success(
        [MenuResponse.model_validate(menu_to_dict(menu)) for menu in menus]
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

    return api_success(
        MenuSearchResponse(
            items=[MenuResponse.model_validate(menu_to_dict(menu)) for menu in menus],
            total=total,
            skip=skip,
            limit=limit,
        )
    )


@router.get("/popular/", response_model=List[MenuResponse])
async def get_popular_menus(
    limit: int = Query(10, ge=1, le=50, description="가져올 레코드 수"),
    db: AsyncSession = Depends(get_db),
):
    """인기 메뉴 조회"""
    menus = await menu_service.get_popular_menus(db, limit)
    return api_success(
        [MenuResponse.model_validate(menu_to_dict(menu)) for menu in menus]
    )


@router.put("/{menu_id}", response_model=MenuResponse)
async def update_menu(
    menu_id: uuid.UUID,
    menu_data: MenuUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """메뉴 업데이트"""
    try:
        menu = await menu_service.update(
            db, menu_id, menu_data.model_dump(exclude_unset=True)
        )
        if not menu:
            return api_not_found(
                "메뉴", resource_id=menu_id, error_code=ErrorCode.MENU_NOT_FOUND
            )

        return api_success(
            MenuResponse.model_validate(menu_to_dict(menu)),
            message="메뉴가 업데이트되었습니다.",
        )
    except Exception as e:
        return api_error(
            f"메뉴 업데이트 실패: {str(e)}",
            error_code=ErrorCode.MENU_UPDATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
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
        return api_created(
            FavoriteResponse.model_validate(favorite_to_dict(favorite)),
            message="즐겨찾기에 추가되었습니다.",
        )
    except NotFoundException:
        return api_not_found(
            "메뉴",
            resource_id=favorite_data.menu_id,
            error_code=ErrorCode.MENU_NOT_FOUND,
        )
    except ValueError as e:
        if "이미 찜한 메뉴" in str(e):
            return api_error(str(e), error_code=ErrorCode.FAVORITE_ALREADY_EXISTS)
        else:
            return api_error(str(e), error_code=ErrorCode.INVALID_REQUEST)
    except Exception as e:
        print(f"즐겨찾기 추가 중 예외 발생: {str(e)}")
        print(f"예외 타입: {type(e)}")
        import traceback

        print(f"스택 트레이스: {traceback.format_exc()}")
        return api_error(
            "즐겨찾기 추가 중 오류가 발생했습니다.", error_code=ErrorCode.INTERNAL_ERROR
        )


@router.get("/favorites/", response_model=List[MenuResponse])
async def get_user_favorites(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=100, description="가져올 레코드 수"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자 즐겨찾기 목록 조회"""
    try:
        favorites = await favorite_service.get_user_favorites(
            db, current_user.id, skip, limit
        )
        menus = [favorite.menu for favorite in favorites if favorite.menu]
        return api_success(
            [MenuResponse.model_validate(menu_to_dict(menu)) for menu in menus]
        )
    except Exception as e:
        return api_error(
            f"즐겨찾기 목록 조회 실패: {str(e)}",
            error_code=ErrorCode.FAVORITE_GET_FAILED,
        )


@router.delete("/favorites", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    menu_id: uuid.UUID = Query(..., description="찜 해제할 메뉴 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """즐겨찾기 제거"""
    try:
        success = await favorite_service.remove_favorite(db, current_user.id, menu_id)
        if success:
            return api_no_content()
        else:
            return api_not_found(
                "즐겨찾기", resource_id=menu_id, error_code=ErrorCode.FAVORITE_NOT_FOUND
            )
    except Exception as e:
        return api_error(
            f"즐겨찾기 제거 실패: {str(e)}", error_code=ErrorCode.FAVORITE_REMOVE_FAILED
        )


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(
    menu_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """메뉴 삭제"""
    try:
        success = await menu_service.delete(db, menu_id)
        if success:
            return api_no_content()
        else:
            return api_not_found(
                "메뉴", resource_id=menu_id, error_code=ErrorCode.MENU_NOT_FOUND
            )
    except Exception as e:
        return api_error(
            f"메뉴 삭제 실패: {str(e)}", error_code=ErrorCode.MENU_DELETE_FAILED
        )

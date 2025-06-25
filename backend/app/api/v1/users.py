import uuid
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import api_success, api_error, api_created
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.schemas.error_codes import ErrorCode
from app.schemas.user import UserProfile, UserProfileUpdate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


get_current_user = AuthService.get_current_user


@router.post("/", response_model=UserResponse)
async def create_user(user_data: dict, db: AsyncSession = Depends(get_db)):
    """사용자 생성 (테스트용)"""
    try:
        # 중복 체크
        existing_user = await db.execute(
            select(User).where(User.username == user_data["username"])
        )
        if existing_user.scalar_one_or_none():
            return api_error(
                "이미 존재하는 사용자명입니다",
                error_code=ErrorCode.USER_ALREADY_EXISTS,
                status_code=400,
            )

        # 새 유저 생성
        new_user = User(
            id=uuid.uuid4(),
            username=user_data["username"],
            email=user_data["email"],
            nickname=user_data["nickname"],
            is_active=True,
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return api_created(
            UserResponse(
                id=new_user.id,
                username=new_user.username,
                email=new_user.email,
                nickname=new_user.nickname,
                created_at=new_user.created_at,
            )
        )
    except Exception:
        return api_error("사용자 생성 실패", error_code=ErrorCode.USER_ALREADY_EXISTS)


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """현재 사용자의 프로필 조회"""
    try:
        if not current_user:
            return api_error(
                "인증이 필요합니다",
                error_code=ErrorCode.AUTH_REQUIRED,
                status_code=401,
            )

        return api_success(
            UserProfile(
                id=str(current_user.id),
                nickname=current_user.nickname,
                username=current_user.username,
                email=current_user.email,
                created_at=current_user.created_at,
            )
        )
    except Exception:
        return api_error("프로필 조회 실패", error_code=ErrorCode.GENERAL_ERROR)


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """사용자 프로필 업데이트"""
    try:
        if not current_user:
            return api_error(
                "인증이 필요합니다",
                error_code=ErrorCode.AUTH_REQUIRED,
                status_code=401,
            )

        # 세션에 current_user를 붙임
        persistent_user = await db.merge(current_user)

        # 업데이트할 필드만 적용
        if profile_update.nickname is not None:
            persistent_user.nickname = profile_update.nickname
        if profile_update.username is not None:
            persistent_user.username = profile_update.username
        if profile_update.email is not None:
            persistent_user.email = profile_update.email

        await db.commit()
        await db.refresh(persistent_user)

        return api_success(
            UserProfile(
                id=str(persistent_user.id),
                nickname=persistent_user.nickname,
                username=persistent_user.username,
                email=persistent_user.email,
                created_at=persistent_user.created_at,
            )
        )
    except Exception:
        return api_error("프로필 업데이트 실패", error_code=ErrorCode.GENERAL_ERROR)


@router.get("/favorites", response_model=List[dict])
async def get_user_favorites(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """사용자의 즐겨찾기 메뉴 목록 조회"""
    try:
        if not current_user:
            return api_error(
                "인증이 필요합니다",
                error_code=ErrorCode.AUTH_REQUIRED,
                status_code=401,
            )

        from app.models.favorite import Favorite
        from app.models.menu import Menu

        # 사용자의 즐겨찾기 메뉴 조회
        result = await db.execute(
            select(Favorite, Menu)
            .join(Menu, Favorite.menu_id == Menu.id)
            .where(Favorite.user_id == current_user.id)
            .order_by(Favorite.created_at.desc())
        )

        favorites = []
        for favorite, menu in result.all():
            favorites.append(
                {
                    "id": favorite.id,
                    "menu": {
                        "id": menu.id,
                        "name": menu.name,
                        "description": menu.description,
                        "image_url": menu.image_url,
                        "rating": menu.rating,
                    },
                    "created_at": favorite.created_at,
                }
            )

        return api_success(favorites)
    except Exception:
        return api_error("즐겨찾기 조회 실패", error_code=ErrorCode.GENERAL_ERROR)

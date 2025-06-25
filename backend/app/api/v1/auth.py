from typing import Optional

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import api_success, api_error
from app.core.utils import orm_to_dict
from app.db.database import get_db
from app.schemas.error_codes import ErrorCode
from app.schemas.user import LoginResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


class KakaoLoginRequest(BaseModel):
    access_token: str


@router.post("/kakao-login", response_model=LoginResponse)
async def kakao_login(req: KakaoLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    카카오 access_token으로 로그인/회원가입
    - access_token 검증 → User 생성/조회 → JWT 발급
    - 반환: JWT 토큰 + 사용자 정보
    """
    try:
        kakao_userinfo = AuthService.verify_kakao_token(req.access_token)
    except Exception:
        return api_error(
            "카카오 인증 실패",
            error_code=ErrorCode.KAKAO_TOKEN_INVALID,
            status_code=401,
        )

    try:
        user = await AuthService.get_or_create_user_by_kakao(db, kakao_userinfo)
        jwt_token = AuthService.create_jwt_token(user)

        return api_success(
            LoginResponse(
                access_token=jwt_token,
                token_type="bearer",
                user=UserResponse.model_validate(
                    orm_to_dict(user, UserResponse.model_fields.keys())
                ),
            )
        )
    except Exception:
        return api_error("로그인 처리 실패", error_code=ErrorCode.GENERAL_ERROR)


@router.get("/me")
async def get_current_user_info(
    authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)
):
    """
    현재 로그인한 사용자 정보 조회
    - Authorization 헤더의 Bearer 토큰으로 사용자 식별
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            return api_error(
                "유효한 인증 토큰이 필요합니다",
                error_code=ErrorCode.AUTH_REQUIRED,
                status_code=401,
            )

        token = authorization.replace("Bearer ", "")

        user = await AuthService.get_current_user(db, token)
        user_data = UserResponse.model_validate(
            orm_to_dict(user, UserResponse.model_fields.keys())
        )
        return api_success(user_data)
    except Exception as e:
        return api_error(
            str(e),
            error_code=ErrorCode.USER_NOT_FOUND,
            status_code=401,
        )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    사용자 ID로 사용자 정보 조회
    - 인증된 사용자만 조회 가능
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            return api_error(
                "유효한 인증 토큰이 필요합니다",
                error_code=ErrorCode.AUTH_REQUIRED,
                status_code=401,
            )

        user = await AuthService.get_user_by_id(db, user_id)
        return api_success(
            UserResponse.model_validate(
                orm_to_dict(user, UserResponse.model_fields.keys())
            )
        )
    except Exception as e:
        return api_error(
            str(e),
            error_code=ErrorCode.USER_NOT_FOUND,
            status_code=404,
        )

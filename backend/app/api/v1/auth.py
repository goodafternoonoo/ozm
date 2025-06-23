from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserResponse, Token, LoginResponse
from app.models.user import User
from pydantic import BaseModel
from typing import Optional
from app.schemas.common import succeed_response, error_response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

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
        return JSONResponse(
            content=jsonable_encoder(error_response("카카오 인증 실패", code=401)),
            status_code=401,
        )

    user = await AuthService.get_or_create_user_by_kakao(db, kakao_userinfo)
    jwt_token = AuthService.create_jwt_token(user)

    return JSONResponse(
        content=jsonable_encoder(
            succeed_response(
                LoginResponse(
                    access_token=jwt_token,
                    token_type="bearer",
                    user=UserResponse.model_validate(user),
                )
            )
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)
):
    """
    현재 로그인한 사용자 정보 조회
    - Authorization 헤더의 Bearer 토큰으로 사용자 식별
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효한 인증 토큰이 필요합니다",
        )

    token = authorization.replace("Bearer ", "")

    try:
        user = await AuthService.get_current_user(db, token)
        return succeed_response(UserResponse.model_validate(user))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


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
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효한 인증 토큰이 필요합니다",
        )

    try:
        user = await AuthService.get_user_by_id(db, user_id)
        return succeed_response(UserResponse.model_validate(user))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

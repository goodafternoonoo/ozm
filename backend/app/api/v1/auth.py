from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserResponse, Token
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class KakaoLoginRequest(BaseModel):
    access_token: str


@router.post("/kakao-login", response_model=Token)
async def kakao_login(req: KakaoLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    카카오 access_token으로 로그인/회원가입
    - access_token 검증 → User 생성/조회 → JWT 발급
    - 반환: JWT 토큰
    """
    try:
        kakao_userinfo = AuthService.verify_kakao_token(req.access_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="카카오 인증 실패"
        )
    user = await AuthService.get_or_create_user_by_kakao(db, kakao_userinfo)
    jwt_token = AuthService.create_jwt_token(user)
    return Token(access_token=jwt_token)

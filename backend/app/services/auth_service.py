import requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.db.database import AsyncSessionLocal

KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "testsecret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7일

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/kakao-login")


async def get_db():
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


class AuthService:
    """
    카카오 access_token 검증, 사용자 정보 조회, User 저장/조회, JWT 발급 서비스
    """

    @staticmethod
    def verify_kakao_token(access_token: str) -> dict:
        """
        카카오 access_token으로 사용자 정보 조회
        - 실패 시 예외 발생
        """
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(KAKAO_USERINFO_URL, headers=headers)
        if resp.status_code != 200:
            raise Exception("카카오 토큰 검증 실패")
        return resp.json()

    @staticmethod
    async def get_or_create_user_by_kakao(
        db: AsyncSession, kakao_userinfo: dict
    ) -> User:
        """
        카카오 사용자 정보로 User 조회/생성
        """
        kakao_id = str(kakao_userinfo["id"])
        nickname = kakao_userinfo.get("properties", {}).get("nickname")
        email = kakao_userinfo.get("kakao_account", {}).get("email")
        stmt = select(User).where(User.kakao_id == kakao_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            return user
        # 신규 생성
        user = User(kakao_id=kakao_id, nickname=nickname, email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
        """
        사용자 ID로 사용자 정보 조회
        """
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise Exception("사용자를 찾을 수 없습니다")
        return user

    @staticmethod
    async def get_user_by_kakao_id(db: AsyncSession, kakao_id: str) -> User:
        """
        카카오 ID로 사용자 정보 조회
        """
        stmt = select(User).where(User.kakao_id == kakao_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise Exception("사용자를 찾을 수 없습니다")
        return user

    @staticmethod
    def create_jwt_token(user: User) -> str:
        """
        JWT(액세스 토큰) 발급
        """
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
        payload = {
            "sub": str(user.id),
            "kakao_id": user.kakao_id,
            "exp": expire,
        }
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token

    @staticmethod
    def verify_jwt_token(token: str) -> dict:
        """
        JWT 토큰 검증 및 페이로드 반환
        """
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload
        except JWTError:
            raise Exception("유효하지 않은 토큰입니다")

    @staticmethod
    async def get_current_user(
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme),
    ) -> User:
        """
        JWT 토큰으로 현재 사용자 정보 조회
        """
        try:
            payload = AuthService.verify_jwt_token(token)
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="토큰 오류"
                )
            user = await AuthService.get_user_by_id(db, user_id)
            return user
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패"
            )

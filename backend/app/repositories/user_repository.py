from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    유저 도메인 특화 레포지토리
    """

    def __init__(self, db: AsyncSession):
        super().__init__(db, User)

    async def get_user_by_kakao_id(self, kakao_id: str) -> Optional[User]:
        """카카오 ID로 유저 조회"""
        stmt = select(User).where(User.kakao_id == kakao_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """이메일로 유저 조회"""
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_nickname(self, nickname: str) -> Optional[User]:
        """닉네임으로 유저 조회"""
        stmt = select(User).where(User.nickname == nickname)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

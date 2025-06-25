import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_preference import UserPreference
from app.repositories.base_repository import BaseRepository


class UserPreferenceRepository(BaseRepository[UserPreference]):
    """
    사용자 선호도 도메인 특화 레포지토리
    """

    def __init__(self, db: AsyncSession):
        super().__init__(db, UserPreference)

    async def get_by_session_or_user(
        self, session_id: str, user_id: Optional[uuid.UUID] = None
    ) -> Optional[UserPreference]:
        """세션ID 또는 유저ID로 선호도 조회"""
        stmt = (
            select(UserPreference)
            .where(
                (UserPreference.session_id == session_id)
                | (UserPreference.user_id == user_id)
            )
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_ab_group(self, ab_group: str) -> List[UserPreference]:
        """AB 그룹별 선호도 조회"""
        stmt = select(UserPreference).where(UserPreference.ab_group == ab_group)
        result = await self.db.execute(stmt)
        return result.scalars().all()

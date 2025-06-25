from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.question import Question
from app.repositories.base_repository import BaseRepository


class QuestionRepository(BaseRepository[Question]):
    """
    질문 도메인 특화 레포지토리
    """

    def __init__(self, db: AsyncSession):
        super().__init__(db, Question)

    async def get_all_questions(self) -> List[Question]:
        """모든 질문 조회 (display_order 순)"""
        stmt = select(Question).order_by(Question.display_order)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_active_questions(self) -> List[Question]:
        """활성화된 질문만 조회 (display_order 순)"""
        stmt = (
            select(Question).where(Question.is_active).order_by(Question.display_order)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_questions_by_type(self, question_type: str) -> List[Question]:
        """타입별 질문 조회 (display_order 순)"""
        stmt = (
            select(Question)
            .where(Question.question_type == question_type, Question.is_active)
            .order_by(Question.display_order)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

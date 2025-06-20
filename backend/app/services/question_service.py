from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.question import Question
from app.schemas.question import QuestionCreate


class QuestionService:
    """질문 관련 비즈니스 로직 서비스"""

    @staticmethod
    async def get_all_questions(db: AsyncSession) -> List[Question]:
        """모든 질문 조회 (order 순)"""
        stmt = select(Question).order_by(Question.order)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def create_question(
        db: AsyncSession, question_data: QuestionCreate
    ) -> Question:
        """새 질문 생성"""
        db_question = Question(**question_data.model_dump())
        db.add(db_question)
        await db.commit()
        await db.refresh(db_question)
        return db_question

from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.question import Question
from app.schemas.question import QuestionCreate
from app.repositories.question_repository import QuestionRepository


class QuestionService:
    """
    질문 관련 비즈니스 로직 서비스 (Repository 패턴 적용)
    """

    def __init__(self, db: AsyncSession):
        self.question_repository = QuestionRepository(db)

    async def get_all_questions(self) -> List[Question]:
        return await self.question_repository.get_all_questions()

    async def get_active_questions(self) -> List[Question]:
        return await self.question_repository.get_active_questions()

    async def get_questions_by_type(self, question_type: str) -> List[Question]:
        return await self.question_repository.get_questions_by_type(question_type)

    async def create_question(self, question_data: QuestionCreate) -> Question:
        db_question = Question(**question_data.model_dump())
        self.question_repository.db.add(db_question)
        await self.question_repository.db.commit()
        await self.question_repository.db.refresh(db_question)
        return db_question

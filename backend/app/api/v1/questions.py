from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.question import Question, QuestionCreate
from app.services.question_service import QuestionService
from app.schemas.common import succeed_response

router = APIRouter()


@router.get("/", response_model=List[Question])
async def get_questions(db: AsyncSession = Depends(get_db)):
    """
    모든 질문 목록 조회
    - 출력: List[Question]
    """
    return await QuestionService.get_all_questions(db)


@router.post("/", response_model=Question)
async def create_question(
    question_data: QuestionCreate, db: AsyncSession = Depends(get_db)
):
    """
    새 질문 생성
    - 입력: QuestionCreate
    - 출력: Question
    """
    return await QuestionService.create_question(db, question_data)

import re
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.response import api_success, api_error, api_created
from app.db.database import get_db
from app.schemas.error_codes import ErrorCode
from app.schemas.question import (
    AIQuestionRequest,
    AIQuestionResponse,
    Question,
    QuestionCreate,
)
from app.services.perplexity_service import perplexity_service
from app.services.question_service import QuestionService

router = APIRouter()


@router.get("/", response_model=List[Question])
async def get_questions(db: AsyncSession = Depends(get_db)):
    """
    모든 질문 목록 조회
    - 출력: List[Question]
    """
    try:
        questions = await QuestionService.get_all_questions(db)
        return api_success(questions)
    except Exception:
        return api_error("질문 목록 조회 실패", error_code=ErrorCode.GENERAL_ERROR)


@router.post("/", response_model=Question)
async def create_question(
    question_data: QuestionCreate, db: AsyncSession = Depends(get_db)
):
    """
    새 질문 생성
    - 입력: QuestionCreate
    - 출력: Question
    """
    try:
        question = await QuestionService.create_question(db, question_data)
        return api_created(question)
    except Exception:
        return api_error("질문 생성 실패", error_code=ErrorCode.GENERAL_ERROR)


@router.post("/ai-answer", response_model=AIQuestionResponse)
async def get_ai_answer(request: AIQuestionRequest, db: AsyncSession = Depends(get_db)):
    """
    AI 답변 생성 (Perplexity 기반)
    - 입력: AIQuestionRequest
    - 출력: AIQuestionResponse
    """
    try:
        # Perplexity AI 기능이 비활성화된 경우
        if not settings.perplexity_enabled or not settings.perplexity_api_key:
            return api_error(
                "AI 답변 기능이 현재 비활성화되어 있습니다.",
                error_code=ErrorCode.GENERAL_ERROR,
                status_code=503,
            )

        # AI 답변 생성
        ai_response = await perplexity_service.get_ai_response(
            user_question=request.question, context=request.context
        )

        if ai_response["success"]:
            return api_success(
                {
                    "answer": re.sub(r"\[\d+\]", "", ai_response["answer"]),
                    "model": ai_response["model"],
                    "sources": ai_response.get("sources", []),
                    "usage": ai_response.get("usage", {}),
                }
            )
        else:
            return api_error(
                ai_response["answer"],
                error_code=ErrorCode.GENERAL_ERROR,
                status_code=503,
            )

    except Exception:
        return api_error(
            "AI 답변 생성 중 오류가 발생했습니다.",
            error_code=ErrorCode.GENERAL_ERROR,
            status_code=500,
        )

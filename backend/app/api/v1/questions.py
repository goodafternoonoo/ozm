import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.question import (
    Question,
    QuestionCreate,
    AIQuestionRequest,
    AIQuestionResponse,
)
from app.services.question_service import QuestionService
from app.services.perplexity_service import perplexity_service
from app.schemas.common import succeed_response, error_response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[Question])
async def get_questions(db: AsyncSession = Depends(get_db)):
    """
    모든 질문 목록 조회
    - 출력: List[Question]
    """
    questions = await QuestionService.get_all_questions(db)
    return JSONResponse(content=jsonable_encoder(succeed_response(questions)))


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
            return JSONResponse(
                content=jsonable_encoder(
                    error_response(
                        "AI 답변 기능이 현재 비활성화되어 있습니다.",
                        503,
                        "AI_SERVICE_DISABLED",
                    )
                ),
                status_code=503,
            )

        # AI 답변 생성
        ai_response = await perplexity_service.get_ai_response(
            user_question=request.question, context=request.context
        )

        if ai_response["success"]:
            return JSONResponse(
                content=jsonable_encoder(
                    succeed_response(
                        {
                            "answer": re.sub(r"\[\d+\]", "", ai_response["answer"]),
                            "model": ai_response["model"],
                            "sources": ai_response.get("sources", []),
                            "usage": ai_response.get("usage", {}),
                        }
                    )
                )
            )
        else:
            return JSONResponse(
                content=jsonable_encoder(
                    error_response(ai_response["answer"], 503, "AI_SERVICE_ERROR")
                ),
                status_code=503,
            )

    except Exception as e:
        return JSONResponse(
            content=jsonable_encoder(
                error_response(
                    "AI 답변 생성 중 오류가 발생했습니다.",
                    500,
                    "AI_SERVICE_ERROR",
                    str(e),
                )
            ),
            status_code=500,
        )

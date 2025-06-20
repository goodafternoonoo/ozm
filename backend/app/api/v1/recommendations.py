from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.recommendation import (
    RecommendationResponse,
    SimpleRecommendationRequest,
    QuizRecommendationRequest
)
from app.services.recommendation_service import RecommendationService
from app.models.menu import TimeSlot as ModelTimeSlot
import uuid

router = APIRouter()

@router.post("/simple", response_model=RecommendationResponse)
async def get_simple_recommendations(
    request: SimpleRecommendationRequest,
    db: AsyncSession = Depends(get_db)
):
    """시간대별 간단 추천"""
    session_id = request.session_id or str(uuid.uuid4())

    recommendations = await RecommendationService.get_simple_recommendations(
        db=db,
        time_slot=ModelTimeSlot(request.time_slot),
        session_id=session_id,
        limit=5
    )

    return RecommendationResponse(
        recommendations=recommendations,
        session_id=session_id,
        total_count=len(recommendations)
    )

@router.post("/quiz", response_model=RecommendationResponse)
async def get_quiz_recommendations(
    request: QuizRecommendationRequest,
    db: AsyncSession = Depends(get_db)
):
    """질답 기반 맞춤 추천"""
    session_id = request.session_id or str(uuid.uuid4())

    if not request.answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answers are required for quiz recommendations"
        )

    recommendations = await RecommendationService.get_quiz_recommendations(
        db=db,
        answers=request.answers,
        session_id=session_id,
        limit=5
    )

    return RecommendationResponse(
        recommendations=recommendations,
        session_id=session_id,
        total_count=len(recommendations)
    )

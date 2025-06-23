from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.recommendation import (
    RecommendationResponse,
    SimpleRecommendationRequest,
    QuizRecommendationRequest,
)
from app.schemas.user_preference import (
    PreferenceAnalysis,
    UserInteractionCreate,
    CollaborativeRecommendation,
)
from app.services.recommendation_service import RecommendationService
from app.services.preference_service import PreferenceService
from app.services.auth_service import AuthService
from app.models.menu import TimeSlot as ModelTimeSlot
import uuid
from app.schemas.common import succeed_response

router = APIRouter()

# 인증 의존성
get_current_user = AuthService.get_current_user


@router.post("/simple", response_model=RecommendationResponse)
async def get_simple_recommendations(
    request: SimpleRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    시간대별 개인화 추천 (선호도 기반)
    - 기존 랜덤 추천에서 개인화된 추천으로 업그레이드
    - 사용자 선호도 학습 기반
    """
    session_id = request.session_id or str(uuid.uuid4())
    user_id = None

    # 로그인 사용자인 경우 사용자 ID 추출
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = await AuthService.get_current_user(db, token)
            user_id = user.id if user else None
        except:
            pass  # 토큰이 유효하지 않아도 세션 기반으로 진행

    recommendations = await RecommendationService.get_simple_recommendations(
        db=db,
        time_slot=ModelTimeSlot(request.time_slot),
        session_id=session_id,
        user_id=user_id,
        limit=5,
    )
    return succeed_response(
        RecommendationResponse(
            recommendations=recommendations,
            session_id=session_id,
            total_count=len(recommendations),
        )
    )


@router.post("/quiz", response_model=RecommendationResponse)
async def get_quiz_recommendations(
    request: QuizRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    고도화된 질답 기반 추천 (하이브리드)
    - 필수 조건 필터링 + 개인화 점수 + 협업 필터링
    - 사용자 선호도 자동 학습
    """
    session_id = request.session_id or str(uuid.uuid4())
    user_id = None

    # 로그인 사용자인 경우 사용자 ID 추출
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = await AuthService.get_current_user(db, token)
            user_id = user.id if user else None
        except:
            pass  # 토큰이 유효하지 않아도 세션 기반으로 진행

    recommendations = await RecommendationService.get_quiz_recommendations(
        db=db,
        answers=request.answers,
        session_id=session_id,
        user_id=user_id,
        limit=5,
    )
    return succeed_response(
        RecommendationResponse(
            recommendations=recommendations,
            session_id=session_id,
            total_count=len(recommendations),
        )
    )


@router.post("/collaborative", response_model=RecommendationResponse)
async def get_collaborative_recommendations(
    session_id: str,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    협업 필터링 기반 추천
    - 유사한 취향의 사용자들이 좋아한 메뉴 추천
    - 코사인 유사도 기반 사용자 매칭
    """
    user_id = None

    # 로그인 사용자인 경우 사용자 ID 추출
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = await AuthService.get_current_user(db, token)
            user_id = user.id if user else None
        except:
            pass

    recommendations = await RecommendationService.get_collaborative_recommendations(
        db=db,
        session_id=session_id,
        user_id=user_id,
        limit=limit,
    )
    return succeed_response(
        RecommendationResponse(
            recommendations=recommendations,
            session_id=session_id,
            total_count=len(recommendations),
        )
    )


@router.get("/preference-analysis", response_model=PreferenceAnalysis)
async def get_preference_analysis(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    사용자 선호도 분석
    - 현재 사용자의 선호도 패턴 분석
    - 추천 신뢰도 및 상호작용 통계
    """
    user_id = None

    # 로그인 사용자인 경우 사용자 ID 추출
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = await AuthService.get_current_user(db, token)
            user_id = user.id if user else None
        except:
            pass

    analysis = await PreferenceService.get_preference_analysis(
        db=db, session_id=session_id, user_id=user_id
    )
    return succeed_response(analysis)


@router.post("/interaction")
async def record_interaction(
    interaction: UserInteractionCreate,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    사용자 상호작용 기록
    - 클릭, 즐겨찾기, 검색, 추천 결과 선택 등의 행동 데이터 수집
    - 선호도 학습을 위한 데이터 수집
    """
    user_id = None

    # 로그인 사용자인 경우 사용자 ID 추출
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = await AuthService.get_current_user(db, token)
            user_id = user.id if user else None
        except:
            pass

    # 사용자 ID 업데이트
    interaction.user_id = user_id

    recorded_interaction = await PreferenceService.record_interaction(
        db=db, interaction_data=interaction
    )

    return succeed_response(
        {
            "message": "상호작용이 성공적으로 기록되었습니다",
            "interaction_id": str(recorded_interaction.id),
            "preference_updated": True,
        }
    )


@router.get("/collaborative-users", response_model=List[CollaborativeRecommendation])
async def get_collaborative_recommendations_raw(
    session_id: str,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    협업 필터링 추천 결과 (상세 정보)
    - 유사도 점수 및 유사한 사용자 수 포함
    """
    user_id = None

    # 로그인 사용자인 경우 사용자 ID 추출
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = await AuthService.get_current_user(db, token)
            user_id = user.id if user else None
        except:
            pass

    recommendations = await PreferenceService.get_collaborative_recommendations(
        db=db, session_id=session_id, user_id=user_id, limit=limit
    )
    return recommendations

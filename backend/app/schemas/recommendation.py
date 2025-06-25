from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from app.schemas.menu import MenuRecommendation, TimeSlot


class UserAnswers(BaseModel):
    """사용자 답변(세션별)"""

    answers: Dict[str, str]  # {question_id: selected_option}
    session_id: Optional[str] = None


class SimpleRecommendationRequest(BaseModel):
    """간단 추천 요청 스키마"""

    time_slot: TimeSlot
    category_id: Optional[str] = None
    session_id: Optional[str] = None


class RecommendationResponse(BaseModel):
    """추천 결과 응답 스키마"""

    recommendations: List[MenuRecommendation] = []
    session_id: str
    total_count: int


class QuizRecommendationRequest(BaseModel):
    """질답 기반 추천 요청 스키마"""

    answers: Dict[str, str]
    category_id: Optional[str] = None
    session_id: Optional[str] = None


class PersonalizedRecommendationRequest(BaseModel):
    """개인화 추천 요청 스키마"""

    session_id: str
    limit: Optional[int] = 10


class HybridRecommendationRequest(BaseModel):
    """하이브리드 추천 요청 스키마"""

    answers: Dict[str, str]
    session_id: str
    limit: Optional[int] = 10


class CollaborativeRecommendationRequest(BaseModel):
    """협업 필터링 추천 요청 스키마"""

    session_id: str
    limit: Optional[int] = 10


class PreferenceAnalysisRequest(BaseModel):
    """선호도 분석 요청 스키마"""

    session_id: str


class InteractionRecordRequest(BaseModel):
    """상호작용 기록 요청 스키마"""

    session_id: str
    menu_id: Optional[str] = None
    interaction_type: str  # click, favorite, search, recommend_select
    interaction_strength: Optional[float] = 1.0
    extra_data: Optional[Dict[str, Any]] = None

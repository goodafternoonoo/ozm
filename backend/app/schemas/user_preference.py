import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class UserPreferenceBase(BaseModel):
    """사용자 선호도 기본 스키마"""

    # 선호도 속성 (0.0 ~ 1.0)
    spicy_preference: float = Field(default=0.5, ge=0.0, le=1.0)
    healthy_preference: float = Field(default=0.5, ge=0.0, le=1.0)
    vegetarian_preference: float = Field(default=0.5, ge=0.0, le=1.0)
    quick_preference: float = Field(default=0.5, ge=0.0, le=1.0)
    rice_preference: float = Field(default=0.5, ge=0.0, le=1.0)
    soup_preference: float = Field(default=0.5, ge=0.0, le=1.0)
    meat_preference: float = Field(default=0.5, ge=0.0, le=1.0)

    # 시간대별 선호도
    breakfast_preference: float = Field(default=0.33, ge=0.0, le=1.0)
    lunch_preference: float = Field(default=0.33, ge=0.0, le=1.0)
    dinner_preference: float = Field(default=0.34, ge=0.0, le=1.0)

    # 국가별 선호도
    country_preferences: Dict[str, float] = Field(default_factory=dict)

    # A/B 테스트 그룹 (예: 'A', 'B', 'C')
    ab_group: Optional[str] = None


class UserPreferenceCreate(UserPreferenceBase):
    """사용자 선호도 생성 스키마"""

    user_id: Optional[uuid.UUID] = None
    session_id: str
    ab_group: Optional[str] = None


class UserPreferenceUpdate(BaseModel):
    """사용자 선호도 업데이트 스키마"""

    spicy_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    healthy_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    vegetarian_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    quick_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    rice_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    soup_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    meat_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    breakfast_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    lunch_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    dinner_preference: Optional[float] = Field(None, ge=0.0, le=1.0)
    country_preferences: Optional[Dict[str, float]] = None
    ab_group: Optional[str] = None


class UserPreference(UserPreferenceBase):
    """사용자 선호도 응답 스키마"""

    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    session_id: str
    total_interactions: int
    last_updated: datetime
    ab_group: Optional[str] = None

    @field_serializer("last_updated")
    def serialize_last_updated(self, value):
        return value.isoformat() if isinstance(value, datetime) else value


class UserInteractionBase(BaseModel):
    """사용자 상호작용 기본 스키마"""

    interaction_type: str = Field(
        ..., description="상호작용 타입: click, favorite, search, recommend_select"
    )
    interaction_strength: float = Field(default=1.0, ge=0.0, le=1.0)
    extra_data: Dict[str, Any] = Field(default_factory=dict)


class UserInteractionCreate(UserInteractionBase):
    """사용자 상호작용 생성 스키마"""

    user_id: Optional[uuid.UUID] = None
    session_id: str
    menu_id: Optional[uuid.UUID] = None


class UserInteraction(UserInteractionBase):
    """사용자 상호작용 응답 스키마"""

    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    session_id: str
    menu_id: Optional[uuid.UUID]
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value):
        return value.isoformat() if isinstance(value, datetime) else value


class PreferenceAnalysis(BaseModel):
    """선호도 분석 결과 스키마"""

    session_id: str
    user_id: Optional[uuid.UUID]
    preference_summary: Dict[str, float]
    top_preferences: List[str]
    recommendation_confidence: float
    interaction_count: int
    last_activity: datetime

    @field_serializer("last_activity")
    def serialize_last_activity(self, value):
        return value.isoformat() if isinstance(value, datetime) else value


class CollaborativeRecommendation(BaseModel):
    """협업 필터링 추천 결과 스키마"""

    menu_id: uuid.UUID
    menu_name: str
    similarity_score: float
    similar_users_count: int
    reason: str

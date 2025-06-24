import uuid
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class UserPreference(Base):
    """
    사용자 선호도 학습 모델
    - 사용자의 행동 패턴을 학습하여 개인화된 추천 제공
    - 클릭, 즐겨찾기, 검색, 추천 결과 선택 등의 행동 데이터 수집
    """

    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )  # 로그인 사용자
    session_id = Column(String(255), nullable=False, index=True)  # 비로그인 사용자 세션

    # 선호도 속성 (0.0 ~ 1.0)
    spicy_preference = Column(Float, default=0.5)  # 매운맛 선호도
    healthy_preference = Column(Float, default=0.5)  # 건강식 선호도
    vegetarian_preference = Column(Float, default=0.5)  # 채식 선호도
    quick_preference = Column(Float, default=0.5)  # 빠른조리 선호도
    rice_preference = Column(Float, default=0.5)  # 밥류 선호도
    soup_preference = Column(Float, default=0.5)  # 국물요리 선호도
    meat_preference = Column(Float, default=0.5)  # 고기요리 선호도

    # 시간대별 선호도
    breakfast_preference = Column(Float, default=0.33)
    lunch_preference = Column(Float, default=0.33)
    dinner_preference = Column(Float, default=0.34)

    # 국가별 선호도 (JSON 형태로 저장)
    country_preferences = Column(String(1000), default="{}")  # JSON string

    # 학습 데이터
    total_interactions = Column(Integer, default=0)  # 총 상호작용 수
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # A/B 테스트 그룹 (예: 'A', 'B', 'C')
    ab_group = Column(String(10), nullable=True, index=True, comment="A/B 테스트 그룹")

    # 연관관계
    user = relationship("User", back_populates="preferences")

    def __repr__(self):
        return f"<UserPreference(user_id='{self.user_id}', session_id='{self.session_id}', ab_group='{self.ab_group}')>"


class UserInteraction(Base):
    """
    사용자 상호작용 로그
    - 클릭, 즐겨찾기, 검색, 추천 결과 선택 등의 행동 데이터
    """

    __tablename__ = "user_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id = Column(String(255), nullable=False, index=True)
    menu_id = Column(UUID(as_uuid=True), ForeignKey("menus.id"), nullable=True)

    # 상호작용 타입
    interaction_type = Column(
        String(50), nullable=False
    )  # click, favorite, search, recommend_select

    # 상호작용 강도 (0.0 ~ 1.0)
    interaction_strength = Column(Float, default=1.0)

    # 추가 데이터 (JSON)
    extra_data = Column(String(1000), default="{}")  # 검색어, 필터 조건 등

    # 시간 정보
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 연관관계
    user = relationship("User", back_populates="interactions")
    menu = relationship("Menu")

    def __repr__(self):
        return f"<UserInteraction(type='{self.interaction_type}', session_id='{self.session_id}')>"

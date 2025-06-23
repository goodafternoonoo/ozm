from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload
from app.models.menu import Menu, TimeSlot
from app.models.question import Question
from app.models.recommendation import Recommendation
from app.models.user_answer import UserAnswer
from app.models.user_preference import UserPreference, UserInteraction
from app.schemas.menu import MenuRecommendation
from app.schemas.recommendation import (
    SimpleRecommendationRequest,
    QuizRecommendationRequest,
    RecommendationResponse,
    PersonalizedRecommendationRequest,
    HybridRecommendationRequest,
    CollaborativeRecommendationRequest,
    PreferenceAnalysisRequest,
    InteractionRecordRequest,
)
from app.services.preference_service import PreferenceService
import uuid
import random
import json
from datetime import datetime, timedelta


class RecommendationService:
    """고도화된 추천 시스템 (개인화/협업필터링/하이브리드)"""

    @staticmethod
    async def get_simple_recommendations(
        db: AsyncSession,
        time_slot: TimeSlot,
        session_id: str,
        user_id: Optional[uuid.UUID] = None,
        limit: int = 5,
    ) -> List[MenuRecommendation]:
        """시간대별 개인화 추천 (선호도 기반)"""
        slot = time_slot.value if hasattr(time_slot, "value") else time_slot

        # 사용자 선호도 조회
        preference = await PreferenceService.get_or_create_preference(
            db, session_id, user_id
        )

        # 시간대별 선호도에 따른 가중치 적용
        time_weight = 1.0
        if slot == "breakfast":
            time_weight = preference.breakfast_preference
        elif slot == "lunch":
            time_weight = preference.lunch_preference
        elif slot == "dinner":
            time_weight = preference.dinner_preference

        # 메뉴 조회 및 점수 계산
        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(Menu.time_slot == slot)
        )
        result = await db.execute(stmt)
        menus = result.scalars().all()

        if not menus:
            return []

        # 개인화 점수 계산
        menu_scores = []
        for menu in menus:
            score = RecommendationService._calculate_personalized_score(
                menu, preference, time_weight
            )
            menu_scores.append((menu, score))

        # 점수 순으로 정렬
        menu_scores.sort(key=lambda x: x[1], reverse=True)

        # 상위 메뉴들 중에서 다양성을 위해 랜덤 선택
        top_candidates = menu_scores[: min(limit * 2, len(menu_scores))]
        selected = random.sample(top_candidates, min(limit, len(top_candidates)))

        recommendations = []
        for menu, score in selected:
            reason = RecommendationService._generate_personalized_reason(
                menu, preference, slot
            )
            recommendations.append(
                MenuRecommendation(
                    menu=menu,
                    score=min(score / 10.0, 1.0),
                    reason=reason,
                )
            )

        # 추천 로그 저장
        await RecommendationService._save_recommendation_log(
            db, session_id, {"time_slot": slot}, recommendations, "personalized_simple"
        )

        return recommendations

    @staticmethod
    async def get_quiz_recommendations(
        db: AsyncSession,
        answers: Dict[str, str],
        session_id: str,
        user_id: Optional[uuid.UUID] = None,
        limit: int = 5,
    ) -> List[MenuRecommendation]:
        """
        고도화된 질답 기반 추천 (하이브리드)
        - 필수 조건 필터링 + 개인화 점수 + 협업 필터링
        """
        # 1. 전체 메뉴 + 카테고리 join 조회
        stmt = select(Menu).options(selectinload(Menu.category))
        result = await db.execute(stmt)
        menus = result.scalars().all()

        if not menus:
            return []

        # 2. 최근 추천 메뉴 제외
        recent_menu_ids = await RecommendationService._get_recent_recommended_menus(
            db, session_id
        )
        filtered_menus = [m for m in menus if str(m.id) not in recent_menu_ids]
        if not filtered_menus:
            filtered_menus = menus

        # 3. 필수 조건 AND 필터링
        required_menus = RecommendationService._filter_required_conditions(
            filtered_menus, answers
        )
        if not required_menus:
            return []

        # 4. 사용자 선호도 조회
        preference = await PreferenceService.get_or_create_preference(
            db, session_id, user_id
        )

        # 5. 하이브리드 점수 계산
        menu_scores = []
        for menu in required_menus:
            # 콘텐츠 기반 점수
            content_score = RecommendationService._calculate_content_score(
                menu, answers, preference
            )

            # 협업 필터링 점수
            collaborative_score = (
                await RecommendationService._calculate_collaborative_score(
                    db, menu, session_id, user_id
                )
            )

            # 하이브리드 점수 (가중 평균)
            hybrid_score = content_score * 0.7 + collaborative_score * 0.3

            if hybrid_score > 0:
                menu_scores.append((menu, hybrid_score))

        menu_scores.sort(key=lambda x: x[1], reverse=True)

        # 6. 다양성 보장
        top_candidates = menu_scores[: min(limit * 2, len(menu_scores))]
        selected = random.sample(top_candidates, min(limit, len(top_candidates)))

        recommendations = []
        for menu, score in selected:
            reason = RecommendationService._generate_hybrid_reason(
                menu, answers, preference
            )
            recommendations.append(
                MenuRecommendation(
                    menu=menu,
                    score=min(score / 10.0, 1.0),
                    reason=reason,
                )
            )

        # 7. 사용자 답변 저장 및 선호도 학습
        await RecommendationService._save_user_answers_and_learn(
            db, session_id, user_id, answers, recommendations
        )

        return recommendations

    @staticmethod
    async def get_collaborative_recommendations(
        db: AsyncSession,
        session_id: str,
        user_id: Optional[uuid.UUID] = None,
        limit: int = 5,
    ) -> List[MenuRecommendation]:
        """협업 필터링 기반 추천"""
        collaborative_recs = await PreferenceService.get_collaborative_recommendations(
            db, session_id, user_id, limit
        )

        recommendations = []
        for rec in collaborative_recs:
            # 메뉴 정보 조회
            stmt = select(Menu).where(Menu.id == rec.menu_id)
            result = await db.execute(stmt)
            menu = result.scalar_one_or_none()

            if menu:
                recommendations.append(
                    MenuRecommendation(
                        menu=menu,
                        score=min(rec.similarity_score, 1.0),
                        reason=rec.reason,
                    )
                )

        return recommendations

    @staticmethod
    async def record_user_interaction(
        db: AsyncSession,
        session_id: str,
        menu_id: uuid.UUID,
        interaction_type: str,
        user_id: Optional[uuid.UUID] = None,
        interaction_strength: float = 1.0,
        extra_data: Optional[Dict] = None,
    ):
        """사용자 상호작용 기록"""
        # extra_data를 JSON 문자열로 변환
        extra_data_str = json.dumps(extra_data or {}, ensure_ascii=False)

        interaction_data = {
            "user_id": user_id,
            "session_id": session_id,
            "menu_id": menu_id,
            "interaction_type": interaction_type,
            "interaction_strength": interaction_strength,
            "extra_data": extra_data_str,
        }

        await PreferenceService.record_interaction(db, interaction_data)

    @staticmethod
    def _calculate_personalized_score(
        menu: Menu, preference: UserPreference, time_weight: float
    ) -> float:
        """개인화 점수 계산"""
        score = 5.0  # 기본 점수

        # 메뉴 속성과 선호도 매칭
        if menu.is_spicy:
            score += preference.spicy_preference * 3.0
        if menu.is_healthy:
            score += preference.healthy_preference * 3.0
        if menu.is_vegetarian:
            score += preference.vegetarian_preference * 4.0
        if menu.is_quick:
            score += preference.quick_preference * 2.0
        if menu.has_rice:
            score += preference.rice_preference * 2.0
        if menu.has_soup:
            score += preference.soup_preference * 2.0
        if menu.has_meat:
            score += preference.meat_preference * 2.0

        # 시간대 가중치 적용
        score *= time_weight

        # 평점 반영
        if menu.rating:
            score += menu.rating

        return score

    @staticmethod
    def _calculate_content_score(
        menu: Menu, answers: Dict[str, str], preference: UserPreference
    ) -> float:
        """콘텐츠 기반 점수 계산"""
        score = 5.0

        # 답변 기반 점수
        for answer_key, answer_value in answers.items():
            if answer_value == "매운맛" and menu.is_spicy:
                score += 3.0
            elif answer_value == "순한맛" and not menu.is_spicy:
                score += 2.0
            if answer_value == "건강식" and menu.is_healthy:
                score += 3.0
            if answer_value == "채식" and menu.is_vegetarian:
                score += 4.0
            if answer_value == "빠른조리" and menu.is_quick:
                score += 2.0
            if answer_value == "밥류" and menu.has_rice:
                score += 2.0
            if answer_value == "국물요리" and menu.has_soup:
                score += 2.0
            if answer_value == "고기요리" and menu.has_meat:
                score += 2.0

        # 선호도 기반 추가 점수
        if menu.is_spicy:
            score += preference.spicy_preference * 2.0
        if menu.is_healthy:
            score += preference.healthy_preference * 2.0
        if menu.is_vegetarian:
            score += preference.vegetarian_preference * 2.0
        if menu.is_quick:
            score += preference.quick_preference * 1.5
        if menu.has_rice:
            score += preference.rice_preference * 1.5
        if menu.has_soup:
            score += preference.soup_preference * 1.5
        if menu.has_meat:
            score += preference.meat_preference * 1.5

        if menu.rating:
            score += menu.rating

        return score

    @staticmethod
    async def _calculate_collaborative_score(
        db: AsyncSession, menu: Menu, session_id: str, user_id: Optional[uuid.UUID]
    ) -> float:
        """협업 필터링 점수 계산"""
        # 유사한 사용자들이 이 메뉴를 좋아하는지 확인
        stmt = select(UserInteraction).where(
            UserInteraction.menu_id == menu.id,
            UserInteraction.interaction_type.in_(["favorite", "recommend_select"]),
        )
        result = await db.execute(stmt)
        interactions = result.scalars().all()

        if not interactions:
            return 0.0

        # 평균 상호작용 강도
        avg_strength = sum(i.interaction_strength for i in interactions) / len(
            interactions
        )

        # 최근 상호작용에 더 높은 가중치
        recent_weight = 1.0
        for interaction in interactions:
            days_old = (datetime.now() - interaction.created_at).days
            if days_old < 7:
                recent_weight += 0.5
            elif days_old < 30:
                recent_weight += 0.2

        return avg_strength * recent_weight

    @staticmethod
    def _filter_required_conditions(
        menus: List[Menu], answers: Dict[str, str]
    ) -> List[Menu]:
        """필수 조건 필터링"""

        def is_required(menu):
            # 시간대
            if "time_slot" in answers and menu.time_slot != answers["time_slot"]:
                return False
            # 채식
            if any(v == "채식" for v in answers.values()) and not menu.is_vegetarian:
                return False
            # 국물
            if any(v == "국물요리" for v in answers.values()):
                if not menu.has_soup:
                    return False
            else:
                if menu.has_soup:
                    return False
            # 국가/카테고리
            if (
                "country" in answers
                and menu.category
                and menu.category.country != answers["country"]
            ):
                return False
            if (
                "cuisine_type" in answers
                and menu.category
                and menu.category.cuisine_type != answers["cuisine_type"]
            ):
                return False
            return True

        return [m for m in menus if is_required(m)]

    @staticmethod
    async def _get_recent_recommended_menus(db: AsyncSession, session_id: str) -> set:
        """최근 추천된 메뉴 ID 조회"""
        log_stmt = (
            select(Recommendation)
            .where(Recommendation.session_id == session_id)
            .order_by(desc(Recommendation.created_at))
            .limit(3)
        )
        log_result = await db.execute(log_stmt)
        logs = log_result.scalars().all()

        recent_menu_ids = set()
        for log in logs:
            if log.recommended_menus:
                for m in log.recommended_menus:
                    recent_menu_ids.add(m["menu_id"])

        return recent_menu_ids

    @staticmethod
    def _generate_personalized_reason(
        menu: Menu, preference: UserPreference, time_slot: str
    ) -> str:
        """개인화된 추천 이유 생성"""
        reasons = []

        # 선호도 기반 이유
        if menu.is_spicy and preference.spicy_preference > 0.7:
            reasons.append("매운맛을 좋아하시는 분께 적합")
        if menu.is_healthy and preference.healthy_preference > 0.7:
            reasons.append("건강한 식단을 선호하시는 분께 추천")
        if menu.is_vegetarian and preference.vegetarian_preference > 0.7:
            reasons.append("채식 메뉴를 찾는 분께 완벽")
        if menu.is_quick and preference.quick_preference > 0.7:
            reasons.append("빠른 조리를 원하시는 분께 적합")

        # 시간대별 이유
        if time_slot == "breakfast" and preference.breakfast_preference > 0.5:
            reasons.append("아침 식사에 최적화된 메뉴")
        elif time_slot == "lunch" and preference.lunch_preference > 0.5:
            reasons.append("점심 식사에 적합한 메뉴")
        elif time_slot == "dinner" and preference.dinner_preference > 0.5:
            reasons.append("저녁 식사에 추천하는 메뉴")

        if menu.rating and menu.rating >= 4.0:
            reasons.append("높은 평점의 인기 메뉴")

        return ", ".join(reasons) if reasons else "개인화된 추천 메뉴입니다"

    @staticmethod
    def _generate_hybrid_reason(
        menu: Menu, answers: Dict[str, str], preference: UserPreference
    ) -> str:
        """하이브리드 추천 이유 생성"""
        reasons = []

        # 답변 기반 이유
        for answer_key, answer_value in answers.items():
            if answer_value == "매운맛" and menu.is_spicy:
                reasons.append("매운맛을 좋아하시는 분께 적합")
            elif answer_value == "건강식" and menu.is_healthy:
                reasons.append("건강한 식단을 원하시는 분께 추천")
            elif answer_value == "채식" and menu.is_vegetarian:
                reasons.append("채식 메뉴를 찾는 분께 완벽")
            elif answer_value == "빠른조리" and menu.is_quick:
                reasons.append("빠르게 준비할 수 있는 메뉴")

        # 선호도 기반 이유
        if menu.is_spicy and preference.spicy_preference > 0.6:
            reasons.append("개인 선호도와 일치하는 매운맛")
        if menu.is_healthy and preference.healthy_preference > 0.6:
            reasons.append("건강식 선호도와 일치")

        if menu.rating and menu.rating >= 4.0:
            reasons.append("높은 평점의 인기 메뉴")

        return (
            ", ".join(reasons)
            if reasons
            else "하이브리드 추천 시스템이 추천하는 메뉴입니다"
        )

    @staticmethod
    async def _save_user_answers_and_learn(
        db: AsyncSession,
        session_id: str,
        user_id: Optional[uuid.UUID],
        answers: Dict[str, str],
        recommendations: List[MenuRecommendation],
    ):
        """사용자 답변 저장 및 선호도 학습"""
        # 사용자 답변 저장 (answers를 JSON 문자열로 변환)
        user_answer = UserAnswer(
            session_id=session_id,
            answer=json.dumps(answers, ensure_ascii=False),
            user_id=user_id,
        )
        db.add(user_answer)

        # 추천 로그 저장
        await RecommendationService._save_recommendation_log(
            db, session_id, answers, recommendations, "hybrid_quiz"
        )

        # 상호작용 기록 (선호도 학습용)
        for rec in recommendations:
            await RecommendationService.record_user_interaction(
                db, session_id, rec.menu.id, "recommend_select", user_id, 0.8
            )

        await db.commit()

    @staticmethod
    async def _save_recommendation_log(
        db: AsyncSession,
        session_id: str,
        answers: Dict[str, str],
        recommendations: List[MenuRecommendation],
        rec_type: str,
    ):
        """추천 로그 저장"""
        # 각 추천 메뉴에 대해 개별 Recommendation 레코드 생성
        for rec in recommendations:
            log = Recommendation(
                session_id=session_id,
                menu_id=rec.menu.id,
                recommendation_type=rec_type,
                score=rec.score,
                reason=rec.reason,
            )
            db.add(log)

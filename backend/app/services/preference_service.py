import json
import uuid
from typing import Dict, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.models.user_preference import UserPreference, UserInteraction
from app.models.menu import Menu
from app.models.favorite import Favorite
from app.schemas.user_preference import (
    UserPreferenceCreate,
    UserPreferenceUpdate,
    UserInteractionCreate,
    PreferenceAnalysis,
    CollaborativeRecommendation,
)
import numpy as np
from datetime import datetime, timedelta
import random


class PreferenceService:
    """사용자 선호도 학습 및 협업 필터링 서비스"""

    @staticmethod
    async def get_or_create_preference(
        db: AsyncSession, session_id: str, user_id: Optional[uuid.UUID] = None
    ) -> UserPreference:
        """사용자 선호도 조회 또는 생성"""
        stmt = (
            select(UserPreference)
            .where(
                (UserPreference.session_id == session_id)
                | (UserPreference.user_id == user_id)
            )
            .limit(1)
        )

        result = await db.execute(stmt)
        preference = result.scalar_one_or_none()

        if not preference:
            ab_group = random.choice(["A", "B", "C"])
            # A/B 테스트 그룹 무작위 할당
            preference = UserPreference(
                session_id=session_id, user_id=user_id, ab_group=ab_group
            )
            db.add(preference)
            await db.commit()
            await db.refresh(preference)

        return preference

    @staticmethod
    async def record_interaction(
        db: AsyncSession, interaction_data: dict
    ) -> UserInteraction:
        """사용자 상호작용 기록"""
        # 딕셔너리에서 직접 UserInteraction 모델 생성
        interaction = UserInteraction(**interaction_data)
        db.add(interaction)
        await db.commit()
        await db.refresh(interaction)

        # 선호도 업데이트
        await PreferenceService._update_preference_from_interaction(db, interaction)

        return interaction

    @staticmethod
    async def _update_preference_from_interaction(
        db: AsyncSession, interaction: UserInteraction
    ):
        """상호작용을 기반으로 선호도 업데이트"""
        if not interaction.menu_id:
            return

        # 메뉴 정보 조회 (category까지 eager load)
        stmt = (
            select(Menu)
            .options(selectinload(Menu.category))
            .where(Menu.id == interaction.menu_id)
        )
        result = await db.execute(stmt)
        menu = result.scalar_one_or_none()

        if not menu:
            return

        # 선호도 조회
        preference = await PreferenceService.get_or_create_preference(
            db, interaction.session_id, interaction.user_id
        )

        # 학습률 (시간이 지날수록 감소)
        learning_rate = 0.1 * interaction.interaction_strength

        # 메뉴 속성에 따른 선호도 업데이트
        if menu.is_spicy:
            preference.spicy_preference = min(
                1.0, preference.spicy_preference + learning_rate
            )
        else:
            preference.spicy_preference = max(
                0.0, preference.spicy_preference - learning_rate * 0.5
            )

        if menu.is_healthy:
            preference.healthy_preference = min(
                1.0, preference.healthy_preference + learning_rate
            )
        else:
            preference.healthy_preference = max(
                0.0, preference.healthy_preference - learning_rate * 0.5
            )

        if menu.is_vegetarian:
            preference.vegetarian_preference = min(
                1.0, preference.vegetarian_preference + learning_rate
            )
        else:
            preference.vegetarian_preference = max(
                0.0, preference.vegetarian_preference - learning_rate * 0.5
            )

        if menu.is_quick:
            preference.quick_preference = min(
                1.0, preference.quick_preference + learning_rate
            )
        else:
            preference.quick_preference = max(
                0.0, preference.quick_preference - learning_rate * 0.5
            )

        if menu.has_rice:
            preference.rice_preference = min(
                1.0, preference.rice_preference + learning_rate
            )
        else:
            preference.rice_preference = max(
                0.0, preference.rice_preference - learning_rate * 0.5
            )

        if menu.has_soup:
            preference.soup_preference = min(
                1.0, preference.soup_preference + learning_rate
            )
        else:
            preference.soup_preference = max(
                0.0, preference.soup_preference - learning_rate * 0.5
            )

        if menu.has_meat:
            preference.meat_preference = min(
                1.0, preference.meat_preference + learning_rate
            )
        else:
            preference.meat_preference = max(
                0.0, preference.meat_preference - learning_rate * 0.5
            )

        # 시간대별 선호도 업데이트
        if menu.time_slot == "breakfast":
            preference.breakfast_preference = min(
                1.0, preference.breakfast_preference + learning_rate
            )
        elif menu.time_slot == "lunch":
            preference.lunch_preference = min(
                1.0, preference.lunch_preference + learning_rate
            )
        elif menu.time_slot == "dinner":
            preference.dinner_preference = min(
                1.0, preference.dinner_preference + learning_rate
            )

        # 국가별 선호도 업데이트
        if menu.category and menu.category.country:
            country_prefs = json.loads(preference.country_preferences or "{}")
            country = menu.category.country
            current_pref = country_prefs.get(country, 0.5)
            country_prefs[country] = min(1.0, current_pref + learning_rate)
            preference.country_preferences = json.dumps(country_prefs)

        preference.total_interactions += 1
        await db.commit()

    @staticmethod
    async def get_preference_analysis(
        db: AsyncSession, session_id: str, user_id: Optional[uuid.UUID] = None
    ) -> PreferenceAnalysis:
        """사용자 선호도 분석"""
        preference = await PreferenceService.get_or_create_preference(
            db, session_id, user_id
        )

        # 선호도 요약
        preference_summary = {
            "spicy": preference.spicy_preference,
            "healthy": preference.healthy_preference,
            "vegetarian": preference.vegetarian_preference,
            "quick": preference.quick_preference,
            "rice": preference.rice_preference,
            "soup": preference.soup_preference,
            "meat": preference.meat_preference,
            "breakfast": preference.breakfast_preference,
            "lunch": preference.lunch_preference,
            "dinner": preference.dinner_preference,
        }

        # 상위 선호도 식별
        sorted_prefs = sorted(
            preference_summary.items(), key=lambda x: x[1], reverse=True
        )
        top_preferences = [f"{k}: {v:.2f}" for k, v in sorted_prefs[:5]]

        # 추천 신뢰도 계산 (상호작용 수 기반)
        confidence = min(1.0, preference.total_interactions / 50.0)

        # 최근 활동 시간
        recent_interaction = await PreferenceService._get_recent_interaction(
            db, session_id, user_id
        )
        last_activity = (
            recent_interaction.created_at
            if recent_interaction
            else preference.last_updated
        )

        return PreferenceAnalysis(
            session_id=session_id,
            user_id=user_id,
            preference_summary=preference_summary,
            top_preferences=top_preferences,
            recommendation_confidence=confidence,
            interaction_count=preference.total_interactions,
            last_activity=last_activity,
        )

    @staticmethod
    async def _get_recent_interaction(
        db: AsyncSession, session_id: str, user_id: Optional[uuid.UUID] = None
    ) -> Optional[UserInteraction]:
        """최근 상호작용 조회"""
        stmt = (
            select(UserInteraction)
            .where(
                (UserInteraction.session_id == session_id)
                | (UserInteraction.user_id == user_id)
            )
            .order_by(desc(UserInteraction.created_at))
            .limit(1)
        )

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_collaborative_recommendations(
        db: AsyncSession,
        session_id: str,
        user_id: Optional[uuid.UUID] = None,
        limit: int = 5,
    ) -> List[CollaborativeRecommendation]:
        """협업 필터링 기반 추천"""
        # 현재 사용자의 선호도
        current_preference = await PreferenceService.get_or_create_preference(
            db, session_id, user_id
        )

        # 다른 사용자들의 선호도 조회
        stmt = select(UserPreference).where(
            UserPreference.id != current_preference.id,
            UserPreference.total_interactions >= 5,  # 최소 상호작용 수
        )
        result = await db.execute(stmt)
        other_preferences = result.scalars().all()

        if not other_preferences:
            return []

        # 유사도 계산 및 추천
        recommendations = []
        for other_pref in other_preferences:
            similarity = PreferenceService._calculate_similarity(
                current_preference, other_pref
            )

            if similarity > 0.3:  # 유사도 임계값
                # 유사한 사용자가 좋아한 메뉴들 조회
                similar_user_menus = await PreferenceService._get_user_favorite_menus(
                    db, other_pref.session_id, other_pref.user_id
                )

                for menu in similar_user_menus:
                    # 현재 사용자가 이미 좋아하는 메뉴는 제외
                    if not await PreferenceService._is_user_favorite(
                        db, session_id, user_id, menu.id
                    ):
                        recommendations.append(
                            CollaborativeRecommendation(
                                menu_id=menu.id,
                                menu_name=menu.name,
                                similarity_score=similarity,
                                similar_users_count=1,
                                reason=f"유사한 취향의 사용자가 좋아한 메뉴 (유사도: {similarity:.2f})",
                            )
                        )

        # 중복 제거 및 정렬
        unique_recommendations = {}
        for rec in recommendations:
            if rec.menu_id not in unique_recommendations:
                unique_recommendations[rec.menu_id] = rec
            else:
                # 동일 메뉴에 대해 유사도 합산
                existing = unique_recommendations[rec.menu_id]
                existing.similarity_score = (
                    existing.similarity_score + rec.similarity_score
                ) / 2
                existing.similar_users_count += 1

        # 유사도 순으로 정렬
        sorted_recommendations = sorted(
            unique_recommendations.values(),
            key=lambda x: x.similarity_score,
            reverse=True,
        )

        return sorted_recommendations[:limit]

    @staticmethod
    def _calculate_similarity(pref1: UserPreference, pref2: UserPreference) -> float:
        """두 사용자의 선호도 유사도 계산 (코사인 유사도)"""
        # 선호도 벡터 생성
        vector1 = [
            pref1.spicy_preference,
            pref1.healthy_preference,
            pref1.vegetarian_preference,
            pref1.quick_preference,
            pref1.rice_preference,
            pref1.soup_preference,
            pref1.meat_preference,
            pref1.breakfast_preference,
            pref1.lunch_preference,
            pref1.dinner_preference,
        ]

        vector2 = [
            pref2.spicy_preference,
            pref2.healthy_preference,
            pref2.vegetarian_preference,
            pref2.quick_preference,
            pref2.rice_preference,
            pref2.soup_preference,
            pref2.meat_preference,
            pref2.breakfast_preference,
            pref2.lunch_preference,
            pref2.dinner_preference,
        ]

        # 코사인 유사도 계산
        dot_product = sum(a * b for a, b in zip(vector1, vector2))
        magnitude1 = sum(a * a for a in vector1) ** 0.5
        magnitude2 = sum(b * b for b in vector2) ** 0.5

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)

    @staticmethod
    async def _get_user_favorite_menus(
        db: AsyncSession, session_id: str, user_id: Optional[uuid.UUID] = None
    ) -> List[Menu]:
        """사용자가 좋아한 메뉴들 조회"""
        stmt = (
            select(Menu)
            .join(Favorite)
            .where((Favorite.session_id == session_id) | (Favorite.user_id == user_id))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def _is_user_favorite(
        db: AsyncSession,
        session_id: str,
        user_id: Optional[uuid.UUID],
        menu_id: uuid.UUID,
    ) -> bool:
        """사용자가 특정 메뉴를 좋아하는지 확인"""
        stmt = select(Favorite).where(
            Favorite.menu_id == menu_id,
            (Favorite.session_id == session_id) | (Favorite.user_id == user_id),
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

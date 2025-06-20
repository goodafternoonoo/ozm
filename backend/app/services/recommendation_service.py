from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.menu import Menu, TimeSlot
from app.models.question import Question
from app.models.recommendation import RecommendationLog
from app.models.user_answer import UserAnswer
from app.schemas.menu import MenuRecommendation
import uuid
import random

class RecommendationService:

    @staticmethod
    async def get_simple_recommendations(
        db: AsyncSession,
        time_slot: TimeSlot,
        session_id: str,
        limit: int = 5
    ) -> List[MenuRecommendation]:
        """시간대별 간단 추천"""
        # 해당 시간대의 메뉴들 조회
        stmt = select(Menu).where(Menu.time_slot == time_slot)
        result = await db.execute(stmt)
        menus = result.scalars().all()

        if not menus:
            return []

        # 랜덤으로 섞어서 추천 (실제로는 더 복잡한 로직 적용 가능)
        selected_menus = random.sample(list(menus), min(limit, len(menus)))

        recommendations = []
        for menu in selected_menus:
            recommendations.append(MenuRecommendation(
                menu=menu,
                score=random.uniform(0.7, 1.0),
                reason=f"{time_slot.value}에 적합한 메뉴입니다."
            ))

        # 추천 로그 저장
        await RecommendationService._save_recommendation_log(
            db, session_id, {}, recommendations, "simple"
        )

        return recommendations

    @staticmethod
    async def get_quiz_recommendations(
        db: AsyncSession,
        answers: Dict[str, str],
        session_id: str,
        limit: int = 5
    ) -> List[MenuRecommendation]:
        """질답 기반 맞춤 추천"""
        # 모든 메뉴 조회
        stmt = select(Menu)
        result = await db.execute(stmt)
        menus = result.scalars().all()

        if not menus:
            return []

        # 질문 가중치 조회
        stmt = select(Question)
        result = await db.execute(stmt)
        questions = result.scalars().all()

        # 각 메뉴에 대해 점수 계산
        menu_scores = []
        for menu in menus:
            score = RecommendationService._calculate_menu_score(menu, answers, questions)
            if score > 0:
                menu_scores.append((menu, score))

        # 점수 순으로 정렬
        menu_scores.sort(key=lambda x: x[1], reverse=True)

        # 상위 N개 추천
        recommendations = []
        for menu, score in menu_scores[:limit]:
            reason = RecommendationService._generate_recommendation_reason(menu, answers)
            recommendations.append(MenuRecommendation(
                menu=menu,
                score=min(score / 10.0, 1.0),  # 0-1 범위로 정규화
                reason=reason
            ))

        # 사용자 답변 저장
        user_answer = UserAnswer(
            session_id=session_id,
            answers=answers
        )
        db.add(user_answer)

        # 추천 로그 저장
        await RecommendationService._save_recommendation_log(
            db, session_id, answers, recommendations, "quiz"
        )

        await db.commit()

        return recommendations

    @staticmethod
    def _calculate_menu_score(menu: Menu, answers: Dict[str, str], questions: List[Question]) -> float:
        """메뉴 점수 계산"""
        total_score = 0.0

        # 기본 점수
        base_score = 5.0
        total_score += base_score

        # 답변 기반 점수 계산
        for answer_key, answer_value in answers.items():
            if answer_value == "매운맛" and menu.is_spicy:
                total_score += 3.0
            elif answer_value == "순한맛" and not menu.is_spicy:
                total_score += 2.0

            if answer_value == "건강식" and menu.is_healthy:
                total_score += 3.0

            if answer_value == "채식" and menu.is_vegetarian:
                total_score += 4.0

            if answer_value == "빠른조리" and menu.is_quick:
                total_score += 2.0

            if answer_value == "밥류" and menu.has_rice:
                total_score += 2.0

            if answer_value == "국물요리" and menu.has_soup:
                total_score += 2.0

            if answer_value == "고기요리" and menu.has_meat:
                total_score += 2.0

        # 평점 반영
        if menu.rating:
            total_score += menu.rating

        return total_score

    @staticmethod
    def _generate_recommendation_reason(menu: Menu, answers: Dict[str, str]) -> str:
        """추천 이유 생성"""
        reasons = []

        for answer_key, answer_value in answers.items():
            if answer_value == "매운맛" and menu.is_spicy:
                reasons.append("매운맛을 좋아하시는 분께 적합")
            elif answer_value == "건강식" and menu.is_healthy:
                reasons.append("건강한 식단을 원하시는 분께 추천")
            elif answer_value == "채식" and menu.is_vegetarian:
                reasons.append("채식 메뉴를 찾는 분께 완벽")
            elif answer_value == "빠른조리" and menu.is_quick:
                reasons.append("빠르게 준비할 수 있는 메뉴")

        if menu.rating and menu.rating >= 4.0:
            reasons.append("높은 평점의 인기 메뉴")

        return ", ".join(reasons) if reasons else "당신의 취향에 맞는 메뉴입니다"

    @staticmethod
    async def _save_recommendation_log(
        db: AsyncSession,
        session_id: str,
        answers: Dict[str, str],
        recommendations: List[MenuRecommendation],
        rec_type: str
    ):
        """추천 로그 저장"""
        menu_data = [
            {
                "menu_id": str(rec.menu.id),
                "menu_name": rec.menu.name,
                "score": rec.score,
                "reason": rec.reason
            }
            for rec in recommendations
        ]

        log = RecommendationLog(
            session_id=session_id,
            user_answers=answers,
            recommended_menus=menu_data,
            recommendation_type=rec_type
        )
        db.add(log)

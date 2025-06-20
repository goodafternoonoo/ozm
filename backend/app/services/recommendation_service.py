from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models.menu import Menu, TimeSlot
from app.models.question import Question
from app.models.recommendation import RecommendationLog
from app.models.user_answer import UserAnswer
from app.schemas.menu import MenuRecommendation
import uuid
import random


class RecommendationService:
    """추천 관련 비즈니스 로직 서비스 (개인화/트렌드/다양성 고도화)"""

    @staticmethod
    async def get_simple_recommendations(
        db: AsyncSession, time_slot: TimeSlot, session_id: str, limit: int = 5
    ) -> List[MenuRecommendation]:
        """시간대별 간단 추천 (랜덤)"""
        slot = time_slot.value if hasattr(time_slot, "value") else time_slot
        stmt = select(Menu).where(Menu.time_slot == slot).limit(limit)
        result = await db.execute(stmt)
        menus = result.scalars().all()
        if not menus:
            return []
        selected_menus = random.sample(list(menus), min(limit, len(menus)))
        recommendations = []
        for menu in selected_menus:
            recommendations.append(
                MenuRecommendation(
                    menu=menu,
                    score=random.uniform(0.7, 1.0),
                    reason=f"{time_slot.value}에 적합한 메뉴입니다.",
                )
            )
        await RecommendationService._save_recommendation_log(
            db, session_id, {}, recommendations, "simple"
        )
        return recommendations

    @staticmethod
    async def get_quiz_recommendations(
        db: AsyncSession, answers: Dict[str, str], session_id: str, limit: int = 5
    ) -> List[MenuRecommendation]:
        """
        질답 기반 맞춤 추천 (필수 조건 AND 필터 + 선호 가중치)
        - 필수 조건: 시간대, 채식, 국물, 국가/카테고리 등
        - 선호 조건: 매운맛, 건강식, 빠른조리 등
        """
        # 1. 전체 메뉴 + 카테고리 join 조회
        stmt = select(Menu).options(selectinload(Menu.category))
        result = await db.execute(stmt)
        menus = result.scalars().all()
        if not menus:
            return []
        # 2. 최근(동일 세션) 추천 메뉴 제외 (반복 방지)
        recent_menu_ids = set()
        log_stmt = (
            select(RecommendationLog)
            .where(RecommendationLog.session_id == session_id)
            .order_by(desc(RecommendationLog.created_at))
            .limit(3)
        )
        log_result = await db.execute(log_stmt)
        logs = log_result.scalars().all()
        for log in logs:
            if log.recommended_menus:
                for m in log.recommended_menus:
                    recent_menu_ids.add(m["menu_id"])
        filtered_menus = [m for m in menus if str(m.id) not in recent_menu_ids]
        if not filtered_menus:
            filtered_menus = menus  # 모두 제외되면 전체 허용

        # 3. 필수 조건 AND 필터링
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

        required_menus = [m for m in filtered_menus if is_required(m)]
        if not required_menus:
            return []  # 필수 조건 만족 메뉴 없음
        # 4. 트렌드(추천수/조회수) 기반 가중치 계산
        trend_scores = await RecommendationService._get_menu_trend_scores(db)
        # 5. 질문/가중치 기반 점수 계산 + 트렌드 가중치 합산
        stmt = select(Question)
        result = await db.execute(stmt)
        questions = result.scalars().all()
        menu_scores = []
        for menu in required_menus:
            score = RecommendationService._calculate_menu_score(
                menu, answers, questions
            )
            trend_score = trend_scores.get(str(menu.id), 0.0)
            total_score = score + trend_score  # 단순 합산(가중치 조정 가능)
            if total_score > 0:
                menu_scores.append((menu, total_score))
        menu_scores.sort(key=lambda x: x[1], reverse=True)
        # 6. 다양성: 상위 N*2개 중 N개 랜덤 추출
        top_n = limit * 2
        top_candidates = (
            menu_scores[:top_n] if len(menu_scores) > top_n else menu_scores
        )
        selected = (
            random.sample(top_candidates, min(limit, len(top_candidates)))
            if top_candidates
            else []
        )
        recommendations = []
        for menu, score in selected:
            reason = RecommendationService._generate_recommendation_reason(
                menu, answers
            )
            recommendations.append(
                MenuRecommendation(
                    menu=menu,
                    score=min(score / 10.0, 1.0),
                    reason=reason,
                )
            )
        # 사용자 답변 저장
        user_answer = UserAnswer(session_id=session_id, answers=answers)
        db.add(user_answer)
        # 추천 로그 저장
        await RecommendationService._save_recommendation_log(
            db, session_id, answers, recommendations, "quiz"
        )
        await db.commit()
        return recommendations

    @staticmethod
    async def _get_menu_trend_scores(db: AsyncSession) -> Dict[str, float]:
        """
        메뉴별 트렌드(추천/조회수) 기반 가중치 계산
        - 최근 추천 로그를 집계하여 인기 메뉴에 추가 점수 부여
        """
        stmt = select(RecommendationLog)
        result = await db.execute(stmt)
        logs = result.scalars().all()
        trend_count = {}
        for log in logs:
            if log.recommended_menus:
                for m in log.recommended_menus:
                    menu_id = m["menu_id"]
                    trend_count[menu_id] = trend_count.get(menu_id, 0) + 1
        # 단순 정규화(최대 3점 부여)
        max_count = max(trend_count.values()) if trend_count else 1
        trend_scores = {k: (v / max_count) * 3.0 for k, v in trend_count.items()}
        return trend_scores

    @staticmethod
    def _calculate_menu_score(
        menu: Menu, answers: Dict[str, str], questions: List[Question]
    ) -> float:
        """메뉴 추천 점수 계산 (속성 일치 + 평점)"""
        total_score = 0.0
        base_score = 5.0
        total_score += base_score
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
        rec_type: str,
    ):
        """추천 로그 저장"""
        menu_data = [
            {
                "menu_id": str(rec.menu.id),
                "menu_name": rec.menu.name,
                "score": rec.score,
                "reason": rec.reason,
            }
            for rec in recommendations
        ]
        log = RecommendationLog(
            session_id=session_id,
            user_answers=answers,
            recommended_menus=menu_data,
            recommendation_type=rec_type,
        )
        db.add(log)

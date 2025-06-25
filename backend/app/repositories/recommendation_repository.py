from typing import Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.models.recommendation import Recommendation, RecommendationLog
from app.repositories.base_repository import BaseRepository


class RecommendationRepository(BaseRepository[Recommendation]):
    """
    추천 도메인 특화 레포지토리
    """

    def __init__(self, db: AsyncSession):
        super().__init__(db, Recommendation)

    async def get_recent_recommended_menus(self, session_id: str) -> set:
        """세션별 최근 추천 메뉴 ID 집합 조회"""
        stmt = (
            select(RecommendationLog)
            .where(RecommendationLog.session_id == session_id)
            .order_by(RecommendationLog.created_at.desc())
            .limit(20)
        )
        result = await self.db.execute(stmt)
        logs = result.scalars().all()
        menu_ids = set()
        for log in logs:
            for rec in log.recommendations or []:
                menu_id = rec.get("menu", {}).get("id")
                if menu_id:
                    menu_ids.add(str(menu_id))
        return menu_ids

    async def save_recommendation_log(
        self, session_id: str, answers: Dict, recommendations: List, rec_type: str
    ):
        """추천 로그 저장"""
        log = RecommendationLog(
            session_id=session_id,
            weight_set=json.dumps(answers, ensure_ascii=False),
            recommended_menus=json.dumps(
                [str(r.menu.id) for r in recommendations], ensure_ascii=False
            ),
            action_type=rec_type,
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

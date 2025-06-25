from typing import Any, Dict, Optional

import aiohttp

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class PerplexityService:
    """Perplexity AI API 서비스"""

    def __init__(self):
        self.api_key = settings.perplexity_api_key
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.model = "llama-3.1-sonar-small-128k-online"
        # self.model = "sonar"
        # self.model = "sonar-deep-research"
        # self.model = "sonar-reasoning-pro"

    async def get_ai_response(
        self, user_question: str, context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perplexity AI를 사용하여 음식 관련 질문에 답변 생성

        Args:
            user_question: 사용자 질문
            context: 추가 컨텍스트 (선택사항)

        Returns:
            Dict: AI 응답 정보
        """
        try:
            # 음식 관련 컨텍스트 추가
            system_prompt = self._build_system_prompt(context)

            # Perplexity API 요청 데이터
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question},
                ],
                "max_tokens": 1000,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": False,
            }

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url, json=payload, headers=headers, timeout=30
                ) as response:

                    if response.status == 200:
                        data = await response.json()
                        return self._parse_perplexity_response(data)
                    else:
                        error_text = await response.text()
                        logger.error(
                            f"Perplexity API 오류: {response.status} - {error_text}"
                        )
                        return self._create_fallback_response(user_question)

        except Exception as e:
            logger.error(f"Perplexity 서비스 오류: {str(e)}")
            return self._create_fallback_response(user_question)

    def _build_system_prompt(self, context: Optional[str] = None) -> str:
        """시스템 프롬프트 구성"""
        base_prompt = """
            당신은 OZM 음식 추천 시스템의 AI 어시스턴트 '냠냠이'입니다. 
            사용자의 음식 관련 질문에 대해 친근하고 도움이 되는 답변을 제공해주세요.

            **필수사항**
            1. 음식 관련 질문 외에는 답변하지 않음
            2. 음식 관련 질문이 아니라면 답변하지 말고 경고 메시지를 출력

            **가이드라인**
            1. 한국 음식 문화와 맛에 대한 이해를 바탕으로 답변
            2. 건강, 영양, 조리법, 맛집 추천 등 다양한 관점에서 답변
            3. 구체적이고 실용적인 정보 제공
            4. 친근하고 대화하는 듯한 톤 사용
            5. 필요시 간단한 조리 팁이나 재료 정보 포함
            
            답변은 한국어로 작성하고, 100자 이내로 작성해주세요.
        """

        if context:
            base_prompt += f"\n\n추가 컨텍스트: {context}"

        return base_prompt

    def _parse_perplexity_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perplexity API 응답 파싱"""
        try:
            choices = data.get("choices", [])
            if choices:
                message = choices[0].get("message", {})
                content = message.get("content", "")

                return {
                    "success": True,
                    "answer": content,
                    "model": self.model,
                    "usage": data.get("usage", {}),
                    "sources": self._extract_sources(data),
                }
            else:
                return self._create_fallback_response("")

        except Exception as e:
            logger.error(f"응답 파싱 오류: {str(e)}")
            return self._create_fallback_response("")

    def _extract_sources(self, data: Dict[str, Any]) -> list:
        """응답에서 소스 정보 추출"""
        sources = []
        try:
            # Perplexity 응답에서 소스 정보 추출 (구조에 따라 조정 필요)
            if "sources" in data:
                sources = data["sources"]
        except:
            pass
        return sources

    def _create_fallback_response(self, question: str) -> Dict[str, Any]:
        """API 실패 시 기본 응답 생성"""
        fallback_answers = [
            "죄송합니다. 현재 AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
            "음식에 대한 질문이시군요! 현재 시스템 점검 중입니다. 조금 후에 다시 문의해주세요.",
            "음식 관련 질문에 답변드리려고 했는데, 서비스 연결에 문제가 있네요. 잠시 후 다시 시도해주세요.",
        ]

        import random

        return {
            "success": False,
            "answer": random.choice(fallback_answers),
            "model": "fallback",
            "usage": {},
            "sources": [],
        }


# 싱글톤 인스턴스
perplexity_service = PerplexityService()

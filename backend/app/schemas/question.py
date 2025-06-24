from pydantic import BaseModel, field_validator
from typing import List, Dict, Any, Optional
import uuid
import json
from pydantic import Field


class QuestionBase(BaseModel):
    """추천 질문 공통 필드"""

    text: str
    display_order: int
    options: List[str]
    weight_map: Optional[Dict[str, dict]] = None
    category: Optional[str] = None

    @field_validator("options", mode="before")
    @classmethod
    def parse_options(cls, v):
        """options 필드가 문자열인 경우 JSON 파싱하여 리스트로 변환"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v


class QuestionCreate(QuestionBase):
    """질문 생성 요청 스키마"""

    pass


class Question(QuestionBase):
    """질문 응답 스키마"""

    id: uuid.UUID


class AIQuestionRequest(BaseModel):
    """AI 답변 요청 스키마"""

    question: str = Field(..., description="사용자 질문", min_length=1, max_length=1000)
    context: Optional[str] = Field(None, description="추가 컨텍스트", max_length=500)


class AIQuestionResponse(BaseModel):
    """AI 답변 응답 스키마"""

    answer: str = Field(..., description="AI 답변")
    model: str = Field(..., description="사용된 AI 모델")
    sources: List[Dict[str, Any]] = Field(default=[], description="참고 소스")
    usage: Dict[str, Any] = Field(default={}, description="API 사용량 정보")

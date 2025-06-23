from pydantic import BaseModel, field_validator
from typing import List, Dict, Any, Optional
import uuid
import json


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

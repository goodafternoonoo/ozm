from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid


class QuestionBase(BaseModel):
    """추천 질문 공통 필드"""
    text: str
    order: int
    options: List[str]
    weight_map: Optional[Dict[str, float]] = None
    category: str


class QuestionCreate(QuestionBase):
    """질문 생성 요청 스키마"""
    pass


class Question(QuestionBase):
    """질문 응답 스키마"""
    id: uuid.UUID

    class Config:
        from_attributes = True

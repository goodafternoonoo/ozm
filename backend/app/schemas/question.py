from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid


class QuestionBase(BaseModel):
    text: str
    order: int
    options: List[str]
    weight_map: Optional[Dict[str, float]] = None
    category: str


class QuestionCreate(QuestionBase):
    pass


class Question(QuestionBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

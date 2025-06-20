from pydantic import BaseModel
from typing import List, Dict, Any
import uuid

class QuestionBase(BaseModel):
    text: str
    order: int
    options: List[str]
    weight_map: Dict[str, Dict[str, float]]  # {option: {attribute: weight}}

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

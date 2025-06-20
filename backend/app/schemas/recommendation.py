from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.menu import MenuRecommendation, TimeSlot

class UserAnswers(BaseModel):
    answers: Dict[str, str]  # {question_id: selected_option}
    session_id: Optional[str] = None

class SimpleRecommendationRequest(BaseModel):
    time_slot: TimeSlot
    session_id: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendations: List[MenuRecommendation]
    session_id: str
    total_count: int

class QuizRecommendationRequest(BaseModel):
    answers: Dict[str, str]
    session_id: Optional[str] = None

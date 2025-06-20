from fastapi import APIRouter
from app.api.v1 import menus, recommendations, questions

api_router = APIRouter()

api_router.include_router(
    menus.router,
    prefix="/menus",
    tags=["menus"]
)

api_router.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["recommendations"]
)

api_router.include_router(
    questions.router,
    prefix="/questions",
    tags=["questions"]
)

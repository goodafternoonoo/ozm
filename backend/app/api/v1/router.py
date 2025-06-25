from fastapi import APIRouter

from app.api.v1 import (auth, categories, menus, questions, recommendations,
                        search, users)

api_router = APIRouter()

api_router.include_router(menus.router, prefix="/menus", tags=["menus"])

api_router.include_router(
    recommendations.router, prefix="/recommendations", tags=["recommendations"]
)

api_router.include_router(questions.router, prefix="/questions", tags=["questions"])

api_router.include_router(categories.router, prefix="/categories", tags=["categories"])

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

api_router.include_router(users.router, prefix="/users", tags=["users"])

api_router.include_router(search.router, prefix="/search", tags=["search"])

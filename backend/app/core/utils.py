from typing import Any, Dict
from sqlalchemy.orm import DeclarativeMeta
import uuid
from datetime import datetime


def orm_to_dict(obj: Any, fields: list[str]) -> Dict[str, Any]:
    """
    SQLAlchemy ORM 객체를 dict로 변환합니다.
    Args:
        obj: SQLAlchemy ORM 인스턴스
        fields: 변환할 필드명 리스트
    Returns:
        dict: 변환된 딕셔너리
    """
    result = {}
    for field in fields:
        value = getattr(obj, field, None)
        # UUID, datetime 등은 그대로 넘기고, Pydantic에서 직렬화
        result[field] = value
    return result


def category_to_dict(category: Any) -> dict:
    """
    Category ORM 객체를 dict로 변환합니다.
    """
    fields = [
        "id",
        "name",
        "description",
        "country",
        "cuisine_type",
        "is_active",
        "display_order",
        "icon_url",
        "color_code",
        "created_at",
        "updated_at",
    ]
    d = orm_to_dict(category, fields)
    # menu_count는 동적 속성(있을 때만 추가)
    if hasattr(category, "menu_count"):
        d["menu_count"] = getattr(category, "menu_count")
    return d


def menu_to_dict(menu: Any) -> dict:
    """
    Menu ORM 객체를 dict로 변환합니다.
    """
    fields = [
        "id",
        "name",
        "description",
        "time_slot",
        "is_spicy",
        "is_healthy",
        "is_vegetarian",
        "is_quick",
        "has_rice",
        "has_soup",
        "has_meat",
        "ingredients",
        "cooking_time",
        "cuisine_type",
        "spicy_level",
        "display_order",
        "is_active",
        "calories",
        "protein",
        "carbs",
        "fat",
        "prep_time",
        "difficulty",
        "rating",
        "image_url",
        "created_at",
        "updated_at",
        "category_id",
    ]
    return orm_to_dict(menu, fields)


def favorite_to_dict(favorite: Any) -> dict:
    """
    Favorite ORM 객체를 dict로 변환합니다.
    """
    fields = ["id", "user_id", "menu_id", "created_at"]
    return orm_to_dict(favorite, fields)

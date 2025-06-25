from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime

from app.models.favorite import Favorite
from app.models.menu import Menu
from app.models.category import Category
from app.schemas.menu import MenuResponse, CategoryResponse


def generate_uuid() -> str:
    """UUID 생성"""
    return str(uuid.uuid4())


def format_datetime(dt: datetime) -> str:
    """날짜시간 포맷팅"""
    return dt.isoformat() if dt else None


def safe_get(obj: Any, attr: str, default: Any = None) -> Any:
    """안전한 속성 접근"""
    return getattr(obj, attr, default) if obj else default


def filter_dict(data: Dict[str, Any], exclude_none: bool = True) -> Dict[str, Any]:
    """None 값 제거 및 딕셔너리 필터링"""
    if exclude_none:
        return {k: v for k, v in data.items() if v is not None}
    return data


def orm_to_dict(obj: Any, fields: List[str]) -> Dict[str, Any]:
    """
    SQLAlchemy ORM 객체를 dict로 변환합니다.

    Args:
        obj (Any): SQLAlchemy ORM 인스턴스
        fields (List[str]): 변환할 필드명 리스트
    Returns:
        Dict[str, Any]: 변환된 딕셔너리
    """
    result: Dict[str, Any] = {}
    for field in fields:
        value = getattr(obj, field, None)
        # UUID, datetime 등은 그대로 넘기고, Pydantic에서 직렬화
        result[field] = value
    return result


def category_to_dict(category: Category) -> Dict[str, Any]:
    """카테고리 객체를 CategoryResponse 스키마에 맞게 변환"""
    if not category:
        return {}
    return {
        "id": str(category.id),
        "name": category.name,
        "description": category.description,
        "country": category.country,
        "cuisine_type": category.cuisine_type,
        "is_active": category.is_active,
        "display_order": category.display_order,
        "icon_url": getattr(category, "icon_url", None),
        "color_code": getattr(category, "color_code", None),
        "created_at": format_datetime(getattr(category, "created_at", None)),
        "menu_count": None,  # 필요시 실제 값으로 대체
    }


def menu_to_dict(menu: Menu) -> Dict[str, Any]:
    """메뉴 객체를 딕셔너리로 변환 (id, category_id는 uuid 그대로)"""
    if not menu:
        return {}

    menu_data = {
        "id": menu.id,
        "name": menu.name,
        "description": menu.description,
        "time_slot": menu.time_slot,
        "is_spicy": menu.is_spicy,
        "is_healthy": menu.is_healthy,
        "is_vegetarian": menu.is_vegetarian,
        "is_quick": menu.is_quick,
        "has_rice": menu.has_rice,
        "has_soup": menu.has_soup,
        "has_meat": menu.has_meat,
        "calories": menu.calories,
        "protein": menu.protein,
        "carbs": menu.carbs,
        "fat": menu.fat,
        "prep_time": menu.prep_time,
        "difficulty": menu.difficulty,
        "rating": menu.rating,
        "image_url": menu.image_url,
        "is_active": menu.is_active,
        "display_order": menu.display_order,
        "created_at": menu.created_at,
        "updated_at": menu.updated_at,
        "category_id": menu.category_id if hasattr(menu, "category_id") else None,
    }
    if menu.category:
        menu_data["category"] = CategoryResponse.model_validate(
            category_to_dict(menu.category)
        )
    return filter_dict(menu_data)


def favorite_to_dict(favorite: Favorite) -> Dict[str, Any]:
    """즐겨찾기 객체를 FavoriteResponse 스키마에 맞게 변환"""
    if not favorite:
        return {}

    data = {
        "id": favorite.id,
        "user_id": favorite.user_id,
        "menu_id": favorite.menu_id,
        "created_at": favorite.created_at,
    }

    if favorite.menu:
        data["menu"] = MenuResponse.model_validate(menu_to_dict(favorite.menu))

    return data


def paginate_results(
    items: List[Any], skip: int = 0, limit: int = 50, total: Optional[int] = None
) -> Dict[str, Any]:
    """페이징 결과 생성"""
    if total is None:
        total = len(items)

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total,
    }


def validate_uuid(uuid_str: str) -> bool:
    """UUID 문자열 유효성 검사"""
    try:
        uuid.UUID(uuid_str)
        return True
    except (ValueError, TypeError):
        return False


def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """리스트를 청크로 분할"""
    return [lst[i : i + chunk_size] for i in range(0, len(lst), chunk_size)]


def flatten_list(nested_list: List[List[Any]]) -> List[Any]:
    """중첩 리스트를 평면화"""
    return [item for sublist in nested_list for item in sublist]


def remove_duplicates(items: List[Any], key_func=None) -> List[Any]:
    """중복 제거 (순서 유지)"""
    seen = set()
    result = []

    for item in items:
        key = key_func(item) if key_func else item
        if key not in seen:
            seen.add(key)
            result.append(item)

    return result

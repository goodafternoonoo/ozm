"""
A/B 테스트용 추천 가중치 세트 관리 파일
- 각 ab_group별 가중치 딕셔너리 정의
- 조회 함수 제공 (향후 DB 연동 확장 가능)
"""

WEIGHT_SETS = {
    "A": {
        "spicy": 3.0,
        "healthy": 3.0,
        "vegetarian": 4.0,
        "quick": 2.0,
        "rice": 2.0,
        "soup": 2.0,
        "meat": 2.0,
    },
    "B": {
        "spicy": 2.0,
        "healthy": 4.0,
        "vegetarian": 3.0,
        "quick": 2.5,
        "rice": 2.0,
        "soup": 2.5,
        "meat": 2.0,
    },
    "C": {
        "spicy": 4.0,
        "healthy": 2.0,
        "vegetarian": 2.0,
        "quick": 3.0,
        "rice": 1.5,
        "soup": 2.0,
        "meat": 2.5,
    },
}


def get_weight_set(ab_group: str) -> dict:
    """
    ab_group별 가중치 세트 반환 (기본값 A)
    """
    return WEIGHT_SETS.get(ab_group or "A", WEIGHT_SETS["A"])

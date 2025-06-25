# 🚀 OZM 메모리 캐싱 시스템 가이드

Redis 없이도 고성능 캐싱을 구현한 메모리 기반 캐싱 시스템입니다.

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [주요 기능](#주요-기능)
3. [사용법](#사용법)
4. [캐시 전략](#캐시-전략)
5. [모니터링](#모니터링)
6. [성능 최적화](#성능-최적화)

## 🎯 시스템 개요

### 특징

-   ✅ **Redis 없이 메모리 기반 캐싱**
-   ✅ **TTL (Time To Live) 지원**
-   ✅ **LRU (Least Recently Used) 정책**
-   ✅ **스레드 안전**
-   ✅ **자동 만료 정리**
-   ✅ **상세한 통계 제공**

### 캐시 종류

```python
# 전역 캐시 (30분 TTL)
cache = MemoryCache(max_size=2000, default_ttl=1800)

# 추천 캐시 (15분 TTL)
recommendation_cache = MemoryCache(max_size=500, default_ttl=900)

# 사용자 선호도 캐시 (1시간 TTL)
user_preference_cache = MemoryCache(max_size=1000, default_ttl=3600)

# 메뉴 캐시 (2시간 TTL)
menu_cache = MemoryCache(max_size=2000, default_ttl=7200)
```

## 🔧 주요 기능

### 1. 기본 캐시 작업

```python
from app.core.cache import cache

# 값 저장
cache.set("key", "value", ttl=3600)  # 1시간 TTL

# 값 조회
value = cache.get("key")

# 값 삭제
cache.delete("key")

# 전체 캐시 삭제
cache.clear()
```

### 2. 함수 결과 캐싱

```python
from app.core.cache import cached

# 비동기 함수 캐싱
@cached(ttl=900, key_prefix="user_data")
async def get_user_data(user_id: str):
    # 복잡한 데이터베이스 쿼리
    return await db.fetch_user(user_id)

# 동기 함수 캐싱
@cached(ttl=1800, key_prefix="calc")
def calculate_complex_data(param1: int, param2: str):
    # 복잡한 계산
    return complex_calculation(param1, param2)
```

### 3. 캐시 통계

```python
from app.core.cache import get_cache_stats

# 모든 캐시의 통계 조회
stats = get_cache_stats()
print(f"캐시 히트율: {stats['main_cache']['hit_rate']}%")
```

## 📊 사용법

### 1. 추천 시스템 캐싱

```python
# 추천 결과 캐싱 (15분)
@cached(ttl=900, key_prefix="simple_rec")
async def get_simple_recommendations(time_slot, session_id, user_id):
    # 복잡한 추천 알고리즘 실행
    return recommendations

# 질답 기반 추천 캐싱 (10분)
@cached(ttl=600, key_prefix="quiz_rec")
async def get_quiz_recommendations(answers, session_id, user_id):
    # 질답 기반 추천 알고리즘 실행
    return recommendations
```

### 2. 메뉴 데이터 캐싱

```python
# 메뉴 상세 정보 캐싱 (1시간)
@cached(ttl=3600, key_prefix="menu_by_id")
async def get_menu_by_id(menu_id: uuid.UUID):
    return await db.get_menu(menu_id)

# 카테고리별 메뉴 캐싱 (30분)
@cached(ttl=1800, key_prefix="menu_by_category")
async def get_menus_by_category(category_id: uuid.UUID):
    return await db.get_menus_by_category(category_id)
```

### 3. 사용자 선호도 캐싱

```python
# 사용자 선호도 캐싱 (30분)
@cached(ttl=1800, key_prefix="user_pref")
async def get_user_preference(session_id: str, user_id: str):
    return await db.get_user_preference(session_id, user_id)
```

## 🎯 캐시 전략

### TTL 설정 가이드

```python
# 자주 변경되는 데이터 (추천 결과)
TTL_SHORT = 600  # 10분

# 중간 빈도 변경 데이터 (메뉴 목록)
TTL_MEDIUM = 1800  # 30분

# 자주 변경되지 않는 데이터 (메뉴 상세)
TTL_LONG = 3600  # 1시간

# 거의 변경되지 않는 데이터 (카테고리)
TTL_VERY_LONG = 7200  # 2시간
```

### 캐시 키 전략

```python
# 함수명 + 파라미터 해시 기반 키 생성
@cached(ttl=900, key_prefix="user_data")
async def get_user_data(user_id: str, include_profile: bool = True):
    # 키: "user_data:get_user_data:hash_of_parameters"
    pass
```

## 📈 모니터링

### 1. API를 통한 통계 조회

```bash
# 캐시 통계 조회
GET /api/v1/recommendations/cache-stats

# 응답 예시
{
  "main_cache": {
    "hits": 150,
    "misses": 50,
    "sets": 100,
    "size": 80,
    "max_size": 2000,
    "hit_rate": 75.0
  },
  "recommendation_cache": {
    "hits": 200,
    "misses": 30,
    "sets": 80,
    "size": 45,
    "max_size": 500,
    "hit_rate": 87.0
  }
}
```

### 2. 캐시 무효화

```bash
# 특정 세션의 추천 캐시 무효화
POST /api/v1/recommendations/invalidate-cache
{
  "session_id": "user-session-123"
}
```

### 3. 프로그래밍 방식 무효화

```python
from app.core.cache import (
    invalidate_recommendation_cache,
    invalidate_user_preference_cache,
    invalidate_menu_cache,
    invalidate_all_caches
)

# 추천 캐시 무효화
invalidate_recommendation_cache(session_id="user-123")

# 사용자 선호도 캐시 무효화
invalidate_user_preference_cache(user_id="user-456")

# 특정 메뉴 캐시 무효화
invalidate_menu_cache(menu_id="menu-789")

# 모든 캐시 무효화
invalidate_all_caches()
```

## ⚡ 성능 최적화

### 1. 캐시 크기 최적화

```python
# 메모리 사용량과 성능의 균형
RECOMMENDATION_CACHE_SIZE = 500    # 추천 결과는 적게
USER_PREFERENCE_CACHE_SIZE = 1000  # 사용자 선호도는 중간
MENU_CACHE_SIZE = 2000             # 메뉴 데이터는 많이
```

### 2. TTL 최적화

```python
# 데이터 변경 빈도에 따른 TTL 설정
RECOMMENDATION_TTL = 900   # 15분 (자주 변경)
MENU_TTL = 3600           # 1시간 (중간 변경)
CATEGORY_TTL = 7200       # 2시간 (거의 변경 안됨)
```

### 3. 캐시 히트율 모니터링

```python
# 좋은 캐시 히트율 목표
TARGET_HIT_RATE = 80.0  # 80% 이상

# 히트율이 낮으면 TTL 조정 고려
if cache_stats['hit_rate'] < TARGET_HIT_RATE:
    # TTL을 늘리거나 캐시 크기를 늘리는 것을 고려
    pass
```

## 🔍 디버깅

### 1. 로그 확인

```python
# 캐시 관련 로그 레벨 설정
import logging
logging.getLogger('app.core.cache').setLevel(logging.DEBUG)
```

### 2. 캐시 상태 확인

```python
# 캐시 크기와 사용량 확인
stats = get_cache_stats()
for cache_name, cache_stats in stats.items():
    print(f"{cache_name}: {cache_stats['size']}/{cache_stats['max_size']}")
```

### 3. 메모리 사용량 모니터링

```python
import psutil
import os

def get_memory_usage():
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024  # MB

print(f"현재 메모리 사용량: {get_memory_usage():.2f} MB")
```

## 🚨 주의사항

### 1. 메모리 관리

-   캐시 크기를 적절히 설정하여 메모리 부족 방지
-   주기적인 캐시 정리 스케줄러 활용
-   프로덕션 환경에서는 메모리 사용량 모니터링

### 2. 데이터 일관성

-   중요한 데이터 변경 시 적절한 캐시 무효화
-   캐시된 데이터의 정확성 확인
-   TTL 설정을 데이터 변경 빈도에 맞게 조정

### 3. 확장성

-   단일 서버 환경에서만 사용 가능
-   다중 서버 환경에서는 Redis 도입 고려
-   캐시 크기는 서버 메모리에 맞게 조정

## 📝 예제 코드

### 완전한 예제

```python
from app.core.cache import cached, cache
from typing import List

class MenuService:
    @cached(ttl=3600, key_prefix="menu_detail")
    async def get_menu_detail(self, menu_id: str) -> dict:
        """메뉴 상세 정보 조회 (1시간 캐싱)"""
        # 복잡한 데이터베이스 쿼리
        menu = await self.db.get_menu_with_relations(menu_id)
        return menu.to_dict()

    @cached(ttl=1800, key_prefix="menu_list")
    async def get_menu_list(self, category_id: str, page: int = 1) -> List[dict]:
        """메뉴 목록 조회 (30분 캐싱)"""
        # 페이징된 메뉴 목록 조회
        menus = await self.db.get_menus_by_category(category_id, page)
        return [menu.to_dict() for menu in menus]

    async def update_menu(self, menu_id: str, data: dict):
        """메뉴 업데이트 시 캐시 무효화"""
        # 메뉴 업데이트
        await self.db.update_menu(menu_id, data)

        # 관련 캐시 무효화
        cache.delete(f"menu_detail:{menu_id}")
        cache.delete(f"menu_list:{data.get('category_id')}")
```

이 가이드를 통해 Redis 없이도 효율적인 캐싱 시스템을 구축하고 운영할 수 있습니다! 🎉

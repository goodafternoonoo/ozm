import asyncio
import hashlib
import json
import pickle
import threading
import time
from collections import OrderedDict
from functools import lru_cache, wraps
from typing import Any, Callable, Dict, Optional, Union

from app.core.logging import get_logger

logger = get_logger(__name__)


class MemoryCache:
    """
    메모리 기반 캐싱 시스템
    - TTL 지원
    - LRU (Least Recently Used) 정책
    - 스레드 안전
    - 키 기반 캐싱
    """

    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        """
        Args:
            max_size: 최대 캐시 항목 수
            default_ttl: 기본 TTL (초)
        """
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: OrderedDict = OrderedDict()
        self._lock = threading.RLock()
        self._stats = {"hits": 0, "misses": 0, "sets": 0, "deletes": 0, "expired": 0}

    def _generate_key(self, *args, **kwargs) -> str:
        """캐시 키 생성"""
        # 인자를 JSON으로 직렬화하여 키 생성
        key_data = {"args": args, "kwargs": sorted(kwargs.items())}
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_str.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 조회"""
        with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]

                # 만료 확인
                if expiry and time.time() > expiry:
                    del self._cache[key]
                    self._stats["expired"] += 1
                    self._stats["misses"] += 1
                    logger.debug(f"캐시 만료: {key}")
                    return None

                # LRU 업데이트
                self._cache.move_to_end(key)
                self._stats["hits"] += 1
                logger.debug(f"캐시 히트: {key}")
                return value

            self._stats["misses"] += 1
            logger.debug(f"캐시 미스: {key}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """캐시에 값 저장"""
        with self._lock:
            # TTL 설정
            expiry = None
            if ttl is not None:
                expiry = time.time() + ttl
            elif self.default_ttl:
                expiry = time.time() + self.default_ttl

            # 캐시 크기 제한 확인
            if len(self._cache) >= self.max_size:
                # 가장 오래된 항목 제거
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
                logger.debug(f"캐시 크기 제한으로 항목 제거: {oldest_key}")

            self._cache[key] = (value, expiry)
            self._stats["sets"] += 1
            logger.debug(f"캐시 설정: {key}, TTL: {ttl}s")

    def delete(self, key: str) -> bool:
        """캐시에서 항목 삭제"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                self._stats["deletes"] += 1
                logger.debug(f"캐시 삭제: {key}")
                return True
            return False

    def clear(self) -> None:
        """전체 캐시 삭제"""
        with self._lock:
            self._cache.clear()
            logger.info("캐시 전체 삭제")

    def get_stats(self) -> Dict[str, int]:
        """캐시 통계 반환"""
        with self._lock:
            total_requests = self._stats["hits"] + self._stats["misses"]
            hit_rate = (
                (self._stats["hits"] / total_requests * 100)
                if total_requests > 0
                else 0
            )

            return {
                **self._stats,
                "size": len(self._cache),
                "max_size": self.max_size,
                "hit_rate": round(hit_rate, 2),
            }

    def cleanup_expired(self) -> int:
        """만료된 항목 정리"""
        with self._lock:
            expired_count = 0
            current_time = time.time()

            expired_keys = [
                key
                for key, (_, expiry) in self._cache.items()
                if expiry and current_time > expiry
            ]

            for key in expired_keys:
                del self._cache[key]
                expired_count += 1

            if expired_count > 0:
                logger.info(f"만료된 캐시 항목 {expired_count}개 정리")

            return expired_count


# 전역 캐시 인스턴스
cache = MemoryCache(max_size=2000, default_ttl=1800)  # 30분 기본 TTL


def cached(ttl: Optional[int] = None, key_prefix: str = ""):
    """
    함수 결과 캐싱 데코레이터

    Args:
        ttl: 캐시 TTL (초), None이면 기본값 사용
        key_prefix: 캐시 키 접두사
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = (
                f"{key_prefix}:{func.__name__}:{cache._generate_key(*args, **kwargs)}"
            )

            # 캐시에서 조회
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # 함수 실행
            result = await func(*args, **kwargs)

            # 결과 캐싱
            cache.set(cache_key, result, ttl)
            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = (
                f"{key_prefix}:{func.__name__}:{cache._generate_key(*args, **kwargs)}"
            )

            # 캐시에서 조회
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # 함수 실행
            result = func(*args, **kwargs)

            # 결과 캐싱
            cache.set(cache_key, result, ttl)
            return result

        # 비동기 함수인지 확인
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def cache_key(*args, **kwargs) -> str:
    """캐시 키 생성 헬퍼 함수"""
    return cache._generate_key(*args, **kwargs)


# 특정 용도별 캐시 인스턴스
recommendation_cache = MemoryCache(max_size=500, default_ttl=900)  # 15분
user_preference_cache = MemoryCache(max_size=1000, default_ttl=3600)  # 1시간
menu_cache = MemoryCache(max_size=2000, default_ttl=7200)  # 2시간


# 주기적 정리 스케줄러
def start_cache_cleanup_scheduler():
    """캐시 정리 스케줄러 시작"""

    def cleanup_task():
        while True:
            try:
                time.sleep(300)  # 5분마다 실행
                cache.cleanup_expired()
                recommendation_cache.cleanup_expired()
                user_preference_cache.cleanup_expired()
                menu_cache.cleanup_expired()
            except Exception as e:
                logger.error(f"캐시 정리 중 오류: {e}")

    cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
    cleanup_thread.start()
    logger.info("캐시 정리 스케줄러 시작")


# 캐시 통계 API용 함수
def get_cache_stats() -> Dict[str, Dict[str, Union[int, float]]]:
    """모든 캐시의 통계 반환"""
    return {
        "main_cache": cache.get_stats(),
        "recommendation_cache": recommendation_cache.get_stats(),
        "user_preference_cache": user_preference_cache.get_stats(),
        "menu_cache": menu_cache.get_stats(),
    }


# 캐시 무효화 헬퍼 함수들
def invalidate_recommendation_cache(session_id: str = None, user_id: str = None):
    """추천 캐시 무효화"""
    if session_id:
        # 세션별 캐시 무효화 로직 구현
        # 키 패턴으로 세션 관련 캐시만 삭제
        keys_to_delete = []
        for key in recommendation_cache._cache.keys():
            if session_id in key:
                keys_to_delete.append(key)

        for key in keys_to_delete:
            recommendation_cache.delete(key)

        logger.info(f"세션 {session_id}의 추천 캐시 무효화 완료")
    else:
        recommendation_cache.clear()
        logger.info("전체 추천 캐시 무효화 완료")


def invalidate_user_preference_cache(user_id: str = None, session_id: str = None):
    """사용자 선호도 캐시 무효화"""
    if user_id or session_id:
        # 특정 사용자/세션 관련 캐시만 무효화
        keys_to_delete = []
        for key in user_preference_cache._cache.keys():
            if (user_id and user_id in key) or (session_id and session_id in key):
                keys_to_delete.append(key)

        for key in keys_to_delete:
            user_preference_cache.delete(key)

        logger.info(f"사용자 {user_id or session_id}의 선호도 캐시 무효화 완료")
    else:
        user_preference_cache.clear()
        logger.info("전체 사용자 선호도 캐시 무효화 완료")


def invalidate_menu_cache(menu_id: str = None, category_id: str = None):
    """메뉴 캐시 무효화"""
    if menu_id:
        # 특정 메뉴 캐시만 무효화
        keys_to_delete = []
        for key in menu_cache._cache.keys():
            if menu_id in key:
                keys_to_delete.append(key)

        for key in keys_to_delete:
            menu_cache.delete(key)

        logger.info(f"메뉴 {menu_id}의 캐시 무효화 완료")
    elif category_id:
        # 특정 카테고리 메뉴 캐시 무효화
        keys_to_delete = []
        for key in menu_cache._cache.keys():
            if category_id in key:
                keys_to_delete.append(key)

        for key in keys_to_delete:
            menu_cache.delete(key)

        logger.info(f"카테고리 {category_id}의 메뉴 캐시 무효화 완료")
    else:
        menu_cache.clear()
        logger.info("전체 메뉴 캐시 무효화 완료")


def invalidate_all_caches():
    """모든 캐시 무효화"""
    cache.clear()
    recommendation_cache.clear()
    user_preference_cache.clear()
    menu_cache.clear()
    logger.info("모든 캐시 무효화 완료")

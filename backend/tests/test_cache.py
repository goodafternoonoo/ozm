import pytest
import pytest_asyncio
import time
import uuid
from app.core.cache import (
    MemoryCache,
    cache,
    recommendation_cache,
    user_preference_cache,
    menu_cache,
    cached,
    get_cache_stats,
    invalidate_recommendation_cache,
    invalidate_user_preference_cache,
    invalidate_menu_cache,
    invalidate_all_caches,
)


class TestMemoryCache:
    """메모리 캐시 테스트"""

    def test_cache_initialization(self):
        """캐시 초기화 테스트"""
        test_cache = MemoryCache(max_size=100, default_ttl=60)
        assert test_cache.max_size == 100
        assert test_cache.default_ttl == 60
        assert len(test_cache._cache) == 0

    def test_cache_set_and_get(self):
        """캐시 설정 및 조회 테스트"""
        test_cache = MemoryCache(max_size=10, default_ttl=60)

        # 값 설정
        test_cache.set("test_key", "test_value")

        # 값 조회
        result = test_cache.get("test_key")
        assert result == "test_value"

        # 존재하지 않는 키 조회
        result = test_cache.get("non_existent_key")
        assert result is None

    def test_cache_ttl_expiration(self):
        """캐시 TTL 만료 테스트"""
        test_cache = MemoryCache(max_size=10, default_ttl=1)  # 1초 TTL

        # 값 설정
        test_cache.set("test_key", "test_value", ttl=1)

        # 즉시 조회 (캐시 히트)
        result = test_cache.get("test_key")
        assert result == "test_value"

        # 1.1초 대기 후 조회 (만료됨)
        time.sleep(1.1)
        result = test_cache.get("test_key")
        assert result is None

    def test_cache_lru_eviction(self):
        """LRU 캐시 제거 테스트"""
        test_cache = MemoryCache(max_size=3, default_ttl=60)

        # 3개 항목 추가
        test_cache.set("key1", "value1")
        test_cache.set("key2", "value2")
        test_cache.set("key3", "value3")

        # 4번째 항목 추가 (가장 오래된 항목 제거)
        test_cache.set("key4", "value4")

        # key1이 제거되었는지 확인
        assert test_cache.get("key1") is None
        assert test_cache.get("key2") == "value2"
        assert test_cache.get("key3") == "value3"
        assert test_cache.get("key4") == "value4"

    def test_cache_stats(self):
        """캐시 통계 테스트"""
        test_cache = MemoryCache(max_size=10, default_ttl=60)

        # 초기 통계
        stats = test_cache.get_stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["sets"] == 0

        # 값 설정
        test_cache.set("test_key", "test_value")

        # 히트
        test_cache.get("test_key")

        # 미스
        test_cache.get("non_existent_key")

        # 통계 확인
        stats = test_cache.get_stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["sets"] == 1
        assert stats["size"] == 1

    def test_cache_cleanup_expired(self):
        """만료된 항목 정리 테스트"""
        test_cache = MemoryCache(max_size=10, default_ttl=60)

        # 만료될 항목 추가
        test_cache.set("expired_key", "expired_value", ttl=1)

        # 만료되지 않을 항목 추가
        test_cache.set("valid_key", "valid_value", ttl=60)

        # 1.1초 대기
        time.sleep(1.1)

        # 만료된 항목 정리
        expired_count = test_cache.cleanup_expired()
        assert expired_count == 1

        # 유효한 항목은 남아있는지 확인
        assert test_cache.get("valid_key") == "valid_value"
        assert test_cache.get("expired_key") is None


class TestCacheDecorator:
    """캐시 데코레이터 테스트"""

    @pytest.mark.asyncio
    async def test_async_cached_function(self):
        """비동기 함수 캐싱 테스트"""
        call_count = 0

        @cached(ttl=60, key_prefix="test_async")
        async def test_async_func(param1: str, param2: int):
            nonlocal call_count
            call_count += 1
            return f"{param1}_{param2}_{call_count}"

        # 첫 번째 호출
        result1 = await test_async_func("test", 123)
        assert result1 == "test_123_1"
        assert call_count == 1

        # 두 번째 호출 (캐시 히트)
        result2 = await test_async_func("test", 123)
        assert result2 == "test_123_1"  # 같은 결과
        assert call_count == 1  # 함수는 다시 호출되지 않음

        # 다른 파라미터로 호출
        result3 = await test_async_func("test", 456)
        assert result3 == "test_456_2"
        assert call_count == 2

    def test_sync_cached_function(self):
        """동기 함수 캐싱 테스트"""
        call_count = 0

        @cached(ttl=60, key_prefix="test_sync")
        def test_sync_func(param1: str, param2: int):
            nonlocal call_count
            call_count += 1
            return f"{param1}_{param2}_{call_count}"

        # 첫 번째 호출
        result1 = test_sync_func("test", 123)
        assert result1 == "test_123_1"
        assert call_count == 1

        # 두 번째 호출 (캐시 히트)
        result2 = test_sync_func("test", 123)
        assert result2 == "test_123_1"  # 같은 결과
        assert call_count == 1  # 함수는 다시 호출되지 않음


class TestCacheInvalidation:
    """캐시 무효화 테스트"""

    def test_recommendation_cache_invalidation(self):
        """추천 캐시 무효화 테스트"""
        # 테스트 데이터 추가
        recommendation_cache.set("test_key", "test_value")
        assert recommendation_cache.get("test_key") == "test_value"

        # 캐시 무효화
        invalidate_recommendation_cache()
        assert recommendation_cache.get("test_key") is None

    def test_user_preference_cache_invalidation(self):
        """사용자 선호도 캐시 무효화 테스트"""
        # 테스트 데이터 추가
        user_preference_cache.set("test_key", "test_value")
        assert user_preference_cache.get("test_key") == "test_value"

        # 캐시 무효화
        invalidate_user_preference_cache()
        assert user_preference_cache.get("test_key") is None

    def test_menu_cache_invalidation(self):
        """메뉴 캐시 무효화 테스트"""
        # 테스트 데이터 추가
        menu_cache.set("test_key", "test_value")
        assert menu_cache.get("test_key") == "test_value"

        # 캐시 무효화
        invalidate_menu_cache()
        assert menu_cache.get("test_key") is None

    def test_all_caches_invalidation(self):
        """모든 캐시 무효화 테스트"""
        # 모든 캐시에 테스트 데이터 추가
        cache.set("test_key1", "test_value1")
        recommendation_cache.set("test_key2", "test_value2")
        user_preference_cache.set("test_key3", "test_value3")
        menu_cache.set("test_key4", "test_value4")

        # 모든 캐시 무효화
        invalidate_all_caches()

        # 모든 캐시가 비어있는지 확인
        assert cache.get("test_key1") is None
        assert recommendation_cache.get("test_key2") is None
        assert user_preference_cache.get("test_key3") is None
        assert menu_cache.get("test_key4") is None


class TestCacheStats:
    """캐시 통계 테스트"""

    def test_get_cache_stats(self):
        """캐시 통계 조회 테스트"""
        # 일부 캐시에 데이터 추가
        cache.set("test_key", "test_value")
        recommendation_cache.set("test_key", "test_value")

        # 통계 조회
        stats = get_cache_stats()

        # 모든 캐시의 통계가 포함되어 있는지 확인
        assert "main_cache" in stats
        assert "recommendation_cache" in stats
        assert "user_preference_cache" in stats
        assert "menu_cache" in stats

        # 각 캐시의 통계 구조 확인
        for cache_name, cache_stats in stats.items():
            assert "hits" in cache_stats
            assert "misses" in cache_stats
            assert "sets" in cache_stats
            assert "size" in cache_stats
            assert "max_size" in cache_stats
            assert "hit_rate" in cache_stats


if __name__ == "__main__":
    pytest.main([__file__])

import os
import sys
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings


def is_testing():
    """테스트 환경인지 확인"""
    return (
        os.getenv("TESTING") == "true"
        or "pytest" in sys.modules
        or "test" in os.getenv("PYTEST_CURRENT_TEST", "")
        or any("pytest" in arg for arg in sys.argv)
    )


# 데이터베이스 URL 설정
if is_testing():
    # 테스트 환경: PostgreSQL 테스트 데이터베이스 사용
    DATABASE_URL = settings.test_database_url.replace(
        "postgresql://", "postgresql+asyncpg://"
    )
else:
    # 개발/운영 환경: PostgreSQL 사용
    DATABASE_URL = settings.database_url.replace(
        "postgresql://", "postgresql+asyncpg://"
    )

# 엔진 설정
engine_kwargs = {
    "echo": settings.debug,  # 디버그 모드에서만 SQL 로그 출력
    "pool_pre_ping": True,  # 연결 상태 확인
    "pool_recycle": 3600,  # 1시간마다 연결 재생성
}

# 테스트 환경에서는 연결 풀 비활성화
if is_testing():
    engine_kwargs["poolclass"] = NullPool
else:
    # 개발/운영 환경에서만 연결 풀 설정
    engine_kwargs.update(
        {
            "pool_size": 10,  # 연결 풀 크기
            "max_overflow": 20,  # 최대 오버플로우 연결 수
        }
    )

# 비동기 엔진 생성
async_engine = create_async_engine(DATABASE_URL, **engine_kwargs)

# 세션 팩토리 생성
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base 클래스 생성 (SQLAlchemy 2.0 스타일)
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    데이터베이스 세션 의존성
    FastAPI의 Depends에서 사용
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    데이터베이스 초기화
    테이블 생성 및 초기 데이터 삽입
    """
    async with async_engine.begin() as conn:
        # 테이블 생성
        await conn.run_sync(Base.metadata.create_all)

        # 초기 데이터 삽입 (테스트 환경이 아닌 경우에만)
        if not is_testing():
            from app.db.init_db import init_sample_data

            await init_sample_data(conn)


async def close_db():
    """
    데이터베이스 연결 종료
    애플리케이션 종료 시 호출
    """
    await async_engine.dispose()

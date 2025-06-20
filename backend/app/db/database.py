from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
import os
import sys

Base = declarative_base()

# 동기 엔진 (마이그레이션용)
SYNC_DATABASE_URL = settings.database_url.replace(
    "postgresql://", "postgresql+psycopg2://"
)
sync_engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


# 비동기 엔진 (API용)
def is_testing():
    return (
        os.getenv("TESTING") == "true"
        or "pytest" in sys.modules
        or "test" in os.getenv("PYTEST_CURRENT_TEST", "")
        or any("pytest" in arg for arg in sys.argv)
    )


if is_testing():
    # 파일 기반 SQLite DB 사용 (테스트용)
    ASYNC_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
    async_engine = create_async_engine(
        ASYNC_DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    ASYNC_DATABASE_URL = settings.database_url.replace(
        "postgresql://", "postgresql+asyncpg://"
    )
    async_engine = create_async_engine(
        ASYNC_DATABASE_URL,
        echo=True,
        pool_size=1,
        max_overflow=0,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )


async def get_db() -> AsyncSession:
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
import os
import sys
import uuid
from sqlalchemy import TypeDecorator, String


# GUID 타입 정의 (UUID 지원)
class GUID(TypeDecorator):
    impl = String
    cache_ok = True  # 캐시 경고 해결

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            else:
                return value


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
    # 테스트 환경: SQLite 사용
    DATABASE_URL = "sqlite+aiosqlite:///./test.db"
    async_engine = create_async_engine(
        DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
    )
else:
    # 개발/운영 환경: PostgreSQL 사용
    DATABASE_URL = settings.database_url.replace(
        "postgresql://", "postgresql+asyncpg://"
    )
    async_engine = create_async_engine(
        DATABASE_URL,
        echo=True if settings.debug else False,
        pool_pre_ping=True,
        pool_recycle=300,
    )

# 세션 팩토리 생성
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base 클래스 생성
Base = declarative_base()

# 동기 엔진 (마이그레이션용)
SYNC_DATABASE_URL = settings.database_url.replace(
    "postgresql://", "postgresql+psycopg2://"
)
sync_engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


async def get_db() -> AsyncSession:
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

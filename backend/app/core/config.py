import os
from typing import Optional
from pydantic import Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """애플리케이션 설정"""

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # 추가 필드 무시
    )

    # 기본 설정
    app_name: str = Field("OZM Menu Recommendation", description="애플리케이션 이름")
    version: str = Field("1.0.0", description="애플리케이션 버전")
    debug: bool = Field(False, description="디버그 모드")

    # 데이터베이스 설정
    database_url: str = Field(
        os.getenv("DATABASE_URL"),
        description="메인 데이터베이스 URL",
    )
    test_database_url: str = Field(
        os.getenv("TEST_DATABASE_URL"),
        description="테스트 데이터베이스 URL",
    )

    # JWT 설정
    jwt_secret_key: str = Field(
        "your-super-secret-jwt-key-that-is-at-least-32-characters-long",
        description="JWT 시크릿 키",
    )
    jwt_algorithm: str = Field("HS256", description="JWT 알고리즘")
    jwt_expire_minutes: int = Field(10080, description="JWT 만료 시간(분)")  # 7일

    # 카카오 설정
    kakao_client_id: Optional[str] = Field(None, description="카카오 클라이언트 ID")
    kakao_client_secret: Optional[str] = Field(
        None, description="카카오 클라이언트 시크릿"
    )
    kakao_redirect_uri: Optional[str] = Field(None, description="카카오 리다이렉트 URI")

    # CORS 설정
    cors_origins: list = Field(
        ["http://localhost:3000", "http://localhost:8080"],
        description="CORS 허용 오리진",
    )

    # API 설정
    api_prefix: str = Field("/api/v1", description="API 접두사")
    docs_url: str = Field("/docs", description="API 문서 URL")
    redoc_url: str = Field("/redoc", description="ReDoc URL")

    # 로깅 설정
    log_level: str = Field("INFO", description="로그 레벨")
    log_format: str = Field(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s", description="로그 포맷"
    )

    # 캐시 설정
    redis_url: Optional[str] = Field(None, description="Redis URL")
    cache_ttl: int = Field(3600, description="캐시 TTL(초)")

    # 파일 업로드 설정
    upload_dir: str = Field("./uploads", description="파일 업로드 디렉토리")
    max_file_size: int = Field(5 * 1024 * 1024, description="최대 파일 크기(바이트)")
    allowed_file_types: list = Field(
        ["jpg", "jpeg", "png", "gif"], description="허용된 파일 타입"
    )

    @field_validator("database_url", "test_database_url")
    @classmethod
    def validate_database_url(cls, v):
        """데이터베이스 URL 검증"""
        if not v.startswith(("postgresql://", "postgresql+asyncpg://")):
            raise ValueError("데이터베이스 URL은 PostgreSQL 형식이어야 합니다.")
        return v

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret_key(cls, v):
        """JWT 시크릿 키 검증"""
        if len(v) < 32:
            raise ValueError("JWT 시크릿 키는 최소 32자 이상이어야 합니다.")
        return v

    @field_validator("jwt_expire_minutes")
    @classmethod
    def validate_jwt_expire_minutes(cls, v):
        """JWT 만료 시간 검증"""
        if v < 1:
            raise ValueError("JWT 만료 시간은 최소 1분 이상이어야 합니다.")
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def validate_cors_origins(cls, v):
        """CORS 오리진 검증"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache()
def get_settings() -> Settings:
    """설정 인스턴스 반환 (캐싱)"""
    return Settings()


# 전역 설정 인스턴스
settings = get_settings()


def is_testing() -> bool:
    """테스트 환경인지 확인"""
    return os.getenv("TESTING", "false").lower() == "true"


def get_database_url() -> str:
    """환경에 따른 데이터베이스 URL 반환"""
    if is_testing():
        return settings.test_database_url
    return settings.database_url

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 환경 구분
    env: str = "development"  # development, production, test 등

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/menu_recommendation"
    test_database_url: str = "sqlite:///./test.db"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True

    # Security
    secret_key: str = "your-secret-key-here"

    model_config = ConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()

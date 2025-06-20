import pytest
import pytest_asyncio
from httpx import AsyncClient
from unittest.mock import patch
from main import app
from app.db.database import async_engine, Base
from app.db.init_db import init_db
import asyncio


@pytest_asyncio.fixture(autouse=True, scope="function")
async def setup_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await init_db()


@pytest.mark.asyncio
@patch("app.services.auth_service.requests.get")
async def test_kakao_login_success(mock_kakao_get):
    """
    카카오 access_token 정상 → JWT 토큰 반환
    """
    # 카카오 API 응답 모킹
    mock_kakao_get.return_value.status_code = 200
    mock_kakao_get.return_value.json.return_value = {
        "id": "123456789",
        "properties": {"nickname": "테스트유저"},
        "kakao_account": {"email": "test@kakao.com"},
    }
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/kakao-login",
            json={"access_token": "fake-access-token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"


@pytest.mark.asyncio
@patch("app.services.auth_service.requests.get")
async def test_kakao_login_fail(mock_kakao_get):
    """
    카카오 access_token 잘못됨 → 401 에러
    """
    mock_kakao_get.return_value.status_code = 401
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/kakao-login",
            json={"access_token": "invalid-token"},
        )
        assert resp.status_code == 401
        data = resp.json()
        assert data["detail"] == "카카오 인증 실패"

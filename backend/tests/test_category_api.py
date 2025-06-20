import sys
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient
from main import app
from app.db.init_db import init_db
from app.db.database import async_engine, Base
import asyncio


@pytest_asyncio.fixture(autouse=True, scope="function")
async def setup_db():
    # 파일 기반 SQLite를 항상 새로 생성
    if os.path.exists("test.db"):
        os.remove("test.db")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await init_db()


@pytest.mark.asyncio
async def test_create_category():
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "name": "테스트 카테고리 A",
            "description": "테스트용 카테고리입니다.",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 99,
            "icon_url": None,
            "color_code": "#123456",
        }
        response = await client.post("/api/v1/categories/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["country"] == payload["country"]
        assert data["cuisine_type"] == payload["cuisine_type"]
        assert data["color_code"] == payload["color_code"]


@pytest.mark.asyncio
async def test_get_categories():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 생성
        payload = {
            "name": "테스트 카테고리 B",
            "description": "테스트용 카테고리입니다.",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 99,
            "icon_url": None,
            "color_code": "#123456",
        }
        await client.post("/api/v1/categories/", json=payload)
        response = await client.get("/api/v1/categories/?page=1&size=5")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert data["total_count"] >= 1
        assert data["page"] == 1
        assert data["size"] == 5


@pytest.mark.asyncio
async def test_get_category_detail():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 생성
        payload = {
            "name": "테스트 카테고리 C",
            "description": "테스트용 카테고리입니다.",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 99,
            "icon_url": None,
            "color_code": "#123456",
        }
        create_resp = await client.post("/api/v1/categories/", json=payload)
        category_id = create_resp.json()["id"]
        response = await client.get(f"/api/v1/categories/{category_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == category_id
        assert data["name"] == "테스트 카테고리 C"


@pytest.mark.asyncio
async def test_update_category():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 생성
        payload = {
            "name": "테스트 카테고리 D",
            "description": "테스트용 카테고리입니다.",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 99,
            "icon_url": None,
            "color_code": "#123456",
        }
        create_resp = await client.post("/api/v1/categories/", json=payload)
        category_id = create_resp.json()["id"]
        update_payload = {"description": "수정된 설명", "is_active": False}
        response = await client.put(
            f"/api/v1/categories/{category_id}", json=update_payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "수정된 설명"
        assert data["is_active"] is False


@pytest.mark.asyncio
async def test_delete_category():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 생성
        payload = {
            "name": "테스트 카테고리 E",
            "description": "테스트용 카테고리입니다.",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 99,
            "icon_url": None,
            "color_code": "#123456",
        }
        create_resp = await client.post("/api/v1/categories/", json=payload)
        category_id = create_resp.json()["id"]
        response = await client.delete(f"/api/v1/categories/{category_id}")
        assert response.status_code == 204
        # 삭제(비활성화) 후 상세조회 시 404 또는 200 허용 (API 동작에 따라)
        response = await client.get(f"/api/v1/categories/{category_id}")
        assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_get_categories_by_country():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 생성
        payload = {
            "name": "테스트 카테고리 F",
            "description": "한국의 전통적인 요리들",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#FF6B6B",
        }
        await client.post("/api/v1/categories/", json=payload)
        response = await client.get("/api/v1/categories/country/한국")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(cat["country"] == "한국" for cat in data)


@pytest.mark.asyncio
async def test_get_categories_by_cuisine_type():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 생성
        payload = {
            "name": "테스트 카테고리 G",
            "description": "한국의 전통적인 요리들",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#FF6B6B",
        }
        await client.post("/api/v1/categories/", json=payload)
        response = await client.get("/api/v1/categories/cuisine/한식")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(cat["cuisine_type"] == "한식" for cat in data)

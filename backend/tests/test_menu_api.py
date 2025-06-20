import os
import pytest
import pytest_asyncio
from httpx import AsyncClient
from main import app
from app.db.init_db import init_db
from app.db.database import async_engine, Base
import uuid


@pytest_asyncio.fixture(autouse=True, scope="function")
async def setup_db():
    if os.path.exists("test.db"):
        os.remove("test.db")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await init_db()


@pytest.mark.asyncio
async def test_create_menu():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 먼저 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리 A",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#123456",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        # 메뉴 생성
        menu_payload = {
            "name": "테스트 메뉴 A",
            "description": "테스트용 메뉴입니다.",
            "time_slot": "breakfast",
            "is_spicy": True,
            "is_healthy": False,
            "is_vegetarian": False,
            "is_quick": True,
            "has_rice": True,
            "has_soup": False,
            "has_meat": True,
            "calories": 500,
            "protein": 20.5,
            "carbs": 60.0,
            "fat": 10.0,
            "prep_time": 20,
            "difficulty": "easy",
            "rating": 4.2,
            "image_url": None,
            "category_id": category_id,
        }
        resp = await client.post("/api/v1/menus/", json=menu_payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == menu_payload["name"]
        assert data["category_id"] == category_id


@pytest.mark.asyncio
async def test_get_menus():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 및 메뉴 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리 B",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 2,
            "icon_url": None,
            "color_code": "#654321",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "테스트 메뉴 B",
            "description": "테스트용 메뉴입니다.",
            "time_slot": "lunch",
            "is_spicy": False,
            "is_healthy": True,
            "is_vegetarian": True,
            "is_quick": False,
            "has_rice": False,
            "has_soup": True,
            "has_meat": False,
            "calories": 350,
            "protein": 12.0,
            "carbs": 45.0,
            "fat": 8.0,
            "prep_time": 15,
            "difficulty": "medium",
            "rating": 3.8,
            "image_url": None,
            "category_id": category_id,
        }
        await client.post("/api/v1/menus/", json=menu_payload)
        resp = await client.get("/api/v1/menus/")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert any(menu["name"] == "테스트 메뉴 B" for menu in data)


@pytest.mark.asyncio
async def test_get_menu_detail():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 및 메뉴 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리 C",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 3,
            "icon_url": None,
            "color_code": "#abcdef",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "테스트 메뉴 C",
            "description": "테스트용 메뉴입니다.",
            "time_slot": "dinner",
            "is_spicy": False,
            "is_healthy": False,
            "is_vegetarian": True,
            "is_quick": True,
            "has_rice": True,
            "has_soup": True,
            "has_meat": False,
            "calories": 400,
            "protein": 15.0,
            "carbs": 55.0,
            "fat": 7.0,
            "prep_time": 10,
            "difficulty": "easy",
            "rating": 4.0,
            "image_url": None,
            "category_id": category_id,
        }
        menu_resp = await client.post("/api/v1/menus/", json=menu_payload)
        menu_id = menu_resp.json()["id"]
        resp = await client.get(f"/api/v1/menus/{menu_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == menu_id
        assert data["name"] == "테스트 메뉴 C"


@pytest.mark.asyncio
async def test_update_menu():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 및 메뉴 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리 D",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 4,
            "icon_url": None,
            "color_code": "#fedcba",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "테스트 메뉴 D",
            "description": "테스트용 메뉴입니다.",
            "time_slot": "lunch",
            "is_spicy": True,
            "is_healthy": True,
            "is_vegetarian": False,
            "is_quick": False,
            "has_rice": False,
            "has_soup": False,
            "has_meat": True,
            "calories": 600,
            "protein": 30.0,
            "carbs": 70.0,
            "fat": 15.0,
            "prep_time": 25,
            "difficulty": "hard",
            "rating": 4.7,
            "image_url": None,
            "category_id": category_id,
        }
        menu_resp = await client.post("/api/v1/menus/", json=menu_payload)
        menu_id = menu_resp.json()["id"]
        update_payload = {"description": "수정된 설명", "is_spicy": False}
        resp = await client.put(f"/api/v1/menus/{menu_id}", json=update_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["description"] == "수정된 설명"
        assert data["is_spicy"] is False


@pytest.mark.asyncio
async def test_delete_menu():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 및 메뉴 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리 E",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 5,
            "icon_url": None,
            "color_code": "#aabbcc",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "테스트 메뉴 E",
            "description": "테스트용 메뉴입니다.",
            "time_slot": "breakfast",
            "is_spicy": False,
            "is_healthy": True,
            "is_vegetarian": True,
            "is_quick": True,
            "has_rice": True,
            "has_soup": False,
            "has_meat": False,
            "calories": 250,
            "protein": 8.0,
            "carbs": 35.0,
            "fat": 4.0,
            "prep_time": 12,
            "difficulty": "easy",
            "rating": 3.5,
            "image_url": None,
            "category_id": category_id,
        }
        menu_resp = await client.post("/api/v1/menus/", json=menu_payload)
        menu_id = menu_resp.json()["id"]
        resp = await client.delete(f"/api/v1/menus/{menu_id}")
        assert resp.status_code == 204
        # 삭제 후 상세조회 시 404 반환 확인
        resp = await client.get(f"/api/v1/menus/{menu_id}")
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_menus_by_time_slot():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 및 메뉴 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리 F",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 6,
            "icon_url": None,
            "color_code": "#ccffaa",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "테스트 메뉴 F",
            "description": "테스트용 메뉴입니다.",
            "time_slot": "dinner",
            "is_spicy": True,
            "is_healthy": False,
            "is_vegetarian": False,
            "is_quick": False,
            "has_rice": False,
            "has_soup": True,
            "has_meat": True,
            "calories": 700,
            "protein": 28.0,
            "carbs": 90.0,
            "fat": 18.0,
            "prep_time": 35,
            "difficulty": "hard",
            "rating": 4.9,
            "image_url": None,
            "category_id": category_id,
        }
        await client.post("/api/v1/menus/", json=menu_payload)
        resp = await client.get("/api/v1/menus/time-slot/dinner")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert any(menu["name"] == "테스트 메뉴 F" for menu in data)

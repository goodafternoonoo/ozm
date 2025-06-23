import pytest
import pytest_asyncio
from httpx import AsyncClient
from unittest.mock import patch
from main import app
from app.db.database import async_engine, Base
from app.db.init_db import init_db
import uuid
import os


@pytest_asyncio.fixture(autouse=True, scope="function")
async def setup_db():
    # 테스트 환경 설정
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = (
        "postgresql://user:password@localhost:5432/menu_recommendation_test"
    )

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await init_db()


# ---------------- 카카오 로그인 ----------------
@pytest.mark.asyncio
@patch("app.services.auth_service.requests.get")
async def test_kakao_login_success(mock_kakao_get):
    """카카오 access_token 정상 → JWT 토큰 반환"""
    mock_kakao_get.return_value.status_code = 200
    mock_kakao_get.return_value.json.return_value = {
        "id": "123456789",
        "properties": {"nickname": "테스트유저"},
        "kakao_account": {"email": "test@kakao.com"},
    }
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/kakao-login", json={"access_token": "fake-access-token"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"


@pytest.mark.asyncio
@patch("app.services.auth_service.requests.get")
async def test_kakao_login_fail(mock_kakao_get):
    """카카오 access_token 잘못됨 → 401 에러"""
    mock_kakao_get.return_value.status_code = 401
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/kakao-login", json={"access_token": "invalid-token"}
        )
        assert resp.status_code == 401
        data = resp.json()
        assert data["detail"] == "카카오 인증 실패"


# ---------------- 카테고리 ----------------
@pytest.mark.asyncio
async def test_create_and_get_category():
    """카테고리 생성 및 조회"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "name": "테스트 카테고리",
            "description": "테스트용 카테고리입니다.",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#123456",
        }
        resp = await client.post("/api/v1/categories/", json=payload)
        assert resp.status_code == 201
        cat_id = resp.json()["id"]
        resp = await client.get(f"/api/v1/categories/{cat_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == payload["name"]


# ---------------- 메뉴 ----------------
@pytest.mark.asyncio
async def test_create_and_get_menu():
    """메뉴 생성 및 조회"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 카테고리 먼저 생성
        cat_payload = {
            "name": "테스트 메뉴 카테고리",
            "description": "테스트용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#654321",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "테스트 메뉴",
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
        menu_id = resp.json()["id"]
        resp = await client.get(f"/api/v1/menus/{menu_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == menu_payload["name"]


# ---------------- 질문 ----------------
@pytest.mark.asyncio
async def test_get_questions():
    """질문 목록 조회"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.get("/api/v1/questions/")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "text" in data[0]
        assert "options" in data[0]


# ---------------- 추천 ----------------
@pytest.mark.asyncio
async def test_simple_recommendation():
    """간단 추천 API 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        req = {"time_slot": "breakfast", "session_id": "test-session-123"}
        resp = await client.post("/api/v1/recommendations/simple", json=req)
        assert resp.status_code == 200
        data = resp.json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)


@pytest.mark.asyncio
async def test_quiz_recommendation():
    """질답 기반 추천 API 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        req = {
            "answers": {"question1": "매운맛", "question2": "건강식"},
            "session_id": "test-session-456",
        }
        resp = await client.post("/api/v1/recommendations/quiz", json=req)
        assert resp.status_code == 200
        data = resp.json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)


@pytest.mark.asyncio
async def test_quiz_recommendation_required_filters():
    """
    질답 기반 추천에서 필수 조건(시간대, 채식, 국물, 국가 등) AND 필터 동작 검증
    - 모든 조건을 만족하는 메뉴만 추천
    - 하나라도 불일치하면 추천 결과 없음
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. 카테고리/메뉴 생성 (채식+국물+한국+아침)
        cat_payload = {
            "name": "필수조건 카테고리",
            "description": "필수조건 테스트",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#111111",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "필수조건 메뉴",
            "description": "채식+국물+한국+아침",
            "time_slot": "breakfast",
            "is_spicy": False,
            "is_healthy": True,
            "is_vegetarian": True,
            "is_quick": False,
            "has_rice": True,
            "has_soup": True,
            "has_meat": False,
            "calories": 300,
            "protein": 10.0,
            "carbs": 40.0,
            "fat": 5.0,
            "prep_time": 10,
            "difficulty": "easy",
            "rating": 4.5,
            "image_url": None,
            "category_id": category_id,
        }
        await client.post("/api/v1/menus/", json=menu_payload)
        # 2. 모든 조건을 만족하는 답변 → 추천 결과 있음
        req = {
            "answers": {
                "time_slot": "breakfast",
                "country": "한국",
                "cuisine_type": "한식",
                "q1": "채식",
                "q2": "국물요리",
            },
            "session_id": "req-filter-1",
        }
        resp = await client.post("/api/v1/recommendations/quiz", json=req)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["recommendations"]) > 0
        # 3. 하나라도 불일치(예: 국물 → False) → 추천 결과 없음
        req2 = {
            "answers": {
                "time_slot": "breakfast",
                "country": "한국",
                "cuisine_type": "한식",
                "q1": "채식",
                # 국물요리 빠짐
            },
            "session_id": "req-filter-2",
        }
        resp2 = await client.post("/api/v1/recommendations/quiz", json=req2)
        assert resp2.status_code == 200
        data2 = resp2.json()
        print("[필수조건 미충족 추천 결과]", data2["recommendations"])
        # 국물요리 조건이 없으므로 추천 결과 없음
        assert len(data2["recommendations"]) == 0


# ---------------- 즐겨찾기(찜) ----------------
@pytest.mark.asyncio
async def test_favorite_add_and_get():
    """즐겨찾기(찜) 추가 및 조회 (user_id 기반)"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 테스트용 유저 생성
        user_payload = {
            "username": "testuser",
            "email": "test@example.com",
            "nickname": "테스트유저",
        }
        user_resp = await client.post("/api/v1/users/", json=user_payload)
        user_id = user_resp.json()["id"]

        # 카테고리/메뉴 생성
        cat_payload = {
            "name": "찜 카테고리",
            "description": "찜용 카테고리",
            "country": "한국",
            "cuisine_type": "한식",
            "is_active": True,
            "display_order": 1,
            "icon_url": None,
            "color_code": "#abcdef",
        }
        cat_resp = await client.post("/api/v1/categories/", json=cat_payload)
        category_id = cat_resp.json()["id"]
        menu_payload = {
            "name": "찜 메뉴",
            "description": "찜용 메뉴",
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
        menu_resp = await client.post("/api/v1/menus/", json=menu_payload)
        menu_id = menu_resp.json()["id"]

        # 즐겨찾기 추가
        fav_payload = {"user_id": user_id, "menu_id": menu_id}
        resp = await client.post("/api/v1/menus/favorites", json=fav_payload)
        assert resp.status_code == 201
        fav_id = resp.json()["id"]

        # 즐겨찾기 조회
        resp = await client.get(f"/api/v1/menus/favorites?user_id={user_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data[0]["menu_id"] == menu_id

        # 삭제
        resp = await client.delete(
            f"/api/v1/menus/favorites?user_id={user_id}&menu_id={menu_id}"
        )
        assert resp.status_code == 204


# ---------------- 사용자 프로필 ----------------
@pytest.mark.asyncio
@patch("app.services.auth_service.requests.get")
async def test_user_profile_operations(mock_kakao_get):
    """사용자 프로필 조회 및 업데이트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 먼저 로그인하여 토큰 획득
        mock_kakao_get.return_value.status_code = 200
        mock_kakao_get.return_value.json.return_value = {
            "id": "123456789",
            "properties": {"nickname": "테스트유저"},
            "kakao_account": {"email": "test@kakao.com"},
        }

        login_resp = await client.post(
            "/api/v1/auth/kakao-login", json={"access_token": "fake-token"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 프로필 조회
        resp = await client.get("/api/v1/users/profile", headers=headers)
        assert resp.status_code == 200
        profile = resp.json()
        assert profile["nickname"] == "테스트유저"

        # 프로필 업데이트
        update_data = {"nickname": "업데이트된유저"}
        resp = await client.put(
            "/api/v1/users/profile", json=update_data, headers=headers
        )
        assert resp.status_code == 200
        updated_profile = resp.json()
        assert updated_profile["nickname"] == "업데이트된유저"


# ---------------- 검색 API ----------------
@pytest.mark.asyncio
async def test_search_menus():
    """메뉴 검색 API 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 기본 검색
        resp = await client.get("/api/v1/search/menus")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

        # 필터링 검색
        resp = await client.get(
            "/api/v1/search/menus?time_slot=breakfast&is_spicy=true"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_search_categories():
    """카테고리 검색 API 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.get("/api/v1/search/categories")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0


@pytest.mark.asyncio
async def test_search_stats():
    """검색 통계 API 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.get("/api/v1/search/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_menus" in data
        assert "time_slot_distribution" in data
        assert "country_distribution" in data
        assert "average_rating" in data


# ---------------- 즐겨찾기 ----------------
@pytest.mark.asyncio
@patch("app.services.auth_service.requests.get")
async def test_user_favorites(mock_kakao_get):
    """사용자 즐겨찾기 API 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 먼저 로그인
        mock_kakao_get.return_value.status_code = 200
        mock_kakao_get.return_value.json.return_value = {
            "id": "123456789",
            "properties": {"nickname": "테스트유저"},
            "kakao_account": {"email": "test@kakao.com"},
        }

        login_resp = await client.post(
            "/api/v1/auth/kakao-login", json={"access_token": "fake-token"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 즐겨찾기 목록 조회
        resp = await client.get("/api/v1/users/favorites", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

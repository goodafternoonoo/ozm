import pytest
import asyncio
from httpx import AsyncClient
from main import app

@pytest.fixture
def event_loop():
    """새로운 이벤트 루프 생성"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def client():
    """테스트용 HTTP 클라이언트"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_check(client):
    """헬스 체크 테스트"""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "menu-recommendation-api"

@pytest.mark.asyncio
async def test_root_endpoint(client):
    """루트 엔드포인트 테스트"""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data

@pytest.mark.asyncio
async def test_get_questions(client):
    """질문 조회 테스트"""
    response = await client.get("/api/v1/questions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_get_menus_by_time_slot(client):
    """시간대별 메뉴 조회 테스트"""
    response = await client.get("/api/v1/menus/time-slot/breakfast")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_simple_recommendation(client):
    """간단 추천 테스트"""
    request_data = {
        "time_slot": "breakfast",
        "session_id": "test-session-123"
    }
    response = await client.post("/api/v1/recommendations/simple", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "session_id" in data
    assert "total_count" in data

@pytest.mark.asyncio
async def test_quiz_recommendation(client):
    """질답 기반 추천 테스트"""
    request_data = {
        "answers": {
            "question1": "매운맛",
            "question2": "건강식"
        },
        "session_id": "test-session-456"
    }
    response = await client.post("/api/v1/recommendations/quiz", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "session_id" in data
    assert "total_count" in data

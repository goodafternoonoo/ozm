import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient
from main import app
from app.db.database import async_engine, Base
from app.models.menu import Menu
from app.models.question import Question
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.models.menu import TimeSlot
import os


@pytest.fixture(scope="session")
def event_loop():
    """새로운 이벤트 루프 생성"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """테스트용 데이터베이스 설정 - 모든 테스트에서 자동 실행"""
    # 테이블 초기화 (drop 후 create)
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # 테스트 데이터 추가
    async with AsyncSessionLocal() as session:
        # 메뉴 데이터 추가
        test_menus = [
            Menu(
                name="테스트 아침 메뉴",
                description="테스트용 아침 메뉴입니다",
                time_slot="breakfast",
                is_spicy=False,
                is_healthy=True,
                is_vegetarian=False,
                is_quick=True,
                has_rice=True,
                has_soup=True,
                has_meat=False,
                calories=300,
                protein=10,
                carbs=50,
                fat=5,
                prep_time=15,
                difficulty="easy",
                rating=4.5,
                image_url="https://example.com/breakfast.jpg",
            ),
            Menu(
                name="테스트 점심 메뉴",
                description="테스트용 점심 메뉴입니다",
                time_slot="lunch",
                is_spicy=True,
                is_healthy=False,
                is_vegetarian=False,
                is_quick=False,
                has_rice=True,
                has_soup=False,
                has_meat=True,
                calories=600,
                protein=25,
                carbs=80,
                fat=20,
                prep_time=30,
                difficulty="medium",
                rating=4.0,
                image_url="https://example.com/lunch.jpg",
            ),
        ]

        # 질문 데이터 추가 (id 자동 생성)
        test_questions = [
            Question(
                text="어떤 맛을 선호하시나요?",
                order=1,
                options=["매운맛", "순한맛", "신맛", "단맛"],
                category="taste",
            ),
            Question(
                text="건강식을 원하시나요?",
                order=2,
                options=["네", "아니오"],
                category="health",
            ),
        ]

        session.add_all(test_menus)
        session.add_all(test_questions)
        await session.commit()


@pytest.mark.asyncio
async def test_health_check():
    """헬스 체크 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "menu-recommendation-api"


@pytest.mark.asyncio
async def test_root_endpoint():
    """루트 엔드포인트 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data


@pytest.mark.asyncio
async def test_get_questions():
    """질문 목록 조회 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/questions", follow_redirects=True)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        assert "id" in data[0]
        assert "text" in data[0]
        assert "options" in data[0]


@pytest.mark.asyncio
async def test_get_menus_by_time_slot():
    """시간대별 메뉴 조회 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/menus/time-slot/breakfast")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["time_slot"] == "breakfast"


@pytest.mark.asyncio
async def test_simple_recommendation():
    """간단 추천 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        request_data = {"time_slot": "breakfast", "session_id": "test-session-123"}
        response = await client.post(
            "/api/v1/recommendations/simple", json=request_data
        )
        assert response.status_code == 200
        data = response.json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)


@pytest.mark.asyncio
async def test_quiz_recommendation():
    """질답 기반 추천 테스트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        request_data = {
            "answers": {"question1": "매운맛", "question2": "건강식"},
            "session_id": "test-session-456",
        }
        response = await client.post("/api/v1/recommendations/quiz", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)

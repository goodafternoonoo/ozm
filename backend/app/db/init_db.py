from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import async_engine, Base
from app.models.menu import Menu
from app.models.question import Question
from app.models.user_answer import UserAnswer
from app.models.recommendation import RecommendationLog
from app.models.category import Category


async def init_db():
    """
    데이터베이스 전체 초기화 (테이블 삭제 후 재생성)
    - 운영 환경에서는 사용 금지 (개발/테스트용)
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await create_sample_data()


async def create_sample_data():
    """
    샘플 데이터(카테고리, 메뉴, 질문) 자동 생성
    - 카테고리 생성 후 id 매핑 → 메뉴에 category_id 할당
    - 실전 서비스 수준의 샘플 구조
    """
    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        # 기존 데이터 확인 (중복 방지)
        result = await db.execute(select(Menu))
        existing_menus = result.scalars().all()
        if existing_menus:
            print("샘플 데이터가 이미 존재합니다.")
            return
        # 샘플 카테고리 데이터
        sample_categories = [
            {
                "name": "한국 전통 요리",
                "description": "한국의 전통적인 요리들",
                "country": "한국",
                "cuisine_type": "한식",
                "display_order": 1,
                "color_code": "#FF6B6B",
            },
            {
                "name": "중국 요리",
                "description": "다양한 중국 요리들",
                "country": "중국",
                "cuisine_type": "중식",
                "display_order": 2,
                "color_code": "#4ECDC4",
            },
            {
                "name": "일본 요리",
                "description": "정교한 일본 요리들",
                "country": "일본",
                "cuisine_type": "일식",
                "display_order": 3,
                "color_code": "#45B7D1",
            },
            {
                "name": "이탈리아 요리",
                "description": "풍부한 맛의 이탈리아 요리들",
                "country": "이탈리아",
                "cuisine_type": "양식",
                "display_order": 4,
                "color_code": "#96CEB4",
            },
            {
                "name": "태국 요리",
                "description": "매콤달콤한 태국 요리들",
                "country": "태국",
                "cuisine_type": "동남아식",
                "display_order": 5,
                "color_code": "#FFEAA7",
            },
            {
                "name": "인도 요리",
                "description": "향신료가 풍부한 인도 요리들",
                "country": "인도",
                "cuisine_type": "인도식",
                "display_order": 6,
                "color_code": "#DDA0DD",
            },
        ]
        # 카테고리 데이터 저장 및 이름→id 매핑
        category_name_to_id = {}
        for category_data in sample_categories:
            category = Category(**category_data)
            db.add(category)
            await db.flush()  # id 확보
            category_name_to_id[category_data["name"]] = category.id
        await db.commit()
        # 샘플 메뉴 데이터 (카테고리 연관관계 반영)
        sample_menus = [
            {
                "name": "김치볶음밥",
                "description": "매콤한 김치와 함께 볶은 맛있는 볶음밥",
                "time_slot": "breakfast",
                "is_spicy": True,
                "is_quick": True,
                "has_rice": True,
                "calories": 450,
                "prep_time": 15,
                "difficulty": "easy",
                "rating": 4.5,
                "category_id": category_name_to_id["한국 전통 요리"],
            },
            {
                "name": "토스트",
                "description": "바삭한 토스트에 잼이나 버터를 발라 드세요",
                "time_slot": "breakfast",
                "is_quick": True,
                "is_vegetarian": True,
                "calories": 200,
                "prep_time": 5,
                "difficulty": "easy",
                "rating": 4.0,
                "category_id": category_name_to_id["이탈리아 요리"],
            },
            {
                "name": "오트밀",
                "description": "건강한 귀리를 우유와 함께 끓인 영양식",
                "time_slot": "breakfast",
                "is_healthy": True,
                "is_vegetarian": True,
                "calories": 150,
                "prep_time": 10,
                "difficulty": "easy",
                "rating": 3.8,
                "category_id": category_name_to_id["이탈리아 요리"],
            },
            {
                "name": "비빔밥",
                "description": "다양한 나물과 고추장을 비빈 한국 전통 요리",
                "time_slot": "lunch",
                "is_healthy": True,
                "has_rice": True,
                "is_vegetarian": True,
                "calories": 500,
                "prep_time": 20,
                "difficulty": "medium",
                "rating": 4.7,
                "category_id": category_name_to_id["한국 전통 요리"],
            },
            {
                "name": "불고기",
                "description": "달콤하게 양념한 소고기 구이",
                "time_slot": "lunch",
                "has_meat": True,
                "calories": 600,
                "prep_time": 30,
                "difficulty": "medium",
                "rating": 4.8,
                "category_id": category_name_to_id["한국 전통 요리"],
            },
            {
                "name": "된장찌개",
                "description": "구수한 된장의 맛이 일품인 국물 요리",
                "time_slot": "lunch",
                "has_soup": True,
                "is_healthy": True,
                "calories": 200,
                "prep_time": 25,
                "difficulty": "easy",
                "rating": 4.3,
                "category_id": category_name_to_id["한국 전통 요리"],
            },
            {
                "name": "삼겹살",
                "description": "구워서 먹는 대표적인 한국 고기 요리",
                "time_slot": "dinner",
                "has_meat": True,
                "calories": 700,
                "prep_time": 20,
                "difficulty": "easy",
                "rating": 4.9,
                "category_id": category_name_to_id["한국 전통 요리"],
            },
            {
                "name": "김치찌개",
                "description": "매콤한 김치로 끓인 뜨끈한 찌개",
                "time_slot": "dinner",
                "is_spicy": True,
                "has_soup": True,
                "calories": 350,
                "prep_time": 30,
                "difficulty": "easy",
                "rating": 4.6,
                "category_id": category_name_to_id["한국 전통 요리"],
            },
            {
                "name": "샐러드",
                "description": "신선한 야채로 만든 건강한 샐러드",
                "time_slot": "dinner",
                "is_healthy": True,
                "is_vegetarian": True,
                "calories": 100,
                "prep_time": 10,
                "difficulty": "easy",
                "rating": 4.2,
                "category_id": category_name_to_id["이탈리아 요리"],
            },
        ]
        for menu_data in sample_menus:
            menu = Menu(**menu_data)
            db.add(menu)
        # 샘플 질문 데이터
        sample_questions = [
            {
                "text": "매운 음식을 좋아하시나요?",
                "order": 1,
                "options": ["매운맛", "순한맛"],
                "weight_map": {
                    "매운맛": {"is_spicy": 1.0},
                    "순한맛": {"is_spicy": -1.0},
                },
            },
            {
                "text": "어떤 식단을 선호하시나요?",
                "order": 2,
                "options": ["건강식", "일반식", "채식"],
                "weight_map": {
                    "건강식": {"is_healthy": 1.0},
                    "채식": {"is_vegetarian": 1.0},
                    "일반식": {},
                },
            },
            {
                "text": "조리 시간은 어느 정도를 원하시나요?",
                "order": 3,
                "options": ["빠른조리", "일반조리"],
                "weight_map": {"빠른조리": {"is_quick": 1.0}, "일반조리": {}},
            },
            {
                "text": "어떤 종류의 음식을 좋아하시나요?",
                "order": 4,
                "options": ["밥류", "국물요리", "고기요리"],
                "weight_map": {
                    "밥류": {"has_rice": 1.0},
                    "국물요리": {"has_soup": 1.0},
                    "고기요리": {"has_meat": 1.0},
                },
            },
        ]
        for question_data in sample_questions:
            question = Question(**question_data)
            db.add(question)
        await db.commit()
        print("샘플 데이터가 성공적으로 생성되었습니다.")

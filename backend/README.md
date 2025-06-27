# OZM 음식 추천 시스템 - Backend

## 개요

OZM 음식 추천 시스템의 백엔드는 FastAPI 기반의 비동기 RESTful API 서버로, 사용자 맞춤형 음식 추천, 메뉴/카테고리 관리, 즐겨찾기, 실시간 추천, AI 연동 등 다양한 기능을 제공합니다.

---

## 기술 스택

-   **Framework**: FastAPI (Python 3.11+)
-   **Database**: PostgreSQL
-   **ORM**: SQLAlchemy 2.0 (Async)
-   **Migration**: Alembic
-   **Authentication**: JWT, OAuth (Kakao)
-   **AI Integration**: Perplexity AI
-   **Testing**: pytest, pytest-asyncio
-   **Documentation**: FastAPI Auto-docs (Swagger, ReDoc)
-   **기타**: Pydantic, Uvicorn, python-dotenv 등

---

## 주요 기능

-   카카오 OAuth 기반 사용자 인증 및 JWT 발급
-   메뉴/카테고리 CRUD 및 검색/필터링
-   개인화/협업/질문 기반 음식 추천
-   사용자 선호도 및 상호작용 추적
-   즐겨찾기(찜) 기능
-   실시간 추천 캐시 및 통계
-   A/B 테스트, AI 답변(Perplexity)
-   API 문서 자동화 및 헬스체크

---

## 프로젝트 구조

```
backend/
├── alembic/                # DB 마이그레이션
├── app/
│   ├── api/                # API 엔드포인트 (v1)
│   ├── core/               # 설정, 미들웨어, 유틸리티, 로깅
│   ├── db/                 # DB 연결/초기화
│   ├── models/             # SQLAlchemy 데이터 모델
│   ├── repositories/       # DB 접근 레포지토리 계층
│   ├── schemas/            # Pydantic 스키마
│   └── services/           # 비즈니스 로직 (추천, 인증 등)
├── tests/                  # 테스트 코드
├── main.py                 # FastAPI 진입점
├── requirements.txt        # 의존성 목록
└── README.md               # 프로젝트 문서
```

---

## 설치 및 실행

1. **가상환경 및 의존성 설치**

    ```bash
    python -m venv venv
    source venv/bin/activate  # (Windows: venv\Scripts\activate)
    pip install -r requirements.txt
    ```

2. **환경 변수 설정**

    - `backend/.env` 파일 생성 후, DB/JWT/Kakao 등 환경 변수 입력

3. **DB 마이그레이션**

    ```bash
    alembic upgrade head
    ```

4. **서버 실행**
    ```bash
    python main.py
    # 또는
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

---

## 주요 API 엔드포인트

-   **인증**
    -   `POST /api/v1/auth/kakao-login` : 카카오 로그인 및 JWT 발급
    -   `GET /api/v1/auth/me` : 내 정보 조회
-   **메뉴**
    -   `POST /api/v1/menus/` : 메뉴 생성
    -   `GET /api/v1/menus/` : 메뉴 목록 조회
    -   `GET /api/v1/menus/{menu_id}` : 메뉴 상세 조회
    -   `PUT /api/v1/menus/{menu_id}` : 메뉴 수정
    -   `DELETE /api/v1/menus/{menu_id}` : 메뉴 삭제
    -   `GET /api/v1/menus/search/` : 메뉴 검색
    -   `GET /api/v1/menus/popular/` : 인기 메뉴
    -   `POST /api/v1/menus/favorites` : 즐겨찾기 추가/삭제/조회
-   **카테고리**
    -   `POST /api/v1/categories/` : 카테고리 생성
    -   `GET /api/v1/categories/` : 카테고리 목록
    -   `GET /api/v1/categories/{category_id}` : 카테고리 상세
    -   `PUT /api/v1/categories/{category_id}` : 카테고리 수정
    -   `DELETE /api/v1/categories/{category_id}` : 카테고리 삭제
-   **추천**
    -   `POST /api/v1/recommendations/simple` : 시간대별 개인화 추천
    -   `POST /api/v1/recommendations/quiz` : 질답 기반 추천
    -   `POST /api/v1/recommendations/collaborative` : 협업 필터링 추천
    -   `GET /api/v1/recommendations/preference-analysis` : 선호도 분석
-   **질문/AI**
    -   `GET /api/v1/questions/` : 질문 목록
    -   `POST /api/v1/questions/` : 질문 생성
    -   `POST /api/v1/questions/ai-answer` : AI 답변(Perplexity)
-   **검색**
    -   `GET /api/v1/search/menus` : 메뉴 고급 검색/필터링
    -   `GET /api/v1/search/categories` : 카테고리 검색
    -   `GET /api/v1/search/stats` : 검색 통계

---

## 테스트

```bash
pytest
pytest --cov=app --cov-report=html
```

---

## 기타

-   **API 문서**:
    -   Swagger: http://localhost:8000/docs
    -   ReDoc: http://localhost:8000/redoc
-   **헬스체크**:
    -   `/health`, `/health/detailed`

---

### 문의/기여

-   이슈/기여는 GitHub PR 또는 Issue로 남겨주세요.

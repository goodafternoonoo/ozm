# OZM Backend - 음식 추천 시스템 API

FastAPI 기반의 음식 추천 시스템 백엔드 API입니다.

## 🚀 주요 기능

### 인증 시스템

-   카카오 로그인 연동
-   JWT 토큰 기반 인증
-   사용자 프로필 관리

### 추천 시스템

-   시간대별 간단 추천
-   질답 기반 맞춤 추천
-   사용자 선호도 학습

### 메뉴 관리

-   다국가 음식 카테고리
-   상세한 메뉴 정보 (영양, 조리시간, 난이도)
-   이미지 URL 관리

### 검색 및 필터링

-   메뉴명/설명 검색
-   다중 조건 필터링 (시간대, 매운맛, 건강식 등)
-   칼로리/평점 범위 검색
-   국가/요리 타입별 필터링

### 즐겨찾기

-   사용자별 즐겨찾기 메뉴 관리
-   세션 기반 임시 즐겨찾기

## 🛠 기술 스택

-   **Framework**: FastAPI 0.104.1
-   **Database**: PostgreSQL (개발/운영), SQLite (테스트)
-   **ORM**: SQLAlchemy 2.0.23
-   **Authentication**: JWT (python-jose)
-   **Testing**: pytest + pytest-asyncio
-   **Cache**: Redis (선택사항)

## 📁 프로젝트 구조

```
backend/
├── app/
│   ├── api/v1/           # API 엔드포인트
│   │   ├── auth.py       # 인증 API
│   │   ├── menus.py      # 메뉴 관리 API
│   │   ├── categories.py # 카테고리 API
│   │   ├── questions.py  # 질문 API
│   │   ├── recommendations.py # 추천 API
│   │   ├── users.py      # 사용자 API
│   │   ├── search.py     # 검색 API
│   │   └── router.py     # 라우터 설정
│   ├── core/             # 핵심 설정
│   │   └── config.py     # 환경 설정
│   ├── db/               # 데이터베이스
│   │   ├── database.py   # DB 연결 설정
│   │   └── init_db.py    # 초기 데이터 생성
│   ├── models/           # 데이터 모델
│   ├── schemas/          # Pydantic 스키마
│   └── services/         # 비즈니스 로직
├── tests/                # 테스트 코드
├── main.py              # 애플리케이션 진입점
└── requirements.txt     # 의존성 목록
```

## 🚀 설치 및 실행

### 1. 환경 설정

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가:

```env
# 환경 설정
ENV=development

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/menu_recommendation
TEST_DATABASE_URL=sqlite:///./test.db

# 보안
SECRET_KEY=your-secret-key-here

# API 설정
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 설치 및 데이터베이스 생성
createdb menu_recommendation

# 또는 SQLite 사용 (개발용)
# 별도 설정 불필요
```

### 4. 애플리케이션 실행

```bash
# 개발 서버 실행
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🧪 테스트

```bash
# 전체 테스트 실행
pytest tests/ -v

# 특정 테스트 실행
pytest tests/test_api.py::test_kakao_login_success -v

# 커버리지 포함 테스트
pytest tests/ --cov=app --cov-report=html
```

## 📚 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

-   **Swagger UI**: http://localhost:8000/docs
-   **ReDoc**: http://localhost:8000/redoc

## 🔧 주요 API 엔드포인트

### 인증

-   `POST /api/v1/auth/kakao-login` - 카카오 로그인

### 사용자

-   `GET /api/v1/users/profile` - 프로필 조회
-   `PUT /api/v1/users/profile` - 프로필 업데이트
-   `GET /api/v1/users/favorites` - 즐겨찾기 목록

### 메뉴

-   `GET /api/v1/menus/` - 메뉴 목록
-   `GET /api/v1/menus/{id}` - 메뉴 상세
-   `POST /api/v1/menus/` - 메뉴 생성

### 추천

-   `POST /api/v1/recommendations/simple` - 간단 추천
-   `POST /api/v1/recommendations/quiz` - 질답 기반 추천

### 검색

-   `GET /api/v1/search/menus` - 메뉴 검색/필터링
-   `GET /api/v1/search/categories` - 카테고리 검색
-   `GET /api/v1/search/stats` - 검색 통계

### 카테고리

-   `GET /api/v1/categories/` - 카테고리 목록
-   `GET /api/v1/categories/{id}` - 카테고리 상세

### 질문

-   `GET /api/v1/questions/` - 추천 질문 목록

## 🔒 보안

-   JWT 토큰 기반 인증
-   CORS 설정 (개발환경에서는 모든 도메인 허용)
-   입력 데이터 검증 (Pydantic 스키마)
-   SQL 인젝션 방지 (SQLAlchemy ORM)

## 📊 성능 최적화

-   비동기 데이터베이스 연결
-   연결 풀링 설정
-   적절한 인덱스 설정
-   Redis 캐싱 지원 (선택사항)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

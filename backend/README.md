# OZM 음식 추천 시스템 - Backend

## 기술 스택

-   **Framework**: FastAPI
-   **Database**: PostgreSQL
-   **ORM**: SQLAlchemy 2.0
-   **Authentication**: JWT + OAuth (Kakao)
-   **AI Integration**: Perplexity AI
-   **Testing**: pytest + pytest-asyncio
-   **Documentation**: FastAPI Auto-docs
-   **Migration**: Alembic

## 주요 기능

-   사용자 인증 (카카오 OAuth)
-   메뉴 관리 및 검색
-   개인화된 음식 추천
-   사용자 선호도 학습
-   협업 필터링
-   실시간 추천 시스템
-   카테고리별 메뉴 분류
-   즐겨찾기 기능
-   사용자 상호작용 추적
-   A/B 테스트 지원

## 설치 및 실행

### 1. 환경 설정

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (Linux/Mac)
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 설정을 추가하세요:

```env
# 기본 설정
APP_NAME=OZM Menu Recommendation
VERSION=1.0.0
DEBUG=true
ENV=dev

# 데이터베이스 설정
DATABASE_URL=postgresql://user:password@localhost:5432/menu_recommendation
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/menu_recommendation_test

# JWT 설정
JWT_SECRET_KEY=your-super-secret-jwt-key-that-is-at-least-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
JWT_REFRESH_EXPIRE_MINUTES=43200

# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_REDIRECT_URI=http://localhost:3000/oauth/callback

# Perplexity AI 설정
PERPLEXITY_API_KEY=your-perplexity-api-key
PERPLEXITY_ENABLED=true

# CORS 설정
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# 로깅 설정
LOG_LEVEL=INFO

# 파일 업로드 설정
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# 보안 설정
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
PASSWORD_MIN_LENGTH=8
SESSION_TIMEOUT_MINUTES=30
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
createdb menu_recommendation
createdb menu_recommendation_test

# 마이그레이션 실행
alembic upgrade head
```

### 4. 애플리케이션 실행

```bash
# 개발 모드 실행
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 문서

-   **Swagger UI**: http://localhost:8000/docs
-   **ReDoc**: http://localhost:8000/redoc
-   **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## 테스트

```bash
# 전체 테스트 실행
pytest

# 커버리지와 함께 테스트 실행
pytest --cov=app --cov-report=html

# 특정 테스트 파일 실행
pytest tests/test_api.py

# 비동기 테스트 실행
pytest --asyncio-mode=auto
```

## 프로젝트 구조

```
backend/
├── alembic/                 # 데이터베이스 마이그레이션
├── app/
│   ├── api/                # API 엔드포인트
│   │   └── v1/
│   │       ├── auth.py     # 인증 관련 API
│   │       ├── menus.py    # 메뉴 관련 API
│   │       ├── recommendations.py  # 추천 관련 API
│   │       ├── questions.py # 질문 관련 API
│   │       ├── categories.py # 카테고리 관련 API
│   │       ├── users.py    # 사용자 관련 API
│   │       ├── search.py   # 검색 관련 API
│   │       └── router.py   # 라우터 설정
│   ├── core/               # 핵심 설정 및 유틸리티
│   │   ├── config.py       # 설정 관리
│   │   ├── exceptions.py   # 예외 처리
│   │   ├── logging.py      # 로깅 설정
│   │   ├── middleware.py   # 미들웨어
│   │   └── utils.py        # 유틸리티 함수
│   ├── db/                 # 데이터베이스 설정
│   │   ├── database.py     # 데이터베이스 연결
│   │   └── init_db.py      # 초기 데이터 설정
│   ├── models/             # 데이터 모델
│   │   ├── user.py         # 사용자 모델
│   │   ├── menu.py         # 메뉴 모델
│   │   ├── category.py     # 카테고리 모델
│   │   ├── question.py     # 질문 모델
│   │   ├── recommendation.py # 추천 모델
│   │   ├── user_preference.py # 사용자 선호도 모델
│   │   ├── user_answer.py  # 사용자 답변 모델
│   │   └── favorite.py     # 즐겨찾기 모델
│   ├── schemas/            # Pydantic 스키마
│   │   ├── user.py         # 사용자 스키마
│   │   ├── menu.py         # 메뉴 스키마
│   │   ├── category.py     # 카테고리 스키마
│   │   ├── question.py     # 질문 스키마
│   │   ├── recommendation.py # 추천 스키마
│   │   ├── common.py       # 공통 스키마
│   │   └── error_codes.py  # 에러 코드
│   └── services/           # 비즈니스 로직
│       ├── auth_service.py # 인증 서비스
│       ├── menu_service.py # 메뉴 서비스
│       ├── recommendation_service.py # 추천 서비스
│       ├── preference_service.py # 선호도 서비스
│       ├── question_service.py # 질문 서비스
│       ├── category_service.py # 카테고리 서비스
│       ├── perplexity_service.py # AI 서비스
│       └── base_service.py # 기본 서비스
├── tests/                  # 테스트 코드
├── logs/                   # 로그 파일
├── main.py                 # 애플리케이션 진입점
├── requirements.txt        # 의존성 목록
└── README.md              # 프로젝트 문서
```

## 주요 API 엔드포인트

### 인증

-   `POST /api/v1/auth/kakao-login` - 카카오 로그인
-   `POST /api/v1/auth/refresh` - 토큰 갱신
-   `POST /api/v1/auth/logout` - 로그아웃

### 메뉴

-   `GET /api/v1/menus/` - 메뉴 목록 조회
-   `GET /api/v1/menus/{id}` - 메뉴 상세 조회
-   `POST /api/v1/menus/` - 메뉴 생성
-   `PUT /api/v1/menus/{id}` - 메뉴 수정
-   `DELETE /api/v1/menus/{id}` - 메뉴 삭제

### 추천

-   `POST /api/v1/recommendations/simple` - 간단 추천
-   `POST /api/v1/recommendations/quiz` - 질문 기반 추천
-   `POST /api/v1/recommendations/collaborative` - 협업 필터링 추천
-   `POST /api/v1/recommendations/interaction` - 상호작용 기록

### 카테고리

-   `GET /api/v1/categories/` - 카테고리 목록
-   `GET /api/v1/categories/{id}` - 카테고리 상세
-   `POST /api/v1/categories/` - 카테고리 생성

### 질문

-   `GET /api/v1/questions/` - 질문 목록 조회

### 사용자

-   `GET /api/v1/users/profile` - 사용자 프로필
-   `PUT /api/v1/users/profile` - 프로필 수정
-   `GET /api/v1/users/favorites` - 즐겨찾기 목록
-   `POST /api/v1/users/favorites/{menu_id}` - 즐겨찾기 추가
-   `DELETE /api/v1/users/favorites/{menu_id}` - 즐겨찾기 제거

### 검색

-   `GET /api/v1/search/menus` - 메뉴 검색
-   `GET /api/v1/search/categories` - 카테고리 검색
-   `GET /api/v1/search/stats` - 검색 통계

## 추천 시스템

### 1. 개인화 추천

-   사용자 선호도 기반 가중치 시스템
-   시간대별 선호도 학습
-   상호작용 히스토리 분석

### 2. 협업 필터링

-   유사 사용자 기반 추천
-   메뉴 간 유사도 계산
-   실시간 선호도 업데이트

### 3. 하이브리드 추천

-   콘텐츠 기반 + 협업 필터링 조합
-   가중치 조정 가능한 알고리즘
-   다양성 보장 메커니즘

### 4. AI 기반 추천

-   Perplexity AI 통합
-   자연어 기반 추천
-   맥락 인식 추천

## 성능 최적화

-   **비동기 처리**: FastAPI + SQLAlchemy 비동기
-   **데이터베이스 최적화**: 인덱스 및 쿼리 최적화
-   **연결 풀**: 데이터베이스 연결 풀 관리
-   **페이징**: 대용량 데이터 페이징 처리
-   **검증**: Pydantic을 통한 데이터 검증

## 보안

-   **JWT 인증**: 안전한 토큰 기반 인증
-   **OAuth 2.0**: 카카오 소셜 로그인
-   **CORS**: 안전한 크로스 오리진 요청
-   **입력 검증**: 모든 사용자 입력 검증
-   **SQL 인젝션 방지**: ORM 사용
-   **환경 변수**: 민감 정보 보호

## 모니터링

-   **로깅**: 구조화된 로깅 시스템
-   **헬스체크**: 애플리케이션 상태 모니터링
-   **에러 추적**: 상세한 에러 로깅
-   **성능 메트릭**: API 응답 시간 추적

## 배포

### Docker 배포

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 환경별 설정

-   **개발 환경**: 디버그 모드, 상세 로깅
-   **테스트 환경**: 테스트 데이터베이스, 격리된 환경
-   **운영 환경**: 프로덕션 최적화, 보안 강화

## 기여 가이드

1.  Fork the repository
2.  Create a feature branch
3.  Make your changes
4.  Add tests for new functionality
5.  Ensure all tests pass
6.  Submit a pull request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

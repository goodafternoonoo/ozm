# 메뉴 추천 시스템 (Menu Recommendation API)

아침/점심/저녁 메뉴 추천 및 질답 기반 맞춤 추천 시스템입니다. FastAPI 기반의 RESTful API 서버로, 시간대별 간단 추천과 사용자의 취향을 반영한 퀴즈형 추천을 제공합니다.

---

## 주요 기능

-   **메뉴 관리**: 메뉴 등록, 조회, 수정, 삭제
-   **질문 관리**: 추천을 위한 질문 등록, 조회
-   **간단 추천**: 시간대(아침/점심/저녁)별 간단 추천
-   **퀴즈 추천**: 사용자의 답변을 바탕으로 맞춤형 메뉴 추천
-   **추천 로그/사용자 응답 기록**: 추천 이력 및 사용자의 답변 저장

---

## 기술 스택

-   Python 3.10+
-   FastAPI
-   SQLAlchemy (Async)
-   PostgreSQL
-   Alembic (DB 마이그레이션)
-   Pydantic
-   Uvicorn
-   Pytest (테스트)

---

## 디렉토리 구조

```
backend/
  ├── app/
  │   ├── api/           # API 라우터 및 엔드포인트
  │   │   └── v1/
  │   │       ├── menus.py            # 메뉴 관련 API
  │   │       ├── questions.py        # 질문 관련 API
  │   │       ├── recommendations.py  # 추천 관련 API
  │   │       └── router.py           # v1 라우터 통합
  │   ├── core/         # 환경설정 등 핵심 설정
  │   ├── db/           # DB 초기화, 세션, 베이스
  │   ├── models/       # SQLAlchemy 모델 정의
  │   ├── schemas/      # Pydantic 스키마
  │   └── services/     # 비즈니스 로직 서비스
  ├── main.py           # FastAPI 앱 진입점
  ├── run.py            # 실행 스크립트
  └── requirements.txt  # 의존성 목록
```

---

## 데이터베이스 모델

-   **Menu**: 메뉴 정보(이름, 설명, 시간대, 속성, 영양정보 등)
-   **Question**: 추천을 위한 질문(질문 텍스트, 선택지, 가중치 맵)
-   **UserAnswer**: 사용자의 답변 기록(세션별)
-   **RecommendationLog**: 추천 이력(추천 결과, 답변, 세션 등)

---

## API 주요 엔드포인트

-   `GET /api/v1/menus/` : 전체 메뉴 조회
-   `GET /api/v1/menus/time-slot/{time_slot}` : 시간대별 메뉴 조회
-   `POST /api/v1/menus/` : 메뉴 등록
-   `PUT /api/v1/menus/{menu_id}` : 메뉴 수정
-   `DELETE /api/v1/menus/{menu_id}` : 메뉴 삭제

-   `GET /api/v1/questions/` : 전체 질문 조회
-   `POST /api/v1/questions/` : 질문 등록

-   `POST /api/v1/recommendations/simple` : 시간대별 간단 추천
-   `POST /api/v1/recommendations/quiz` : 질답 기반 맞춤 추천

---

## 실행 방법

1. **의존성 설치**

    ```bash
    pip install -r requirements.txt
    ```

2. **환경 변수 설정**

    - `.env` 파일에 데이터베이스 접속 정보 등 환경 변수 설정

3. **DB 초기화 및 샘플 데이터 생성**

    - 서버 실행 시 자동으로 테이블 생성 및 샘플 데이터 삽입

4. **서버 실행**

    ```bash
    uvicorn main:app --reload
    ```

5. **API 문서**
    - Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
    - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 테스트

```bash
pytest
```

---

## 샘플 데이터

-   김치볶음밥, 토스트, 오트밀, 비빔밥, 불고기, 된장찌개, 삼겹살, 김치찌개, 샐러드 등
-   "매운 음식을 좋아하시나요?", "어떤 식단을 선호하시나요?" 등 다양한 질문

---

## 기여 및 문의

-   Pull Request 및 Issue 환영
-   문의: 프로젝트 관리자에게 연락

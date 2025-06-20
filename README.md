# 메뉴 추천 시스템 (Menu Recommendation System)

ReactNative + FastAPI + PostgreSQL 기반의 완전한 메뉴 추천 애플리케이션입니다.

## 📱 주요 기능

### 1. 시간대별 메뉴 추천
- 아침, 점심, 저녁 시간대에 맞는 메뉴 추천
- 각 시간대별 인기 메뉴 미리보기

### 2. 질답 기반 맞춤 추천
- 사용자 취향 조사를 통한 개인화된 메뉴 추천
- 매운맛 선호도, 식단 유형, 조리시간, 음식 종류 등을 고려한 알고리즘

### 3. 메뉴 상세 정보
- 영양 정보, 조리 시간, 난이도 등 상세 정보 제공
- 메뉴 태그 및 평점 시스템

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │────│     FastAPI     │────│   PostgreSQL    │
│   (Mobile App)  │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 기술 스택
- **Frontend**: React Native + TypeScript
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL
- **Infrastructure**: Docker + Docker Compose

## 🚀 빠른 시작

### 필수 요구사항
- Docker & Docker Compose
- Node.js (v16 이상)
- npm 또는 yarn
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

### 1. 프로젝트 클론 및 설정
```bash
# 압축 파일 해제 후
cd menu-recommendation-app

# 실행 권한 설정
chmod +x scripts/run-all.sh
chmod +x mobile/run.sh
```

### 2. 전체 시스템 실행 (추천)
```bash
# Docker로 백엔드 + 데이터베이스 시작
./scripts/run-all.sh start

# API 서버 확인
curl http://localhost:8000/health
```

### 3. 모바일 앱 실행
```bash
# Android 앱 실행
cd mobile
./run.sh android

# 또는 iOS 앱 실행 (macOS만)
./run.sh ios
```

## 📖 상세 설치 가이드

### 백엔드 개별 실행
```bash
# Python 가상환경 생성
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 설정 (PostgreSQL 실행 필요)
# .env 파일 수정
cp .env.example .env

# 서버 실행
python run.py
```

### 모바일 앱 개별 실행
```bash
cd mobile

# 의존성 설치
npm install

# Android 실행
npx react-native run-android

# iOS 실행 (macOS만)
cd ios && pod install && cd ..
npx react-native run-ios
```

## 🔗 API 문서

### 서버 실행 후 접속 가능한 URL들
- **API 문서 (Swagger)**: http://localhost:8000/docs
- **헬스 체크**: http://localhost:8000/health
- **메뉴 조회**: http://localhost:8000/api/v1/menus/
- **질문 조회**: http://localhost:8000/api/v1/questions/

### 주요 API 엔드포인트

#### 메뉴 관련
```http
GET /api/v1/menus/                     # 전체 메뉴 조회
GET /api/v1/menus/time-slot/{time}     # 시간대별 메뉴 조회
GET /api/v1/menus/{id}                 # 특정 메뉴 조회
POST /api/v1/menus/                    # 새 메뉴 생성
```

#### 추천 관련
```http
POST /api/v1/recommendations/simple    # 간단 추천
POST /api/v1/recommendations/quiz      # 질답 기반 추천
```

#### 질문 관련
```http
GET /api/v1/questions/                 # 질문 목록 조회
POST /api/v1/questions/                # 새 질문 생성
```

## 📁 프로젝트 구조

```
menu-recommendation-app/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── api/v1/            # API 엔드포인트
│   │   ├── core/              # 설정 및 보안
│   │   ├── db/                # 데이터베이스 연결
│   │   ├── models/            # SQLAlchemy 모델
│   │   ├── schemas/           # Pydantic 스키마
│   │   └── services/          # 비즈니스 로직
│   ├── tests/                 # 테스트 파일
│   ├── requirements.txt       # Python 의존성
│   └── run.py                 # 서버 실행 스크립트
├── mobile/                    # React Native 앱
│   ├── src/
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── screens/           # 화면 컴포넌트
│   │   ├── services/          # API 서비스
│   │   ├── types/             # TypeScript 타입
│   │   ├── utils/             # 유틸리티 함수
│   │   └── navigation/        # 네비게이션 설정
│   ├── package.json           # Node.js 의존성
│   └── run.sh                 # 모바일 앱 실행 스크립트
├── docker/                    # Docker 설정 파일
├── scripts/                   # 실행 스크립트들
├── docker-compose.yml         # Docker Compose 설정
└── README.md                  # 이 파일
```

## 🧪 테스트 실행

### 백엔드 테스트
```bash
cd backend
pytest
```

### 모바일 앱 테스트
```bash
cd mobile
npm test
```

## 📋 사용 가능한 명령어

### 전체 시스템 관리
```bash
./scripts/run-all.sh start     # 시스템 시작
./scripts/run-all.sh stop      # 시스템 정지
./scripts/run-all.sh restart   # 시스템 재시작
./scripts/run-all.sh logs      # 로그 보기
./scripts/run-all.sh clean     # 정리
./scripts/run-all.sh mobile    # 모바일 앱 실행
./scripts/run-all.sh backend   # 백엔드 개발 모드
```

### 모바일 앱 관리
```bash
cd mobile
./run.sh android     # Android 앱 실행
./run.sh ios         # iOS 앱 실행
./run.sh start       # Metro 서버만 시작
./run.sh install     # 의존성 설치
./run.sh clean       # 캐시 정리
```

## 🔧 개발 가이드

### 새로운 API 엔드포인트 추가
1. `backend/app/schemas/`에 Pydantic 스키마 정의
2. `backend/app/services/`에 비즈니스 로직 구현
3. `backend/app/api/v1/`에 FastAPI 라우터 추가
4. 테스트 작성

### 새로운 화면 추가
1. `mobile/src/screens/`에 화면 컴포넌트 생성
2. `mobile/src/types/index.ts`에 네비게이션 타입 추가
3. `mobile/src/navigation/AppNavigator.tsx`에 라우트 등록

### 환경 설정
#### 백엔드 환경변수 (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/menu_recommendation
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
SECRET_KEY=your-secret-key-here
```

#### 모바일 앱 API 설정
`mobile/src/services/api.ts`에서 API_BASE_URL 수정

## 🐛 트러블슈팅

### 자주 발생하는 문제들

#### 1. Docker 컨테이너가 시작되지 않는 경우
```bash
# Docker 로그 확인
docker-compose logs

# 컨테이너 상태 확인
docker-compose ps

# 포트 충돌 확인
lsof -i :8000
lsof -i :5432
```

#### 2. React Native 앱이 실행되지 않는 경우
```bash
# Metro 캐시 정리
cd mobile
npx react-native start --reset-cache

# Android의 경우 adb 재시작
adb kill-server
adb start-server

# iOS의 경우 시뮬레이터 재설정
xcrun simctl erase all
```

#### 3. API 연결 오류
- Android 에뮬레이터에서는 `10.0.2.2`를 사용
- iOS 시뮬레이터에서는 `localhost` 사용
- 실제 기기에서는 컴퓨터의 IP 주소 사용

#### 4. 데이터베이스 연결 오류
```bash
# PostgreSQL 컨테이너 로그 확인
docker-compose logs db

# 데이터베이스 직접 접속 테스트
docker-compose exec db psql -U user -d menu_recommendation
```

## 📄 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여하기
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처
프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**즐거운 개발 되세요! 🚀**

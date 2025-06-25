# OZM Frontend

음식 추천 시스템의 React Native 프론트엔드입니다.

## 🏗️ 아키텍처

### Context API 기반 상태 관리

프로젝트는 React Context API를 사용하여 전역 상태를 관리합니다. 각 기능별로 독립적인 Context를 구현하여 관심사를 분리했습니다.

#### Context 구조

```
AppProvider
├── AuthProvider (인증 상태)
├── UserInteractionProvider (사용자 상호작용)
├── CollaborativeProvider (협업 필터링)
├── MenuRecommendationProvider (메뉴 추천)
├── ChujonProvider (취존 추천)
├── NearbyProvider (근처 맛집)
└── QuestionsProvider (AI 질문)
```

#### 주요 Context

- **AuthContext**: 사용자 로그인/로그아웃 상태 관리
- **UserInteractionContext**: 메뉴 클릭, 즐겨찾기, 검색 등 사용자 상호작용 기록
- **MenuRecommendationContext**: 메뉴 추천 관련 상태 및 로직
- **ChujonContext**: 취존 추천 시스템 관련 상태
- **NearbyContext**: 근처 맛집 검색 및 위치 기반 서비스
- **QuestionsContext**: AI 챗봇 질문/답변 관리
- **CollaborativeContext**: 협업 필터링 추천 관리

### 사용법

```typescript
// 개별 Context 사용
import { useAuth } from '../contexts/AuthContext';
import { useMenuRecommendations } from '../contexts/MenuRecommendationContext';

// 또는 hooks를 통한 사용
import { useAuth, useMenuRecommendations } from '../hooks';

const MyComponent = () => {
    const { isLoggedIn, userInfo } = useAuth();
    const { recommendations, loading } = useMenuRecommendations();
    
    // 컴포넌트 로직
};
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Expo CLI

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

### 플랫폼별 실행

```bash
# 웹
npm run web

# iOS
npm run ios

# Android
npm run android
```

## 📁 프로젝트 구조

```
frontend/
├── app/                    # Expo Router 페이지
├── components/             # 재사용 가능한 컴포넌트
├── contexts/              # Context API 구현
│   ├── AuthContext.tsx
│   ├── MenuRecommendationContext.tsx
│   ├── ChujonContext.tsx
│   ├── NearbyContext.tsx
│   ├── QuestionsContext.tsx
│   ├── UserInteractionContext.tsx
│   ├── CollaborativeContext.tsx
│   ├── AppProvider.tsx
│   └── index.ts
├── hooks/                 # Context 기반 커스텀 훅
├── services/              # API 서비스
├── styles/                # 스타일 정의
├── utils/                 # 유틸리티 함수
└── config/                # 설정 파일
```

## 🔧 주요 기능

### 1. 메뉴 추천 시스템
- 개인화된 메뉴 추천
- 시간대별 추천 (아침/점심/저녁)
- 카테고리별 필터링
- A/B 테스트 지원

### 2. 취존 추천 시스템
- 사용자 선호도 기반 추천
- 질문-답변 기반 개인화
- 하이브리드 추천 알고리즘

### 3. 근처 맛집 검색
- 실시간 위치 기반 검색
- 카카오 맵 API 연동
- 무한 스크롤 지원

### 4. AI 챗봇
- Perplexity AI 기반 질문/답변
- 음식 관련 정보 제공
- 대화 기록 관리

### 5. 사용자 인증
- 카카오 로그인 연동
- JWT 토큰 기반 인증
- 자동 로그인 상태 관리

## 🎨 UI/UX 특징

- **반응형 디자인**: 웹과 모바일 모두 지원
- **다크/라이트 모드**: 시스템 설정에 따른 자동 전환
- **접근성**: 스크린 리더 지원
- **성능 최적화**: 메모이제이션과 지연 로딩 적용

## 🔒 보안

- 환경 변수를 통한 API 키 관리
- HTTPS 통신 강제
- 입력 데이터 검증
- XSS 방지

## 📱 지원 플랫폼

- iOS 13+
- Android 8+
- Web (Chrome, Safari, Firefox)

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```

## 📦 빌드

```bash
# 프로덕션 빌드
npm run build

# EAS 빌드 (Expo Application Services)
eas build
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

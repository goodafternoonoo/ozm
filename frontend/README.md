# OZM Frontend

React Native Expo 기반의 맛집 추천 앱입니다.

## 기능

- 🍽️ 메뉴 추천 (시간대별)
- 📍 근처 맛집 검색 (카카오 맵 API 연동)
- 💬 질문-답변 채팅
- 📱 위치 기반 서비스

## 설치 및 실행

   ```bash
# 의존성 설치
   npm install

# 개발 서버 시작
   npx expo start
   ```

## 카카오 API 설정

맛집 검색 기능을 사용하려면 카카오 개발자 계정과 API 키가 필요합니다.

### 1. 카카오 개발자 계정 생성
- [Kakao Developers](https://developers.kakao.com/) 에서 계정을 생성하세요.

### 2. 애플리케이션 생성
- 개발자 콘솔에서 새 애플리케이션을 생성하세요.
- 앱 이름과 플랫폼을 설정하세요.

### 3. REST API 키 발급
- 애플리케이션 설정에서 "REST API 키"를 복사하세요.

### 4. API 키 설정
`config/api.ts` 파일에서 `KAKAO_REST_API_KEY`를 실제 API 키로 교체하세요:

```typescript
export const API_CONFIG = {
  KAKAO_REST_API_KEY: 'your_actual_kakao_rest_api_key_here',
  // ...
};
```

### 5. 플랫폼 설정
- **Android**: 패키지명을 `app.json`의 `expo.android.package`와 일치하도록 설정
- **iOS**: 번들 ID를 `app.json`의 `expo.ios.bundleIdentifier`와 일치하도록 설정

## 주요 기능

### 맛집 검색
- 현재 위치 기반 근처 맛집 검색
- 키워드 검색 (맛집 이름, 음식 종류)
- 검색 반경 조절 (500m ~ 3km)
- 카카오맵 연동

### 메뉴 추천
- 시간대별 메뉴 추천 (아침/점심/저녁)
- 추천 메뉴 저장 기능

### 질문-답변
- AI 기반 음식 관련 질문-답변
- 채팅 형태의 인터페이스

## 기술 스택

- React Native
- Expo
- TypeScript
- Axios
- Expo Location
- 카카오 로컬 API

## 파일 구조

```
frontend/
├── app/                    # 메인 앱 컴포넌트
│   ├── _layout.tsx        # 탭 네비게이션
│   ├── index.tsx          # 메뉴 추천 페이지
│   ├── nearby.tsx         # 근처 맛집 페이지
│   └── questions.tsx      # 질문-답변 페이지
├── config/                # 설정 파일
│   └── api.ts            # API 설정
├── styles/               # 스타일 파일들
├── utils/                # 유틸리티 함수들
│   ├── locationService.ts # 위치 서비스
│   └── kakaoApiService.ts # 카카오 API 서비스
└── package.json
```

## 주의사항

- 카카오 API 키는 보안을 위해 환경 변수로 관리하는 것을 권장합니다.
- 실제 배포 시에는 API 키를 안전하게 관리하세요.
- 카카오 API 사용량 제한을 확인하세요.

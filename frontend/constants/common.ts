// API 관련 상수
export const API_CONSTANTS = {
    // 백엔드 API URL
    BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    
    // API 엔드포인트
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            REFRESH: '/api/v1/auth/refresh',
            ME: '/api/v1/auth/me',
            LOGOUT: '/api/v1/auth/logout',
        },
        RECOMMENDATIONS: {
            SIMPLE: '/api/v1/recommendations/simple',
            QUIZ: '/api/v1/recommendations/quiz',
            COLLABORATIVE: '/api/v1/recommendations/collaborative',
            INTERACTION: '/api/v1/recommendations/interaction',
        },
        QUESTIONS: {
            LIST: '/api/v1/questions/',
            AI_ANSWER: '/api/v1/questions/ai-answer',
        },
        CATEGORIES: {
            LIST: '/api/v1/categories/',
        },
        FAVORITES: {
            LIST: '/api/v1/favorites/',
            ADD: '/api/v1/favorites/',
            REMOVE: '/api/v1/favorites/',
        },
    },
    
    // HTTP 상태 코드
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    
    // 요청 타임아웃 (밀리초)
    TIMEOUT: 10000,
    
    // 재시도 횟수
    MAX_RETRIES: 3,
} as const;

// 카카오 API 관련 상수
export const KAKAO_CONSTANTS = {
    // 카카오 API URL
    BASE_URL: 'https://dapi.kakao.com/v2/local',
    
    // API 키 (환경변수에서 가져옴)
    JAVASCRIPT_KEY: process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY,
    RESTAPI_KEY: process.env.EXPO_PUBLIC_KAKAO_RESTAPI_KEY,
    CLIENT_SECRET: process.env.EXPO_PUBLIC_KAKAO_CLIENT_SECRET,
    
    // 검색 관련 상수
    SEARCH: {
        DEFAULT_RADIUS: 1000, // 기본 검색 반경 (미터)
        MAX_RADIUS: 5000, // 최대 검색 반경 (미터)
        DEFAULT_PAGE_SIZE: 15, // 기본 페이지 크기
        MAX_PAGE_SIZE: 45, // 최대 페이지 크기
        SORT_OPTIONS: {
            DISTANCE: 'distance',
            DISTANCE_DESC: 'distance_desc',
        },
    },
} as const;

// 앱 기본 설정
export const APP_CONSTANTS = {
    // 앱 이름
    NAME: 'OZM',
    
    // 앱 버전
    VERSION: '1.0.0',
    
    // 세션 관련
    SESSION: {
        PREFIX: 'session_',
        TIMEOUT: 30 * 60 * 1000, // 30분 (밀리초)
    },
    
    // 캐시 관련
    CACHE: {
        TTL: 5 * 60 * 1000, // 5분 (밀리초)
        MAX_SIZE: 100, // 최대 캐시 항목 수
    },
    
    // 페이지네이션
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100,
    },
    
    // 검색 관련
    SEARCH: {
        MIN_QUERY_LENGTH: 1,
        MAX_QUERY_LENGTH: 100,
        DEBOUNCE_DELAY: 300, // 밀리초
    },
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
    NETWORK: {
        CONNECTION_FAILED: '네트워크 연결에 실패했습니다.',
        TIMEOUT: '요청 시간이 초과되었습니다.',
        SERVER_ERROR: '서버 오류가 발생했습니다.',
    },
    AUTH: {
        LOGIN_REQUIRED: '로그인이 필요합니다.',
        INVALID_CREDENTIALS: '잘못된 로그인 정보입니다.',
        TOKEN_EXPIRED: '로그인이 만료되었습니다.',
    },
    API: {
        FETCH_FAILED: '데이터를 가져오는데 실패했습니다.',
        SAVE_FAILED: '데이터 저장에 실패했습니다.',
        DELETE_FAILED: '데이터 삭제에 실패했습니다.',
    },
    LOCATION: {
        PERMISSION_DENIED: '위치 권한이 거부되었습니다.',
        LOCATION_UNAVAILABLE: '위치 정보를 가져올 수 없습니다.',
        SEARCH_FAILED: '주변 맛집 검색에 실패했습니다.',
    },
    RECOMMENDATION: {
        FETCH_FAILED: '추천 메뉴를 가져오는데 실패했습니다.',
        NO_RESULTS: '추천할 메뉴가 없습니다.',
    },
    GENERAL: {
        UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
        TRY_AGAIN: '다시 시도해주세요.',
    },
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: '로그인되었습니다.',
        LOGOUT_SUCCESS: '로그아웃되었습니다.',
    },
    FAVORITE: {
        ADDED: '즐겨찾기에 추가되었습니다.',
        REMOVED: '즐겨찾기에서 제거되었습니다.',
    },
    SEARCH: {
        COMPLETED: '검색이 완료되었습니다.',
    },
} as const; 
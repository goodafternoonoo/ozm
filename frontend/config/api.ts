// API 설정
export const API_CONFIG = {
    // 백엔드 API URL
    BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000',
};

// 카카오 API 설정
export const KAKAO_API_CONFIG = {
    BASE_URL: 'https://dapi.kakao.com/v2/local',
    JAVASCRIPT_KEY: process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY,
    RESTAPI_KEY: process.env.EXPO_PUBLIC_KAKAO_RESTAPI_KEY,
    CLIENT_SECRET: process.env.EXPO_PUBLIC_KAKAO_CLIENT_SECRET,
};

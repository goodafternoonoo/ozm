import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logApi, logError, LogCategory } from './logger';

// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    error?: {
        message: string;
        code: string;
        http_status: number;
        detail?: string;
    };
}

// 커스텀 에러 클래스
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// API 클라이언트 생성
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BACKEND_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
    async (config) => {
        // 요청 로깅 (개발 환경에서만)
        if (__DEV__) {
            logApi(LogCategory.API, `API Request: ${JSON.stringify({ method: config.method?.toUpperCase(), url: config.url })}`);
        }
        // JWT 토큰이 있다면 헤더에 추가
        const token = await AsyncStorage.getItem('jwt_token');
        if (token) {
            if (config.headers && typeof config.headers === 'object') {
                (config.headers as any)['Authorization'] = `Bearer ${token}`;
            } else {
                config.headers = { Authorization: `Bearer ${token}` } as any;
            }
        }
        return config;
    },
    (error) => {
        logError(LogCategory.API, `Request Error: ${error.message}`, error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // 응답 로깅 (개발 환경에서만)
        if (__DEV__) {
            logApi(LogCategory.API, `API Response: ${JSON.stringify({ status: response.status, url: response.config.url, data: response.data })}`);
        }

        // 백엔드 응답 구조 확인
        if (response.data && typeof response.data === 'object') {
            return response;
        }

        return response;
    },
    (error) => {
        // 에러 로깅
        logError(LogCategory.API, `API Error: ${error.message} | status: ${error.response?.status} | url: ${error.config?.url} | data: ${JSON.stringify(error.response?.data)}`, error);

        // 에러 변환
        const appError = handleApiError(error);
        return Promise.reject(appError);
    }
);

// API 에러 처리 함수
export const handleApiError = (error: unknown): AppError => {
    if ((error as any).response) {
        // 서버 응답이 있는 경우
        const { status, data } = (error as any).response;
        const message =
            data?.error?.message || data?.message || '서버 오류가 발생했습니다';
        const code = data?.error?.code || 'API_ERROR';

        return new AppError(message, code, status, data);
    }

    if ((error as any).request) {
        // 요청은 보냈지만 응답이 없는 경우 (네트워크 오류)
        return new AppError('네트워크 연결을 확인해주세요', 'NETWORK_ERROR', 0);
    }

    // 기타 오류
    return new AppError(
        (error as any).message || '알 수 없는 오류가 발생했습니다',
        'UNKNOWN_ERROR',
        0
    );
};

// API 메서드 래퍼 함수들
export const api = {
    // GET 요청
    get: async <T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        const response = await apiClient.get<ApiResponse<T>>(url, config);
        return response.data.data;
    },

    // POST 요청
    post: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        const response = await apiClient.post<ApiResponse<T>>(
            url,
            data,
            config
        );
        return response.data.data;
    },

    // PUT 요청
    put: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        const response = await apiClient.put<ApiResponse<T>>(url, data, config);
        return response.data.data;
    },

    // DELETE 요청
    delete: async <T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        const response = await apiClient.delete<ApiResponse<T>>(url, config);
        return response.data.data;
    },

    // PATCH 요청
    patch: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        const response = await apiClient.patch<ApiResponse<T>>(
            url,
            data,
            config
        );
        return response.data.data;
    },
};

export default apiClient;

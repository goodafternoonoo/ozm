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
            logApi(
                LogCategory.API,
                `API Request: ${JSON.stringify({
                    method: config.method?.toUpperCase(),
                    url: config.url,
                })}`
            );
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
            logApi(
                LogCategory.API,
                `API Response: ${JSON.stringify({
                    status: response.status,
                    url: response.config.url,
                    data: response.data,
                })}`
            );
        }

        // 백엔드 응답 구조 확인
        if (response.data && typeof response.data === 'object') {
            return response;
        }

        return response;
    },
    (error) => {
        // 에러 로깅
        logError(
            LogCategory.API,
            `API Error: ${error.message} | status: ${
                error.response?.status
            } | url: ${error.config?.url} | data: ${JSON.stringify(
                error.response?.data
            )}`,
            error
        );

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

        // HTTP 상태 코드별 에러 메시지
        let message = '서버 오류가 발생했습니다';
        let code = 'API_ERROR';

        switch (status) {
            case 400:
                message =
                    data?.error?.message ||
                    data?.message ||
                    '잘못된 요청입니다';
                code = data?.error?.code || 'BAD_REQUEST';
                break;
            case 401:
                message = '인증이 필요합니다';
                code = 'UNAUTHORIZED';
                break;
            case 403:
                message = '접근 권한이 없습니다';
                code = 'FORBIDDEN';
                break;
            case 404:
                message = '요청한 리소스를 찾을 수 없습니다';
                code = 'NOT_FOUND';
                break;
            case 408:
                message = '요청이 시간 초과되었습니다';
                code = 'TIMEOUT';
                break;
            case 429:
                message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
                code = 'RATE_LIMIT';
                break;
            case 500:
                message = '서버 내부 오류가 발생했습니다';
                code = 'INTERNAL_SERVER_ERROR';
                break;
            case 502:
                message = '서버를 일시적으로 사용할 수 없습니다';
                code = 'BAD_GATEWAY';
                break;
            case 503:
                message = '서비스를 일시적으로 사용할 수 없습니다';
                code = 'SERVICE_UNAVAILABLE';
                break;
            default:
                message =
                    data?.error?.message ||
                    data?.message ||
                    `서버 오류 (${status})`;
                code = data?.error?.code || 'API_ERROR';
        }

        return new AppError(message, code, status, data);
    }

    if ((error as any).request) {
        // 요청은 보냈지만 응답이 없는 경우 (네트워크 오류)
        return new AppError('네트워크 연결을 확인해주세요', 'NETWORK_ERROR', 0);
    }

    if ((error as any).code === 'ECONNABORTED') {
        // 타임아웃 에러
        return new AppError('요청이 시간 초과되었습니다', 'TIMEOUT', 0);
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

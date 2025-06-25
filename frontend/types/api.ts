// API 응답 타입
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
    success: boolean;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
    items: T[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

// API 에러 타입
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp?: string;
}

// API 요청 옵션 타입
export interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    retries?: number;
    cache?: boolean;
}

// API 엔드포인트 타입
export type ApiEndpoint = 
    | '/api/v1/auth/login'
    | '/api/v1/auth/refresh'
    | '/api/v1/auth/me'
    | '/api/v1/auth/logout'
    | '/api/v1/recommendations/simple'
    | '/api/v1/recommendations/quiz'
    | '/api/v1/recommendations/collaborative'
    | '/api/v1/recommendations/interaction'
    | '/api/v1/questions/'
    | '/api/v1/questions/ai-answer'
    | '/api/v1/categories/'
    | '/api/v1/favorites/';

// HTTP 상태 코드 타입
export type HttpStatusCode = 
    | 200 | 201 | 204
    | 400 | 401 | 403 | 404 | 409 | 422
    | 500 | 502 | 503 | 504;

// API 요청 상태 타입
export type ApiRequestState = 'idle' | 'loading' | 'success' | 'error';

// API 캐시 타입
export interface ApiCacheEntry<T = any> {
    data: T;
    timestamp: number;
    ttl: number;
}

// API 인터셉터 타입
export interface ApiInterceptor {
    request?: (config: ApiRequestOptions) => ApiRequestOptions | Promise<ApiRequestOptions>;
    response?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
    error?: (error: ApiError) => ApiError | Promise<ApiError>;
} 
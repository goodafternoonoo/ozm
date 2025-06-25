// 환경 타입
type Environment = 'development' | 'staging' | 'production';

// 현재 환경 감지
export const getCurrentEnvironment = (): Environment => {
    if (__DEV__) {
        return 'development';
    }
    
    // 환경변수로 환경 확인
    const env = process.env.EXPO_PUBLIC_ENVIRONMENT;
    if (env === 'production') {
        return 'production';
    }
    if (env === 'staging') {
        return 'staging';
    }
    
    return 'development';
};

// 환경별 설정
export const ENVIRONMENT_CONFIG = {
    development: {
        // 개발 환경 설정
        API_URL: 'http://localhost:8000',
        LOG_LEVEL: 'debug',
        ENABLE_DEBUG_MENU: true,
        ENABLE_MOCK_DATA: true,
        ENABLE_ANALYTICS: false,
        ENABLE_CRASH_REPORTING: false,
        CACHE_TTL: 1 * 60 * 1000, // 1분
        SESSION_TIMEOUT: 60 * 60 * 1000, // 1시간
    },
    staging: {
        // 스테이징 환경 설정
        API_URL: process.env.EXPO_PUBLIC_STAGING_API_URL || 'https://staging-api.ozm.com',
        LOG_LEVEL: 'info',
        ENABLE_DEBUG_MENU: false,
        ENABLE_MOCK_DATA: false,
        ENABLE_ANALYTICS: true,
        ENABLE_CRASH_REPORTING: true,
        CACHE_TTL: 5 * 60 * 1000, // 5분
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
    },
    production: {
        // 프로덕션 환경 설정
        API_URL: process.env.EXPO_PUBLIC_PRODUCTION_API_URL || 'https://api.ozm.com',
        LOG_LEVEL: 'error',
        ENABLE_DEBUG_MENU: false,
        ENABLE_MOCK_DATA: false,
        ENABLE_ANALYTICS: true,
        ENABLE_CRASH_REPORTING: true,
        CACHE_TTL: 10 * 60 * 1000, // 10분
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
    },
} as const;

// 현재 환경 설정 가져오기
export const getCurrentConfig = () => {
    const env = getCurrentEnvironment();
    return ENVIRONMENT_CONFIG[env];
};

// 환경별 기능 플래그
export const FEATURE_FLAGS = {
    // 개발 환경에서만 활성화
    development: {
        ENABLE_MOCK_API: true,
        ENABLE_DEBUG_PANEL: true,
        ENABLE_PERFORMANCE_MONITORING: true,
        ENABLE_NETWORK_INSPECTOR: true,
        ENABLE_FAST_REFRESH: true,
    },
    // 스테이징 환경에서만 활성화
    staging: {
        ENABLE_MOCK_API: false,
        ENABLE_DEBUG_PANEL: false,
        ENABLE_PERFORMANCE_MONITORING: true,
        ENABLE_NETWORK_INSPECTOR: false,
        ENABLE_FAST_REFRESH: false,
    },
    // 프로덕션 환경에서만 활성화
    production: {
        ENABLE_MOCK_API: false,
        ENABLE_DEBUG_PANEL: false,
        ENABLE_PERFORMANCE_MONITORING: false,
        ENABLE_NETWORK_INSPECTOR: false,
        ENABLE_FAST_REFRESH: false,
    },
} as const;

// 현재 환경의 기능 플래그 가져오기
export const getCurrentFeatureFlags = () => {
    const env = getCurrentEnvironment();
    return FEATURE_FLAGS[env];
};

// 환경별 로깅 설정
export const LOGGING_CONFIG = {
    development: {
        level: 'debug',
        enableConsole: true,
        enableFile: false,
        enableRemote: false,
        maxLogSize: 1000,
    },
    staging: {
        level: 'info',
        enableConsole: true,
        enableFile: true,
        enableRemote: true,
        maxLogSize: 5000,
    },
    production: {
        level: 'error',
        enableConsole: false,
        enableFile: true,
        enableRemote: true,
        maxLogSize: 10000,
    },
} as const;

// 현재 환경의 로깅 설정 가져오기
export const getCurrentLoggingConfig = () => {
    const env = getCurrentEnvironment();
    return LOGGING_CONFIG[env];
};

// 환경별 API 설정
export const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:8000',
        timeout: 10000,
        retries: 3,
        enableCache: true,
        enableRetry: true,
    },
    staging: {
        baseURL: process.env.EXPO_PUBLIC_STAGING_API_URL || 'https://staging-api.ozm.com',
        timeout: 15000,
        retries: 2,
        enableCache: true,
        enableRetry: true,
    },
    production: {
        baseURL: process.env.EXPO_PUBLIC_PRODUCTION_API_URL || 'https://api.ozm.com',
        timeout: 20000,
        retries: 1,
        enableCache: true,
        enableRetry: false,
    },
} as const;

// 현재 환경의 API 설정 가져오기
export const getCurrentApiConfig = () => {
    const env = getCurrentEnvironment();
    return API_CONFIG[env];
};

// 환경별 성능 설정
export const PERFORMANCE_CONFIG = {
    development: {
        enableProfiling: true,
        enableMemoryLeakDetection: true,
        enableSlowQueryDetection: true,
        imageQuality: 'high',
        enableLazyLoading: false,
    },
    staging: {
        enableProfiling: true,
        enableMemoryLeakDetection: false,
        enableSlowQueryDetection: true,
        imageQuality: 'medium',
        enableLazyLoading: true,
    },
    production: {
        enableProfiling: false,
        enableMemoryLeakDetection: false,
        enableSlowQueryDetection: false,
        imageQuality: 'low',
        enableLazyLoading: true,
    },
} as const;

// 현재 환경의 성능 설정 가져오기
export const getCurrentPerformanceConfig = () => {
    const env = getCurrentEnvironment();
    return PERFORMANCE_CONFIG[env];
};

// 환경별 보안 설정
export const SECURITY_CONFIG = {
    development: {
        enableSSL: false,
        enableCertificatePinning: false,
        enableBiometricAuth: false,
        enableEncryption: false,
    },
    staging: {
        enableSSL: true,
        enableCertificatePinning: false,
        enableBiometricAuth: true,
        enableEncryption: true,
    },
    production: {
        enableSSL: true,
        enableCertificatePinning: true,
        enableBiometricAuth: true,
        enableEncryption: true,
    },
} as const;

// 현재 환경의 보안 설정 가져오기
export const getCurrentSecurityConfig = () => {
    const env = getCurrentEnvironment();
    return SECURITY_CONFIG[env];
}; 
// 시간대 관련 상수
export const TIME_SLOTS = {
    BREAKFAST: 'breakfast' as const,
    LUNCH: 'lunch' as const,
    DINNER: 'dinner' as const,
} as const;

export type TimeSlot = typeof TIME_SLOTS[keyof typeof TIME_SLOTS];

// 시간대별 시간 범위
export const TIME_SLOT_RANGES = {
    [TIME_SLOTS.BREAKFAST]: {
        START: 6, // 6시
        END: 11, // 11시
        LABEL: '아침',
        EMOJI: '🌅',
    },
    [TIME_SLOTS.LUNCH]: {
        START: 11, // 11시
        END: 17, // 17시
        LABEL: '점심',
        EMOJI: '☀️',
    },
    [TIME_SLOTS.DINNER]: {
        START: 17, // 17시
        END: 23, // 23시
        LABEL: '저녁',
        EMOJI: '🌙',
    },
} as const;

// 추천 시스템 관련 상수
export const RECOMMENDATION = {
    // 추천 타입
    TYPES: {
        SIMPLE: 'simple',
        QUIZ: 'quiz',
        COLLABORATIVE: 'collaborative',
        HYBRID: 'hybrid',
    },
    
    // 추천 점수 범위
    SCORE: {
        MIN: 0,
        MAX: 100,
        THRESHOLD: 50, // 최소 추천 점수
    },
    
    // 추천 결과 개수
    LIMITS: {
        DEFAULT: 10,
        MIN: 5,
        MAX: 20,
    },
    
    // A/B 테스트 그룹
    AB_TEST: {
        GROUPS: {
            CONTROL: 'control',
            VARIANT_A: 'variant_a',
            VARIANT_B: 'variant_b',
        },
        WEIGHTS: {
            CONTROL: 0.33,
            VARIANT_A: 0.33,
            VARIANT_B: 0.34,
        },
    },
} as const;

// 카테고리 관련 상수
export const CATEGORIES = {
    // 카테고리 타입
    TYPES: {
        CUISINE: 'cuisine', // 요리 종류
        DIET: 'diet', // 식단 타입
        OCCASION: 'occasion', // 상황별
        SEASON: 'season', // 계절별
    },
    
    // 요리 종류
    CUISINE: {
        KOREAN: 'korean',
        CHINESE: 'chinese',
        JAPANESE: 'japanese',
        WESTERN: 'western',
        ASIAN: 'asian',
        FUSION: 'fusion',
    },
    
    // 식단 타입
    DIET: {
        VEGETARIAN: 'vegetarian',
        VEGAN: 'vegan',
        GLUTEN_FREE: 'gluten_free',
        LOW_CARB: 'low_carb',
        HIGH_PROTEIN: 'high_protein',
    },
    
    // 상황별
    OCCASION: {
        QUICK: 'quick', // 빠른 조리
        HEALTHY: 'healthy', // 건강식
        SPICY: 'spicy', // 매운맛
        MILD: 'mild', // 순한맛
        FESTIVE: 'festive', // 축제/특별한 날
        CASUAL: 'casual', // 일상
    },
} as const;

// 메뉴 관련 상수
export const MENU = {
    // 메뉴 타입
    TYPES: {
        MAIN: 'main', // 메인 요리
        SIDE: 'side', // 반찬
        SOUP: 'soup', // 국물 요리
        DESSERT: 'dessert', // 디저트
        DRINK: 'drink', // 음료
    },
    
    // 난이도
    DIFFICULTY: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard',
    },
    
    // 조리 시간 (분)
    COOKING_TIME: {
        QUICK: 15, // 15분 이하
        NORMAL: 30, // 30분 이하
        LONG: 60, // 60분 이하
        VERY_LONG: 120, // 120분 이하
    },
    
    // 칼로리 범위
    CALORIES: {
        LOW: 300, // 300kcal 이하
        MEDIUM: 600, // 600kcal 이하
        HIGH: 1000, // 1000kcal 이하
    },
    
    // 매운맛 레벨
    SPICE_LEVEL: {
        MILD: 1,
        MEDIUM: 2,
        HOT: 3,
        VERY_HOT: 4,
        EXTREME: 5,
    },
} as const;

// 사용자 상호작용 관련 상수
export const INTERACTION = {
    // 상호작용 타입
    TYPES: {
        CLICK: 'click',
        FAVORITE: 'favorite',
        SEARCH: 'search',
        RECOMMEND_SELECT: 'recommend_select',
        VIEW_DETAIL: 'view_detail',
        SHARE: 'share',
    },
    
    // 상호작용 강도
    STRENGTH: {
        WEAK: 0.3,
        NORMAL: 0.6,
        STRONG: 1.0,
        NEGATIVE: -1.0,
    },
    
    // 세션 타임아웃 (밀리초)
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
} as const;

// 위치 관련 상수
export const LOCATION = {
    // 검색 반경 (미터)
    RADIUS: {
        NEAR: 500,
        DEFAULT: 1000,
        FAR: 2000,
        MAX: 5000,
    },
    
    // 정렬 옵션
    SORT: {
        DISTANCE: 'distance',
        RATING: 'rating',
        REVIEW_COUNT: 'review_count',
    },
    
    // 위치 권한 상태
    PERMISSION: {
        GRANTED: 'granted',
        DENIED: 'denied',
        RESTRICTED: 'restricted',
    },
} as const;

// 검색 관련 상수
export const SEARCH = {
    // 최소 검색어 길이
    MIN_QUERY_LENGTH: 1,
    
    // 최대 검색어 길이
    MAX_QUERY_LENGTH: 100,
    
    // 검색 지연 시간 (밀리초)
    DEBOUNCE_DELAY: 300,
    
    // 검색 결과 제한
    LIMITS: {
        DEFAULT: 20,
        MAX: 50,
    },
    
    // 검색 필터
    FILTERS: {
        DISTANCE: 'distance',
        RATING: 'rating',
        PRICE: 'price',
        CATEGORY: 'category',
        OPEN_NOW: 'open_now',
    },
} as const;

// 즐겨찾기 관련 상수
export const FAVORITE = {
    // 즐겨찾기 상태
    STATUS: {
        ADDED: 'added',
        REMOVED: 'removed',
    },
    
    // 즐겨찾기 제한
    LIMITS: {
        MAX: 100, // 최대 즐겨찾기 개수
    },
} as const;

// 평가 관련 상수
export const RATING = {
    // 평점 범위
    RANGE: {
        MIN: 1,
        MAX: 5,
        DEFAULT: 0,
    },
    
    // 평점 단위
    STEP: 0.5,
    
    // 평점 라벨
    LABELS: {
        1: '매우 나쁨',
        2: '나쁨',
        3: '보통',
        4: '좋음',
        5: '매우 좋음',
    },
} as const; 
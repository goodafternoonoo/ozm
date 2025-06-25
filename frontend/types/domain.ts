// 사용자 관련 타입
export interface User {
    id: string;
    email: string;
    nickname: string;
    profile_image?: string;
    created_at: string;
    updated_at: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    favorite_cuisines: string[];
    dietary_restrictions: string[];
    spice_tolerance: number;
    cooking_skill_level: 'beginner' | 'intermediate' | 'advanced';
    preferred_cooking_time: number; // 분 단위
    calorie_preference: 'low' | 'medium' | 'high';
}

// 인증 관련 타입
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

// 카테고리 관련 타입
export interface Category {
    id: string;
    name: string;
    description?: string;
    country: string;
    cuisine_type: string;
    is_active: boolean;
    display_order: number;
    icon_url?: string;
    color_code?: string;
    created_at: string;
    updated_at: string;
}

// 메뉴 관련 타입
export interface Menu {
    id: string;
    name: string;
    description: string;
    category_id: string;
    category?: Category;
    ingredients: string[];
    instructions: string[];
    cooking_time: number; // 분 단위
    difficulty_level: 'easy' | 'medium' | 'hard';
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    spice_level: number; // 1-5
    tags: string[];
    image_url?: string;
    rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
}

// 추천 관련 타입
export interface MenuRecommendation {
    menu: Menu;
    score: number;
    reason: string;
    recommendation_type: 'simple' | 'quiz' | 'collaborative' | 'hybrid';
    confidence: number; // 0-1
}

export interface RecommendationRequest {
    time_slot: 'breakfast' | 'lunch' | 'dinner';
    category_id?: string;
    session_id: string;
    user_preferences?: Partial<UserPreferences>;
}

export interface RecommendationResponse {
    recommendations: MenuRecommendation[];
    session_id: string;
    total_count: number;
    ab_test_info?: ABTestInfo;
}

// A/B 테스트 관련 타입
export interface ABTestInfo {
    abGroup: string;
    weightSet: Record<string, number>;
    recommendationType: string;
    variantId: string;
}

// 질문 관련 타입
export interface Question {
    id: string;
    text: string;
    options: string[];
    category: string;
    weight: number;
    question_type: 'chujon' | 'preference' | 'general';
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface QuestionAnswer {
    question_id: string;
    answer: string;
    timestamp: string;
}

// 상호작용 관련 타입
export interface UserInteraction {
    id: string;
    session_id: string;
    user_id?: string;
    menu_id?: string;
    interaction_type: 'click' | 'favorite' | 'search' | 'recommend_select' | 'view_detail' | 'share';
    interaction_strength?: number;
    extra_data?: Record<string, any>;
    timestamp: string;
}

// 즐겨찾기 관련 타입
export interface Favorite {
    id: string;
    user_id: string;
    menu_id: string;
    created_at: string;
    menu?: Menu;
}

// 위치 관련 타입
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
}

export interface Restaurant {
    id: string;
    name: string;
    category: string;
    distance: number;
    distanceFormatted: string;
    rating: number;
    address: string;
    phone: string;
    placeUrl: string;
    roadAddress: string;
    latitude: number;
    longitude: number;
}

// 검색 관련 타입
export interface SearchFilters {
    category?: string;
    distance?: number;
    rating?: number;
    price_range?: 'low' | 'medium' | 'high';
    open_now?: boolean;
    dietary_restrictions?: string[];
}

export interface SearchRequest {
    query: string;
    location: LocationData;
    filters?: SearchFilters;
    page?: number;
    limit?: number;
}

// 세션 관련 타입
export interface Session {
    id: string;
    user_id?: string;
    created_at: string;
    last_activity: string;
    expires_at: string;
    device_info?: DeviceInfo;
}

export interface DeviceInfo {
    platform: 'ios' | 'android' | 'web';
    version: string;
    model?: string;
    user_agent?: string;
}

// 협업 필터링 추천 타입
export interface CollaborativeRecommendation {
    menu: Menu;
    score: number;
    reason: string;
    similarityScore: number;
    similarUsersCount: number;
}

// 상호작용 기록 응답 타입
export interface UserInteractionRecordResponse {
    message: string;
    interaction_id: string;
    preference_updated: boolean;
} 
// 선택적 속성 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// 필수 속성 타입 (기존 Required와 충돌 방지)
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
// 읽기 전용 타입
export type ReadonlyType<T> = { readonly [P in keyof T]: T[P] };
// 깊은 읽기 전용 타입
export type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };
// 부분적 타입
export type PartialType<T> = { [P in keyof T]?: T[P] };
// 깊은 부분적 타입
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
// ID 타입
export type ID = string | number;
// UUID 타입
export type UUID = string;
// 타임스탬프 타입
export type Timestamp = number | string;
// 날짜 타입
export type DateString = string;
// 이메일 타입
export type Email = string;
// URL 타입
export type URL = string;
// 파일 경로 타입
export type FilePath = string;
// 색상 코드 타입
export type ColorCode = string;
// 크기 타입
export type Size = 'small' | 'medium' | 'large';
// 상태 타입
export type Status = 'idle' | 'loading' | 'success' | 'error';
// 방향 타입
export type Direction = 'up' | 'down' | 'left' | 'right';
// 위치 타입
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';
// 정렬 타입
export type Alignment = 'start' | 'center' | 'end' | 'justify';
// 플랫폼 타입
export type Platform = 'ios' | 'android' | 'web';
// 환경 타입
export type Environment = 'development' | 'staging' | 'production';
// 시간대 타입
export type TimeSlot = 'breakfast' | 'lunch' | 'dinner';
// 난이도 타입
export type Difficulty = 'easy' | 'medium' | 'hard';
// 칼로리 선호도 타입
export type CaloriePreference = 'low' | 'medium' | 'high';
// 조리 기술 수준 타입
export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';
// 추천 타입
export type RecommendationType = 'simple' | 'quiz' | 'collaborative' | 'hybrid';
// 상호작용 타입
export type InteractionType = 'click' | 'favorite' | 'search' | 'recommend_select' | 'view_detail' | 'share';
// 질문 타입
export type QuestionType = 'chujon' | 'preference' | 'general';
// 위치 권한 타입
export type LocationPermission = 'granted' | 'denied' | 'loading';
// 정렬 옵션 타입
export type SortOption = 'distance' | 'distance_desc' | 'rating' | 'review_count';
// 가격 범위 타입
export type PriceRange = 'low' | 'medium' | 'high';
// 애니메이션 타입
export type AnimationType = 'none' | 'slide' | 'fade';
// 토스트 타입
export type ToastType = 'success' | 'error' | 'warning' | 'info';
// 버튼 변형 타입
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
// 탭바 변형 타입
export type TabBarVariant = 'default' | 'segmented' | 'pills';
// 스켈레톤 변형 타입
export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
// 스켈레톤 애니메이션 타입
export type SkeletonAnimation = 'pulse' | 'wave';
// 툴팁 위치 타입
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'; 
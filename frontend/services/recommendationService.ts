import { api, AppError } from '../utils/apiClient';

// 타입 정의
export interface Menu {
    id: string;
    name: string;
    description: string;
    category: string;
    rating: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

export interface MenuRecommendation {
    menu: Menu;
    score: number;
    reason: string;
}

export interface ABTestInfo {
    abGroup: string;
    weightSet: Record<string, number>;
    recommendationType: string;
}

export interface SimpleRecommendationRequest {
    time_slot: 'breakfast' | 'lunch' | 'dinner';
    category_id?: string;
    session_id: string;
}

export interface ChujonRecommendationRequest {
    answers: { [questionId: string]: string };
    timeSlot?: 'breakfast' | 'lunch' | 'dinner';
    preferences?: string[];
}

export interface CollaborativeRecommendationRequest {
    session_id: string;
    limit?: number;
}

export interface RecommendationResponse {
    recommendations: MenuRecommendation[];
    session_id: string;
    total_count: number;
    ab_test_info?: ABTestInfo;
}

export interface InteractionData {
    session_id: string;
    menu_id?: string;
    interaction_type:
        | 'click'
        | 'favorite'
        | 'search'
        | 'recommend_select'
        | 'view_detail'
        | 'share';
    interaction_strength?: number;
    extra_data?: Record<string, any>;
}

// 추천 서비스 클래스
export class RecommendationService {
    // 간단 추천
    static async getSimpleRecommendations(
        request: SimpleRecommendationRequest
    ): Promise<RecommendationResponse> {
        try {
            return await api.post<RecommendationResponse>(
                '/api/v1/recommendations/simple',
                request
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '간단 추천을 가져오는데 실패했습니다',
                'SIMPLE_RECOMMENDATION_ERROR'
            );
        }
    }

    // 취존 추천
    static async getChujonRecommendations(
        request: ChujonRecommendationRequest
    ): Promise<RecommendationResponse> {
        try {
            return await api.post<RecommendationResponse>(
                '/api/v1/recommendations/quiz',
                request
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '취존 추천을 가져오는데 실패했습니다',
                'CHUJON_RECOMMENDATION_ERROR'
            );
        }
    }

    // 협업 필터링 추천
    static async getCollaborativeRecommendations(
        request: CollaborativeRecommendationRequest
    ): Promise<RecommendationResponse> {
        try {
            return await api.post<RecommendationResponse>(
                '/api/v1/recommendations/collaborative',
                request
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '협업 필터링 추천을 가져오는데 실패했습니다',
                'COLLABORATIVE_RECOMMENDATION_ERROR'
            );
        }
    }

    // 상호작용 기록
    static async recordInteraction(
        interactionData: InteractionData
    ): Promise<any> {
        try {
            return await api.post(
                '/api/v1/recommendations/interaction',
                interactionData
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '상호작용 기록에 실패했습니다',
                'INTERACTION_RECORD_ERROR'
            );
        }
    }

    // 협업 필터링 상세 정보 (GET)
    static async getCollaborativeRecommendationsRaw(
        sessionId: string,
        limit: number = 5
    ): Promise<any[]> {
        try {
            return await api.get<any[]>(
                `/api/v1/recommendations/collaborative-users?session_id=${sessionId}&limit=${limit}`
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '협업 필터링 상세 정보를 가져오는데 실패했습니다',
                'COLLABORATIVE_DETAIL_ERROR'
            );
        }
    }
}

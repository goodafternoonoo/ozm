import {
    RecommendationService,
    SimpleRecommendationRequest,
    QuizRecommendationRequest,
    CollaborativeRecommendationRequest,
    InteractionData,
} from '../services/recommendationService';
import { AppError } from '../utils/apiClient';

// axios 모킹
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
    })),
}));

// apiClient 모킹
jest.mock('../utils/apiClient', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
    },
    AppError: class AppError extends Error {
        public code: string;
        public statusCode?: number;
        public details?: any;

        constructor(
            message: string,
            code: string,
            statusCode?: number,
            details?: any
        ) {
            super(message);
            this.name = 'AppError';
            this.code = code;
            this.statusCode = statusCode;
            this.details = details;
        }
    },
}));

describe('RecommendationService API', () => {
    const sessionId = 'test-session-id';
    const { api: mockApi } = jest.requireMock('../utils/apiClient');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get simple recommendations', async () => {
        const mockResponse = {
            recommendations: [
                {
                    menu: {
                        id: 1,
                        name: '김치볶음밥',
                        description: '매콤한 김치와 함께 볶은 맛있는 볶음밥',
                        category: '한식',
                        rating: 4.5,
                    },
                    score: 0.85,
                    reason: '매운맛을 좋아하시는 분께 적합',
                },
            ],
            session_id: sessionId,
            total_count: 1,
            ab_test_info: {
                abGroup: 'A',
                weightSet: { spicy: 0.8, healthy: 0.5 },
                recommendationType: 'simple',
            },
        };

        mockApi.post.mockResolvedValue(mockResponse);

        const req: SimpleRecommendationRequest = {
            time_slot: 'lunch',
            session_id: sessionId,
        };

        const res = await RecommendationService.getSimpleRecommendations(req);

        expect(mockApi.post).toHaveBeenCalledWith(
            '/api/v1/recommendations/simple',
            req
        );
        expect(res).toEqual(mockResponse);
        expect(res).toHaveProperty('recommendations');
        expect(Array.isArray(res.recommendations)).toBe(true);
        expect(res).toHaveProperty('session_id');
    });

    it('should get quiz recommendations', async () => {
        const mockResponse = {
            recommendations: [
                {
                    menu: {
                        id: 2,
                        name: '마파두부',
                        description: '매콤달콤한 마파두부',
                        category: '중식',
                        rating: 4.3,
                    },
                    score: 0.92,
                    reason: '매운맛을 좋아하시는 분께 적합',
                },
            ],
            session_id: sessionId,
            total_count: 1,
            ab_test_info: {
                abGroup: 'B',
                weightSet: { spicy: 0.9, healthy: 0.3 },
                recommendationType: 'quiz',
            },
        };

        mockApi.post.mockResolvedValue(mockResponse);

        const req: QuizRecommendationRequest = {
            answers: { taste: 'spicy' },
            session_id: sessionId,
        };

        const res = await RecommendationService.getQuizRecommendations(req);

        expect(mockApi.post).toHaveBeenCalledWith(
            '/api/v1/recommendations/quiz',
            req
        );
        expect(res).toEqual(mockResponse);
        expect(res).toHaveProperty('recommendations');
        expect(Array.isArray(res.recommendations)).toBe(true);
        expect(res).toHaveProperty('session_id');
    });

    it('should get collaborative recommendations', async () => {
        const mockResponse = {
            recommendations: [
                {
                    menu: {
                        id: 3,
                        name: '비빔밥',
                        description:
                            '다양한 나물과 고추장을 비빈 한국 전통 요리',
                        category: '한식',
                        rating: 4.7,
                    },
                    score: 0.78,
                    reason: '협업 필터링 기반 추천',
                },
            ],
            session_id: sessionId,
            total_count: 1,
            ab_test_info: {
                abGroup: 'C',
                weightSet: { collaborative: 0.7 },
                recommendationType: 'collaborative',
            },
        };

        mockApi.post.mockResolvedValue(mockResponse);

        const req: CollaborativeRecommendationRequest = {
            session_id: sessionId,
            limit: 3,
        };

        const res = await RecommendationService.getCollaborativeRecommendations(
            req
        );

        expect(mockApi.post).toHaveBeenCalledWith(
            '/api/v1/recommendations/collaborative',
            req
        );
        expect(res).toEqual(mockResponse);
        expect(res).toHaveProperty('recommendations');
        expect(Array.isArray(res.recommendations)).toBe(true);
        expect(res).toHaveProperty('session_id');
    });

    it('should record user interaction', async () => {
        const mockResponse = {
            success: true,
            message: '상호작용이 기록되었습니다',
        };
        mockApi.post.mockResolvedValue(mockResponse);

        const interaction: InteractionData = {
            session_id: sessionId,
            interaction_type: 'click',
            menu_id: '1',
            interaction_strength: 1,
            extra_data: { test: true },
        };

        const res = await RecommendationService.recordInteraction(interaction);

        expect(mockApi.post).toHaveBeenCalledWith(
            '/api/v1/recommendations/interaction',
            interaction
        );
        expect(res).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
        const errorMessage = '서버 오류가 발생했습니다';
        const errorCode = 'API_ERROR';

        mockApi.post.mockRejectedValue(
            new AppError(errorMessage, errorCode, 500)
        );

        const req: SimpleRecommendationRequest = {
            time_slot: 'lunch',
            session_id: sessionId,
        };

        await expect(
            RecommendationService.getSimpleRecommendations(req)
        ).rejects.toThrow(AppError);
        await expect(
            RecommendationService.getSimpleRecommendations(req)
        ).rejects.toThrow(errorMessage);
    });
});

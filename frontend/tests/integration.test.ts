// 반드시 최상단에 선언
import axios from 'axios';
jest.mock('axios');

// axios.create()가 실제 인스턴스처럼 동작하도록 mock
const mockAxiosInstance = {
    interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
};
(axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

import { RecommendationService as RecommendationServiceType } from '../services/recommendationService';
import { AppError as AppErrorType } from '../utils/apiClient';

let RecommendationService: typeof RecommendationServiceType;
let favoriteService: any;
let QuestionService: any;
let CategoryService: any;
let AppError: typeof AppErrorType;

beforeAll(async () => {
    RecommendationService = (await import('../services/recommendationService'))
        .RecommendationService;
    favoriteService = await import('../services/favoriteService');
    QuestionService = (await import('../services/questionService'))
        .QuestionService;
    CategoryService = (await import('../services/categoryService'))
        .CategoryService;
    AppError = (await import('../utils/apiClient')).AppError;
});

describe('통합 서비스 테스트', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('추천 서비스', () => {
        it('간단 추천 정상 응답', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: {
                    data: {
                        recommendations: [],
                        session_id: 'abc',
                        total_count: 0,
                    },
                },
            });
            const res = await RecommendationService.getSimpleRecommendations({
                time_slot: 'lunch',
                session_id: 'abc',
            });
            expect(res.session_id).toBe('abc');
            expect(res.recommendations).toEqual([]);
        });
        it('취존 추천 에러 처리', async () => {
            mockAxiosInstance.post.mockRejectedValueOnce({
                response: {
                    data: { error: { message: '실패', code: 'ERR' } },
                    status: 400,
                },
            });
            await expect(
                RecommendationService.getChujonRecommendations({
                    answers: {},
                    timeSlot: 'dinner',
                })
            ).rejects.toThrow(AppError);
        });
        it('협업 필터링 추천 정상 응답', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: {
                    data: {
                        recommendations: [
                            {
                                menu: {
                                    id: '1',
                                    name: '김치찌개',
                                    description: '',
                                    category: '',
                                    rating: 5,
                                },
                                score: 0.9,
                                reason: '인기',
                            },
                        ],
                        session_id: 's1',
                        total_count: 1,
                    },
                },
            });
            const res =
                await RecommendationService.getCollaborativeRecommendations({
                    session_id: 's1',
                });
            expect(res.recommendations[0].menu.name).toBe('김치찌개');
        });
        it('상호작용 기록 정상', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: { data: { message: 'ok', interaction_id: 'id', preference_updated: true } },
            });
            const res = await RecommendationService.recordInteraction({
                session_id: 's1',
                menu_id: '1',
                interaction_type: 'click',
            });
            expect(res).toMatchObject({ message: 'ok', interaction_id: 'id', preference_updated: true });
        });
    });

    describe('즐겨찾기 서비스', () => {
        it('즐겨찾기 추가', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: {
                    data: {
                        id: 'f1',
                        user_id: 'u1',
                        menu_id: 'm1',
                        created_at: '2024-01-01',
                    },
                },
            });
            const res = await favoriteService.addFavorite('m1');
            expect(res.menu_id).toBe('m1');
        });
        it('즐겨찾기 목록 조회', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce({
                data: {
                    data: [
                        {
                            id: 'm1',
                            name: '비빔밥',
                            description: '',
                            category: '',
                            rating: 4.5,
                        },
                    ],
                },
            });
            const res = await favoriteService.getFavorites();
            expect(res[0].name).toBe('비빔밥');
        });
        it('즐겨찾기 해제', async () => {
            mockAxiosInstance.delete.mockResolvedValueOnce({
                data: { data: null },
            });
            await expect(
                favoriteService.removeFavorite('m1')
            ).resolves.toBeUndefined();
        });
    });

    describe('질문 서비스', () => {
        it('질문 목록 조회', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce({
                data: {
                    data: [
                        {
                            id: 'q1',
                            text: '맵기?',
                            options: ['맵게', '안맵게'],
                            category: 'spicy',
                            weight: 1,
                            question_type: 'single',
                        },
                    ],
                },
            });
            const res = await QuestionService.getQuestions();
            expect(res[0].text).toContain('맵기');
        });
        it('질문 답변 요청', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: { data: { answer: '맵게' } },
            });
            const res = await QuestionService.askQuestion({
                question: '맵게 드시나요?',
            });
            expect(res.answer).toBe('맵게');
        });
        it('AI 답변 요청', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: {
                    data: {
                        answer: '추천: 김치찌개',
                        model: 'ai',
                        sources: [],
                        usage: {},
                    },
                },
            });
            const res = await QuestionService.getAIAnswer({
                question: '추천해줘',
            });
            expect(res.answer).toContain('김치찌개');
        });
    });

    describe('카테고리 서비스', () => {
        it('카테고리 목록 조회', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce({
                data: {
                    data: {
                        categories: [{ id: 'c1', name: '한식' }],
                        total_count: 1,
                        page: 1,
                        size: 50,
                    },
                },
            });
            const res = await CategoryService.getCategories();
            expect(res.categories[0].name).toBe('한식');
        });
        it('카테고리 상세 조회', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce({
                data: { data: { id: 'c1', name: '한식' } },
            });
            const res = await CategoryService.getCategoryById('c1');
            expect(res.name).toBe('한식');
        });
    });
});

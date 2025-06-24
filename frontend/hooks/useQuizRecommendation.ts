import { useState, useEffect } from 'react';
import { useUserInteraction } from './useUserInteraction';
import { QuestionService, QuizQuestion } from '../services/questionService';
import {
    RecommendationService,
    MenuRecommendation,
    ABTestInfo,
} from '../services/recommendationService';
import { AppError } from '../utils/apiClient';

export type QuizAnswers = { [questionId: string]: string };

export function useQuizRecommendation() {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = useState<QuizAnswers>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<
        MenuRecommendation[]
    >([]);
    const [abTestInfo, setAbTestInfo] = useState<ABTestInfo | null>(null);
    const [sessionId, setSessionId] = useState<string>('');

    const { recordRecommendationSelect } = useUserInteraction();

    useEffect(() => {
        fetchQuestions();
        // 세션 ID 생성 (실제로는 백엔드에서 관리되어야 함)
        setSessionId(
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await QuestionService.getQuestions();
            setQuestions(
                response.map((q: any) => ({
                    ...q,
                    options: Array.isArray(q.options)
                        ? q.options
                        : typeof q.options === 'string'
                        ? JSON.parse(q.options)
                        : [],
                }))
            );
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '질문을 불러오지 못했습니다';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const setAnswer = (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const getQuizRecommendations = async () => {
        setLoading(true);
        setError(null);
        setRecommendations([]);
        setAbTestInfo(null);

        try {
            const response = await RecommendationService.getQuizRecommendations(
                {
                    answers,
                    session_id: sessionId,
                }
            );

            setRecommendations(response.recommendations);

            // A/B 테스트 정보 추출 (백엔드 응답에서)
            if (response.ab_test_info) {
                setAbTestInfo(response.ab_test_info);
            }

            // 추천 선택 상호작용 기록
            for (const rec of response.recommendations) {
                await recordRecommendationSelect(
                    sessionId,
                    rec.menu.id.toString(),
                    'quiz_hybrid'
                );
            }

            return response.recommendations;
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '추천을 가져오지 못했습니다';
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const recordMenuInteraction = async (
        menuId: string,
        interactionType: string
    ) => {
        if (interactionType === 'recommend_select') {
            await recordRecommendationSelect(sessionId, menuId, 'quiz_hybrid');
        }
    };

    return {
        questions,
        answers,
        setAnswer,
        loading,
        error,
        recommendations,
        abTestInfo,
        sessionId,
        getQuizRecommendations,
        recordMenuInteraction,
    };
}

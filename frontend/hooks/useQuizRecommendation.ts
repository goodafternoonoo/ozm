import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserInteraction } from './useUserInteraction';

export type QuizQuestion = {
    id: string;
    text: string;
    order: number;
    options: string[];
    category: string;
};

export type QuizAnswers = { [questionId: string]: string };

export type Menu = {
    id: number;
    name: string;
    description: string;
    category: string;
    rating: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
};

export type MenuRecommendation = {
    menu: Menu;
    score: number;
    reason: string;
};

export type ABTestInfo = {
    abGroup: string;
    weightSet: Record<string, number>;
    recommendationType: string;
};

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
            const response = await axios.get(
                'http://localhost:8000/api/v1/questions/'
            );
            setQuestions(
                (response.data?.data || []).map((q: any) => ({
                    ...q,
                    options: Array.isArray(q.options)
                        ? q.options
                        : typeof q.options === 'string'
                        ? JSON.parse(q.options)
                        : [],
                }))
            );
        } catch (err) {
            setError('질문을 불러오지 못했습니다');
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
            const response = await axios.post(
                'http://localhost:8000/api/v1/recommendations/quiz',
                {
                    answers,
                    session_id: sessionId,
                }
            );

            const recs = response.data?.data?.recommendations || [];
            setRecommendations(recs);

            // A/B 테스트 정보 추출 (백엔드 응답에서)
            if (response.data?.data?.ab_test_info) {
                const info = response.data.data.ab_test_info;
                setAbTestInfo({
                    abGroup: info.ab_group,
                    weightSet: info.weight_set ?? {},
                    recommendationType: info.recommendation_type,
                });
            }

            // 추천 선택 상호작용 기록
            for (const rec of recs) {
                await recordRecommendationSelect(
                    sessionId,
                    rec.menu.id.toString(),
                    'quiz_hybrid'
                );
            }

            return recs;
        } catch (err) {
            setError('추천을 가져오지 못했습니다');
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

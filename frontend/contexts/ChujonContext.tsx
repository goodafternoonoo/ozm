import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { QuestionService, ChujonQuestion } from '../services/questionService';
import { RecommendationService, Menu } from '../services/recommendationService';
import { useUserInteraction } from './UserInteractionContext';
import { abTestInfoToCamel } from '../utils/case';
import { logUserInteraction, logRecommendation, logError, LogCategory } from '../utils/logger';

export interface ChujonRecommendation {
    menu: Menu;
    reason: string;
    score: number;
}

export interface ChujonAnswers {
    [questionId: string]: string;
}

interface ChujonContextType {
    questions: ChujonQuestion[];
    answers: ChujonAnswers;
    recommendations: ChujonRecommendation[];
    loading: boolean;
    error: string | null;
    abTestInfo: any;
    sessionId: string;
    loadQuestions: () => Promise<void>;
    setAnswer: (questionId: string, answer: string) => void;
    getChujonRecommendations: () => Promise<void>;
    selectRecommendation: (menuId: string) => Promise<void>;
}

const ChujonContext = createContext<ChujonContextType | undefined>(undefined);

interface ChujonProviderProps {
    children: ReactNode;
}

export const ChujonProvider: React.FC<ChujonProviderProps> = ({ children }) => {
    const [questions, setQuestions] = useState<ChujonQuestion[]>([]);
    const [answers, setAnswers] = useState<ChujonAnswers>({});
    const [recommendations, setRecommendations] = useState<ChujonRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [abTestInfo, setAbTestInfo] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string>('');

    const { recordRecommendationSelect } = useUserInteraction();

    const loadQuestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 상태 초기화
            setAnswers({});
            setRecommendations([]);
            setAbTestInfo(null);

            logUserInteraction('취존 질문 목록 요청');
            // 실제 API 호출 - 취존 질문만 가져오기
            const allQuestions = await QuestionService.getQuestions();
            const chujonQuestions = allQuestions
                .filter((q) => q.question_type === 'chujon')
                .map((q) => ({
                    ...q,
                    options: (() => {
                        try {
                            return typeof q.options === 'string'
                                ? JSON.parse(q.options)
                                : q.options;
                        } catch (e) {
                            logError(LogCategory.USER_INTERACTION, 'Options 파싱 에러', e as Error);
                            return [];
                        }
                    })(),
                }));
            setQuestions(chujonQuestions);
            logUserInteraction('취존 질문 목록 수신', { count: chujonQuestions.length });
        } catch (err) {
            setError('질문을 불러오는데 실패했습니다.');
            logError(LogCategory.USER_INTERACTION, '질문 로드 에러', err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    const setAnswer = useCallback((questionId: string, answer: string) => {
        logUserInteraction('취존 답변 설정', { questionId, answer });
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    }, []);

    const getChujonRecommendations = useCallback(async () => {
        if (Object.keys(answers).length === 0) {
            setError('질문에 답변해주세요.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            logUserInteraction('취존 답변 제출', { answers });
            // 실제 API 호출
            const response = await RecommendationService.getChujonRecommendations({
                answers,
                timeSlot: 'lunch',
            });

            setRecommendations(response.recommendations);
            setAbTestInfo(abTestInfoToCamel(response.ab_test_info));
            setSessionId(response.session_id || '');
            logRecommendation('취존 추천 결과 수신', { count: response.recommendations.length });
        } catch (err) {
            setError('추천을 가져오는데 실패했습니다.');
            logError(LogCategory.USER_INTERACTION, '취존 추천 에러', err as Error);
        } finally {
            setLoading(false);
        }
    }, [answers]);

    const selectRecommendation = useCallback(async (menuId: string) => {
        try {
            logUserInteraction('취존 추천 선택', { menuId });
            await recordRecommendationSelect(
                sessionId,
                menuId,
                'chujon_hybrid'
            );
        } catch (err) {
            logError(LogCategory.USER_INTERACTION, '추천 선택 기록 에러', err as Error);
        }
    }, [sessionId, recordRecommendationSelect]);

    const value = {
        questions,
        answers,
        recommendations,
        loading,
        error,
        abTestInfo,
        sessionId,
        loadQuestions,
        setAnswer,
        getChujonRecommendations,
        selectRecommendation,
    };

    return (
        <ChujonContext.Provider value={value}>
            {children}
        </ChujonContext.Provider>
    );
};

export const useChujonRecommendation = (): ChujonContextType => {
    const context = useContext(ChujonContext);
    if (context === undefined) {
        throw new Error('useChujonRecommendation must be used within a ChujonProvider');
    }
    return context;
}; 
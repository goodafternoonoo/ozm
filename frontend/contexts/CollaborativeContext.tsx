import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { RecommendationService, Menu } from '../services/recommendationService';
import { AppError } from '../utils/apiClient';
import { logRecommendation, logError, LogCategory } from '../utils/logger';
import { RECOMMENDATION } from '../constants';
import { CollaborativeRecommendation } from '../types/domain';

interface CollaborativeContextType {
    recommendations: CollaborativeRecommendation[];
    loading: boolean;
    error: string | null;
    getCollaborativeRecommendations: (
        sessionId: string,
        limit?: number
    ) => Promise<CollaborativeRecommendation[] | undefined>;
    getCollaborativeRecommendationsRaw: (
        sessionId: string,
        limit?: number
    ) => Promise<CollaborativeRecommendation[] | null>;
}

const CollaborativeContext = createContext<CollaborativeContextType | undefined>(undefined);

interface CollaborativeProviderProps {
    children: ReactNode;
}

export const CollaborativeProvider: React.FC<CollaborativeProviderProps> = ({ children }) => {
    const [recommendations, setRecommendations] = useState<CollaborativeRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCollaborativeRecommendations = useCallback(async (
        sessionId: string,
        limit: number = RECOMMENDATION.LIMITS.DEFAULT
    ) => {
        setLoading(true);
        setError(null);

        try {
            logRecommendation('협업 필터링 추천 요청', { sessionId, limit });
            const response = await RecommendationService.getCollaborativeRecommendations({
                session_id: sessionId,
                limit: limit,
            });

            // 백엔드 응답을 프론트엔드 형식으로 변환
            const transformedRecs = response.recommendations.map((rec: any) => {
                // reason에서 유사도 점수와 유사 사용자 수 추출
                const reason = rec.reason || '';
                const similarityMatch = reason.match(/유사도: ([\d.]+)/);
                const usersMatch = reason.match(/유사 사용자: (\d+)명/);

                const similarityScore = similarityMatch
                    ? parseFloat(similarityMatch[1])
                    : rec.score;
                const similarUsersCount = usersMatch
                    ? parseInt(usersMatch[1])
                    : 1;

                return {
                    menu: rec.menu,
                    score: rec.score,
                    reason: rec.reason,
                    similarityScore: similarityScore,
                    similarUsersCount: similarUsersCount,
                } as CollaborativeRecommendation;
            });

            setRecommendations(transformedRecs);
            logRecommendation('협업 필터링 추천 응답 수신', { count: transformedRecs.length });
            return transformedRecs;
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '협업 필터링 추천을 가져오는데 실패했습니다';
            setError(errorMessage);
            logError(LogCategory.RECOMMENDATION, '협업 필터링 추천 에러', err as Error);
            return undefined;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCollaborativeRecommendationsRaw = useCallback(async (
        sessionId: string,
        limit: number = RECOMMENDATION.LIMITS.DEFAULT
    ): Promise<CollaborativeRecommendation[] | null> => {
        setLoading(true);
        setError(null);

        try {
            logRecommendation('협업 필터링 원시 데이터 요청', { sessionId, limit });
            const response = await RecommendationService.getCollaborativeRecommendationsRaw(
                sessionId,
                limit,
            );

            logRecommendation('협업 필터링 원시 데이터 응답 수신');
            return response as CollaborativeRecommendation[];
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '협업 필터링 추천을 가져오는데 실패했습니다';
            setError(errorMessage);
            logError(LogCategory.RECOMMENDATION, '협업 필터링 원시 데이터 에러', err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        recommendations,
        loading,
        error,
        getCollaborativeRecommendations,
        getCollaborativeRecommendationsRaw,
    };

    return (
        <CollaborativeContext.Provider value={value}>
            {children}
        </CollaborativeContext.Provider>
    );
};

export const useCollaborativeRecommendations = (): CollaborativeContextType => {
    const context = useContext(CollaborativeContext);
    if (context === undefined) {
        throw new Error('useCollaborativeRecommendations must be used within a CollaborativeProvider');
    }
    return context;
}; 
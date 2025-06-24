import { useState } from 'react';
import { RecommendationService, Menu } from '../services/recommendationService';
import { AppError } from '../utils/apiClient';

export type CollaborativeMenu = Menu;

export type CollaborativeRecommendation = {
    menu: CollaborativeMenu;
    score: number;
    reason: string;
    similarityScore: number;
    similarUsersCount: number;
};

export function useCollaborativeRecommendations() {
    const [recommendations, setRecommendations] = useState<
        CollaborativeRecommendation[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCollaborativeRecommendations = async (
        sessionId: string,
        limit: number = 5
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response =
                await RecommendationService.getCollaborativeRecommendations({
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
                };
            });

            setRecommendations(transformedRecs);
            return transformedRecs;
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '협업 필터링 추천을 가져오는데 실패했습니다';
            setError(errorMessage);
            console.error('협업 필터링 추천 에러:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getCollaborativeRecommendationsRaw = async (
        sessionId: string,
        limit: number = 5
    ) => {
        setLoading(true);
        setError(null);

        try {
            const recs =
                await RecommendationService.getCollaborativeRecommendationsRaw(
                    sessionId,
                    limit
                );

            // 상세 정보를 포함한 협업 필터링 추천으로 변환
            const transformedRecs = recs.map((rec: any) => ({
                menu: {
                    id: rec.menu_id,
                    name: rec.menu_name,
                    description: '', // 백엔드에서 제공하지 않는 경우
                    category: '', // 백엔드에서 제공하지 않는 경우
                    rating: 0, // 백엔드에서 제공하지 않는 경우
                },
                score: rec.similarity_score,
                reason: rec.reason,
                similarityScore: rec.similarity_score,
                similarUsersCount: rec.similar_users_count,
            }));

            setRecommendations(transformedRecs);
            return transformedRecs;
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '협업 필터링 상세 정보를 가져오는데 실패했습니다';
            setError(errorMessage);
            console.error('협업 필터링 상세 정보 에러:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        recommendations,
        loading,
        error,
        getCollaborativeRecommendations,
        getCollaborativeRecommendationsRaw,
    };
}

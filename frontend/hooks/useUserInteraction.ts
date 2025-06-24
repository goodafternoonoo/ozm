import { useState } from 'react';
import {
    RecommendationService,
    InteractionData,
} from '../services/recommendationService';
import { AppError } from '../utils/apiClient';

export type InteractionType =
    | 'click'
    | 'favorite'
    | 'search'
    | 'recommend_select'
    | 'view_detail'
    | 'share';

export function useUserInteraction() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recordInteraction = async (interactionData: InteractionData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await RecommendationService.recordInteraction(
                interactionData
            );
            return response;
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '상호작용 기록에 실패했습니다';
            setError(errorMessage);
            console.error('상호작용 기록 에러:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const recordMenuClick = async (
        sessionId: string,
        menuId: string,
        extraData?: Record<string, any>
    ) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: menuId,
            interaction_type: 'click',
            interaction_strength: 0.5,
            extra_data: extraData,
        });
    };

    const recordMenuFavorite = async (
        sessionId: string,
        menuId: string,
        isFavorite: boolean
    ) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: menuId,
            interaction_type: 'favorite',
            interaction_strength: isFavorite ? 1.0 : 0.3,
            extra_data: { is_favorite: isFavorite },
        });
    };

    const recordRecommendationSelect = async (
        sessionId: string,
        menuId: string,
        recommendationType: string
    ) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: menuId,
            interaction_type: 'recommend_select',
            interaction_strength: 0.8,
            extra_data: { recommendation_type: recommendationType },
        });
    };

    const recordMenuViewDetail = async (sessionId: string, menuId: string) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: menuId,
            interaction_type: 'view_detail',
            interaction_strength: 0.6,
        });
    };

    const recordMenuShare = async (
        sessionId: string,
        menuId: string,
        shareMethod: string
    ) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: menuId,
            interaction_type: 'share',
            interaction_strength: 0.9,
            extra_data: { share_method: shareMethod },
        });
    };

    return {
        loading,
        error,
        recordInteraction,
        recordMenuClick,
        recordMenuFavorite,
        recordRecommendationSelect,
        recordMenuViewDetail,
        recordMenuShare,
    };
}

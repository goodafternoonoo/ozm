import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from 'react';
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

interface UserInteractionContextType {
    loading: boolean;
    error: string | null;
    recordInteraction: (interactionData: InteractionData) => Promise<any>;
    recordMenuClick: (
        sessionId: string,
        menuId: string,
        extraData?: Record<string, any>
    ) => Promise<any>;
    recordMenuFavorite: (
        sessionId: string,
        menuId: string,
        isFavorite: boolean
    ) => Promise<any>;
    recordRecommendationSelect: (
        sessionId: string,
        menuId: string,
        recommendationType: string
    ) => Promise<any>;
    recordSearch: (
        sessionId: string,
        searchQuery: string,
        resultsCount: number
    ) => Promise<any>;
    recordViewDetail: (
        sessionId: string,
        menuId: string,
        source: string
    ) => Promise<any>;
    recordShare: (
        sessionId: string,
        menuId: string,
        shareMethod: string
    ) => Promise<any>;
}

const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);

interface UserInteractionProviderProps {
    children: ReactNode;
}

export const UserInteractionProvider: React.FC<UserInteractionProviderProps> = ({ children }) => {
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

    const recordSearch = async (
        sessionId: string,
        searchQuery: string,
        resultsCount: number
    ) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: '', // 검색은 특정 메뉴가 없음
            interaction_type: 'search',
            interaction_strength: 0.6,
            extra_data: {
                search_query: searchQuery,
                results_count: resultsCount,
            },
        });
    };

    const recordViewDetail = async (
        sessionId: string,
        menuId: string,
        source: string
    ) => {
        return await recordInteraction({
            session_id: sessionId,
            menu_id: menuId,
            interaction_type: 'view_detail',
            interaction_strength: 0.7,
            extra_data: { source: source },
        });
    };

    const recordShare = async (
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

    const value = {
        loading,
        error,
        recordInteraction,
        recordMenuClick,
        recordMenuFavorite,
        recordRecommendationSelect,
        recordSearch,
        recordViewDetail,
        recordShare,
    };

    return (
        <UserInteractionContext.Provider value={value}>
            {children}
        </UserInteractionContext.Provider>
    );
};

export const useUserInteraction = (): UserInteractionContextType => {
    const context = useContext(UserInteractionContext);
    if (context === undefined) {
        throw new Error('useUserInteraction must be used within a UserInteractionProvider');
    }
    return context;
}; 
import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from 'react';
import {
    RecommendationService,
    InteractionData,
} from '../services/recommendationService';
import { AppError } from '../utils/apiClient';
import { logUserInteraction, logError, LogCategory } from '../utils/logger';

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

    const recordInteraction = useCallback(async (interactionData: InteractionData) => {
        setLoading(true);
        setError(null);

        try {
            logUserInteraction('상호작용 기록', { interactionData });
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
            logError(LogCategory.USER_INTERACTION, '상호작용 기록 에러', err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const recordMenuClick = useCallback(async (
        sessionId: string,
        menuId: string,
        extraData?: Record<string, any>
    ) => {
        try {
            logUserInteraction('메뉴 클릭 기록', { sessionId, menuId, extraData });
            await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: 'click',
                extra_data: extraData,
            });
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '메뉴 클릭 기록 에러', error as Error);
        }
    }, []);

    const recordMenuFavorite = useCallback(async (
        sessionId: string,
        menuId: string,
        isFavorite: boolean
    ) => {
        try {
            logUserInteraction('메뉴 즐겨찾기 기록', { sessionId, menuId, isFavorite });
            await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: 'favorite',
                interaction_strength: isFavorite ? 1 : -1,
                extra_data: { is_favorite: isFavorite },
            });
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '메뉴 즐겨찾기 기록 에러', error as Error);
        }
    }, []);

    const recordRecommendationSelect = useCallback(async (
        sessionId: string,
        menuId: string,
        recommendationType: string
    ) => {
        try {
            logUserInteraction('추천 선택 기록', { sessionId, menuId, recommendationType });
            await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: 'recommend_select',
                extra_data: { recommendation_type: recommendationType },
            });
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '추천 선택 기록 에러', error as Error);
        }
    }, []);

    const recordSearch = useCallback(async (
        sessionId: string,
        searchQuery: string,
        resultsCount: number
    ) => {
        try {
            logUserInteraction('검색 기록', { sessionId, searchQuery, resultsCount });
            await RecommendationService.recordInteraction({
                session_id: sessionId,
                interaction_type: 'search',
                extra_data: {
                    search_query: searchQuery,
                    results_count: resultsCount,
                },
            });
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '검색 기록 에러', error as Error);
        }
    }, []);

    const recordViewDetail = useCallback(async (
        sessionId: string,
        menuId: string,
        source: string
    ) => {
        try {
            logUserInteraction('상세 보기 기록', { sessionId, menuId, source });
            await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: 'view_detail',
                extra_data: { source: source },
            });
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '상세 보기 기록 에러', error as Error);
        }
    }, []);

    const recordShare = useCallback(async (
        sessionId: string,
        menuId: string,
        shareMethod: string
    ) => {
        try {
            logUserInteraction('공유 기록', { sessionId, menuId, shareMethod });
            await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: 'share',
                extra_data: { share_method: shareMethod },
            });
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '공유 기록 에러', error as Error);
        }
    }, []);

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
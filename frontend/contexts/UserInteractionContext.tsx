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
import { UserInteractionRecordResponse } from '../types/domain';
import { AppError } from '../utils/apiClient';
import { logUserInteraction, logError, LogCategory } from '../utils/logger';
import { INTERACTION } from '../constants';

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
    recordInteraction: (interactionData: InteractionData) => Promise<UserInteractionRecordResponse | null>;
    recordMenuClick: (
        sessionId: string,
        menuId: string,
        extraData?: Record<string, any>
    ) => Promise<UserInteractionRecordResponse | null>;
    recordMenuFavorite: (
        sessionId: string,
        menuId: string,
        isFavorite: boolean
    ) => Promise<UserInteractionRecordResponse | null>;
    recordRecommendationSelect: (
        sessionId: string,
        menuId: string,
        recommendationType: string
    ) => Promise<UserInteractionRecordResponse | null>;
    recordSearch: (
        sessionId: string,
        searchQuery: string,
        resultsCount: number
    ) => Promise<UserInteractionRecordResponse | null>;
    recordViewDetail: (
        sessionId: string,
        menuId: string,
        source: string
    ) => Promise<UserInteractionRecordResponse | null>;
    recordShare: (
        sessionId: string,
        menuId: string,
        shareMethod: string
    ) => Promise<UserInteractionRecordResponse | null>;
}

const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);

interface UserInteractionProviderProps {
    children: ReactNode;
}

export const UserInteractionProvider: React.FC<UserInteractionProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recordInteraction = useCallback(async (interactionData: InteractionData): Promise<UserInteractionRecordResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            logUserInteraction('상호작용 기록', { interactionData });
            const response = await RecommendationService.recordInteraction(
                interactionData
            );
            return response as UserInteractionRecordResponse;
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
    ): Promise<UserInteractionRecordResponse | null> => {
        try {
            logUserInteraction('메뉴 클릭 기록', { sessionId, menuId, extraData });
            return await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: INTERACTION.TYPES.CLICK,
                extra_data: extraData,
            }) as UserInteractionRecordResponse;
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '메뉴 클릭 기록 에러', error as Error);
            return null;
        }
    }, []);

    const recordMenuFavorite = useCallback(async (
        sessionId: string,
        menuId: string,
        isFavorite: boolean
    ): Promise<UserInteractionRecordResponse | null> => {
        try {
            logUserInteraction('메뉴 즐겨찾기 기록', { sessionId, menuId, isFavorite });
            return await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: INTERACTION.TYPES.FAVORITE,
                interaction_strength: isFavorite ? INTERACTION.STRENGTH.STRONG : INTERACTION.STRENGTH.NEGATIVE,
                extra_data: { is_favorite: isFavorite },
            }) as UserInteractionRecordResponse;
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '메뉴 즐겨찾기 기록 에러', error as Error);
            return null;
        }
    }, []);

    const recordRecommendationSelect = useCallback(async (
        sessionId: string,
        menuId: string,
        recommendationType: string
    ): Promise<UserInteractionRecordResponse | null> => {
        try {
            logUserInteraction('추천 선택 기록', { sessionId, menuId, recommendationType });
            return await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: INTERACTION.TYPES.RECOMMEND_SELECT,
                extra_data: { recommendation_type: recommendationType },
            }) as UserInteractionRecordResponse;
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '추천 선택 기록 에러', error as Error);
            return null;
        }
    }, []);

    const recordSearch = useCallback(async (
        sessionId: string,
        searchQuery: string,
        resultsCount: number
    ): Promise<UserInteractionRecordResponse | null> => {
        try {
            logUserInteraction('검색 기록', { sessionId, searchQuery, resultsCount });
            return await RecommendationService.recordInteraction({
                session_id: sessionId,
                interaction_type: INTERACTION.TYPES.SEARCH,
                extra_data: {
                    search_query: searchQuery,
                    results_count: resultsCount,
                },
            }) as UserInteractionRecordResponse;
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '검색 기록 에러', error as Error);
            return null;
        }
    }, []);

    const recordViewDetail = useCallback(async (
        sessionId: string,
        menuId: string,
        source: string
    ): Promise<UserInteractionRecordResponse | null> => {
        try {
            logUserInteraction('상세 보기 기록', { sessionId, menuId, source });
            return await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: INTERACTION.TYPES.VIEW_DETAIL,
                extra_data: { source: source },
            }) as UserInteractionRecordResponse;
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '상세 보기 기록 에러', error as Error);
            return null;
        }
    }, []);

    const recordShare = useCallback(async (
        sessionId: string,
        menuId: string,
        shareMethod: string
    ): Promise<UserInteractionRecordResponse | null> => {
        try {
            logUserInteraction('공유 기록', { sessionId, menuId, shareMethod });
            return await RecommendationService.recordInteraction({
                session_id: sessionId,
                menu_id: menuId,
                interaction_type: INTERACTION.TYPES.SHARE,
                extra_data: { share_method: shareMethod },
            }) as UserInteractionRecordResponse;
        } catch (error) {
            logError(LogCategory.USER_INTERACTION, '공유 기록 에러', error as Error);
            return null;
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
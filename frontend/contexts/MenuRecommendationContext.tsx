import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { useUserInteraction } from './UserInteractionContext';
import { useCollaborativeRecommendations } from './CollaborativeContext';
import { useAuth } from './AuthContext';
import { CategoryService, Category } from '../services/categoryService';
import {
    RecommendationService,
    Menu,
    MenuRecommendation,
    ABTestInfo,
} from '../services/recommendationService';
import { AppError } from '../utils/apiClient';
import {
    getFavorites,
    addFavorite,
    removeFavorite,
} from '../services/favoriteService';
import { abTestInfoToCamel } from '../utils/case';
import { logRecommendation, logError, LogCategory } from '../utils/logger';

export type TimeSlot = 'breakfast' | 'lunch' | 'dinner';

interface MenuRecommendationContextType {
    selectedTimeSlot: TimeSlot;
    setSelectedTimeSlot: (timeSlot: TimeSlot) => void;
    categoryId: string | null;
    setCategoryId: (categoryId: string | null) => void;
    categories: Category[];
    recommendations: MenuRecommendation[];
    savedMenus: Menu[];
    loading: boolean;
    error: string | null;
    abTestInfo: ABTestInfo | null;
    sessionId: string;
    showCollaborative: boolean;
    setShowCollaborative: (show: boolean) => void;
    renderKey: number;
    getMenuRecommendations: () => Promise<MenuRecommendation[] | undefined>;
    getCollaborativeRecommendations: () => Promise<void>;
    removeMenuFromSaved: (menuToRemove: Menu) => Promise<void>;
    addMenuToSaved: (menuToAdd: Menu) => Promise<void>;
    handleMenuClick: (menu: Menu) => Promise<void>;
    fetchCategories: () => Promise<void>;
}

const MenuRecommendationContext = createContext<MenuRecommendationContextType | undefined>(undefined);

interface MenuRecommendationProviderProps {
    children: ReactNode;
}

export const MenuRecommendationProvider: React.FC<MenuRecommendationProviderProps> = ({ children }) => {
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('lunch');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([]);
    const [savedMenus, setSavedMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [abTestInfo, setAbTestInfo] = useState<ABTestInfo | null>(null);
    const [sessionId, setSessionId] = useState<string>('');
    const [showCollaborative, setShowCollaborative] = useState(false);
    const [renderKey, setRenderKey] = useState<number>(0);

    const { isLoggedIn } = useAuth();
    const { recordMenuClick, recordMenuFavorite, recordRecommendationSelect } = useUserInteraction();
    const { getCollaborativeRecommendations: fetchCollaborativeRecommendations } = useCollaborativeRecommendations();

    const fetchCategories = useCallback(async () => {
        try {
            const response = await CategoryService.getCategories(1, 50);
            setCategories(response.categories);
        } catch (err) {
            logError(LogCategory.RECOMMENDATION, '카테고리 조회 에러', err as Error);
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        // 세션 ID 생성
        setSessionId(
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
    }, [fetchCategories]);

    // 로그인 상태가 변경될 때마다 즐겨찾기 목록을 다시 불러옴
    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    const favs = await getFavorites();
                    setSavedMenus(favs);
                } catch (e) {
                    logError(LogCategory.RECOMMENDATION, '즐겨찾기 목록 불러오기 에러', e as Error);
                    setSavedMenus([]);
                }
            })();
        } else {
            setSavedMenus([]);
        }
    }, [isLoggedIn]);

    // 로그인 상태가 변경될 때 기존 추천 목록이 있으면 다시 불러와서 UI 업데이트
    useEffect(() => {
        if (recommendations.length > 0) {
            setRenderKey((prev) => prev + 1);
        }
    }, [isLoggedIn, recommendations]);

    const getMenuRecommendations = useCallback(async () => {
        setLoading(true);
        setError(null);
        setAbTestInfo(null);
        
        try {
            logRecommendation('메뉴 추천 요청', { timeSlot: selectedTimeSlot });
            const response = await RecommendationService.getSimpleRecommendations({
                time_slot: selectedTimeSlot,
                category_id: categoryId || undefined,
                session_id: sessionId,
            });
            logRecommendation('메뉴 추천 응답 수신', { count: response.recommendations.length });
            
            setRecommendations(response.recommendations);

            // A/B 테스트 정보 추출
            if (response.ab_test_info) {
                setAbTestInfo(abTestInfoToCamel(response.ab_test_info));
            }

            // 추천 선택 상호작용 기록
            for (const rec of response.recommendations) {
                await recordRecommendationSelect(
                    sessionId,
                    rec.menu.id,
                    'simple_personalized'
                );
            }

            return response.recommendations;
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '메뉴 추천을 가져오는데 실패했습니다';
            setError(errorMessage);
            logError(LogCategory.RECOMMENDATION, '메뉴 추천 에러', err as Error);
            return undefined;
        } finally {
            setLoading(false);
        }
    }, [selectedTimeSlot, categoryId, sessionId, recordRecommendationSelect]);

    const refreshRecommendations = useCallback(async () => {
        if (!selectedTimeSlot) return;
        
        setLoading(true);
        try {
            logRecommendation('메뉴 추천 새로고침', { timeSlot: selectedTimeSlot });
            const response = await RecommendationService.getSimpleRecommendations({
                time_slot: selectedTimeSlot,
                session_id: sessionId,
            });
            logRecommendation('메뉴 추천 새로고침 완료', { count: response.recommendations.length });
            
            setRecommendations(response.recommendations);
        } catch (error) {
            logError(LogCategory.RECOMMENDATION, '메뉴 추천 새로고침 에러', error as Error);
            setError('추천 메뉴를 새로고침하는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [sessionId, selectedTimeSlot]);

    const getCollaborativeRecommendations = useCallback(async () => {
        try {
            await fetchCollaborativeRecommendations(sessionId, 5);
        } catch (err) {
            logError(LogCategory.RECOMMENDATION, '협업 필터링 추천 에러', err as Error);
        }
    }, [sessionId, fetchCollaborativeRecommendations]);

    const removeMenuFromSaved = useCallback(async (menuToRemove: Menu) => {
        if (!isLoggedIn) {
            Alert.alert('로그인 필요', '즐겨찾기 기능을 사용하려면 로그인이 필요합니다.');
            return;
        }

        try {
            await removeFavorite(menuToRemove.id);
            setSavedMenus((prev) =>
                prev.filter((menu) => menu.id !== menuToRemove.id)
            );
            Alert.alert(
                '삭제',
                `${menuToRemove.name} 메뉴를 즐겨찾기에서 삭제했습니다.`
            );
        } catch (e) {
            logError(LogCategory.RECOMMENDATION, '즐겨찾기 삭제 에러', e as Error);
            Alert.alert('오류', '즐겨찾기 삭제에 실패했습니다.');
        }
        await recordMenuFavorite(sessionId, menuToRemove.id, false);
    }, [isLoggedIn, sessionId, recordMenuFavorite]);

    const addMenuToSaved = useCallback(async (menuToAdd: Menu) => {
        if (!isLoggedIn) {
            Alert.alert('로그인 필요', '즐겨찾기 기능을 사용하려면 로그인이 필요합니다.');
            return;
        }

        try {
            await addFavorite(menuToAdd.id);
            setSavedMenus((prev) => [...prev, menuToAdd]);
            Alert.alert(
                '저장',
                `${menuToAdd.name} 메뉴를 즐겨찾기에 추가했습니다.`
            );
        } catch (e) {
            console.error('즐겨찾기 추가 에러:', e);
            Alert.alert('오류', '즐겨찾기 추가에 실패했습니다.');
        }
        await recordMenuFavorite(sessionId, menuToAdd.id, true);
    }, [isLoggedIn, sessionId, recordMenuFavorite]);

    const handleMenuClick = useCallback(async (menu: Menu) => {
        await recordMenuClick(sessionId, menu.id, {
            time_slot: selectedTimeSlot,
            category_id: categoryId,
            source: 'menu_recommendations',
        });
    }, [sessionId, selectedTimeSlot, categoryId, recordMenuClick]);

    const value = {
        selectedTimeSlot,
        setSelectedTimeSlot,
        categoryId,
        setCategoryId,
        categories,
        recommendations,
        savedMenus,
        loading,
        error,
        abTestInfo,
        sessionId,
        showCollaborative,
        setShowCollaborative,
        renderKey,
        getMenuRecommendations,
        getCollaborativeRecommendations,
        removeMenuFromSaved,
        addMenuToSaved,
        handleMenuClick,
        fetchCategories,
    };

    return (
        <MenuRecommendationContext.Provider value={value}>
            {children}
        </MenuRecommendationContext.Provider>
    );
};

export const useMenuRecommendations = (): MenuRecommendationContextType => {
    const context = useContext(MenuRecommendationContext);
    if (context === undefined) {
        throw new Error('useMenuRecommendations must be used within a MenuRecommendationProvider');
    }
    return context;
}; 
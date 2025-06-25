import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useUserInteraction } from './useUserInteraction';
import { useCollaborativeRecommendations } from './useCollaborativeRecommendations';
import { useAuth } from './useAuth';
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

export type TimeSlot = 'breakfast' | 'lunch' | 'dinner';

export function useMenuRecommendations() {
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('lunch');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recommendations, setRecommendations] = useState<
        MenuRecommendation[]
    >([]);
    const [savedMenus, setSavedMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [abTestInfo, setAbTestInfo] = useState<ABTestInfo | null>(null);
    const [sessionId, setSessionId] = useState<string>('');
    const [showCollaborative, setShowCollaborative] = useState(false);

    const { isLoggedIn } = useAuth();

    const { recordMenuClick, recordMenuFavorite, recordRecommendationSelect } =
        useUserInteraction();
    const {
        recommendations: collaborativeRecs,
        loading: collaborativeLoading,
        getCollaborativeRecommendations: fetchCollaborativeRecommendations,
    } = useCollaborativeRecommendations();

    useEffect(() => {
        fetchCategories();
        // 세션 ID 생성
        setSessionId(
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
    }, []);

    // 로그인 상태가 변경될 때마다 즐겨찾기 목록을 다시 불러옴
    useEffect(() => {
        if (isLoggedIn) {
            // 로그인된 상태에서만 즐겨찾기 목록 불러오기
            (async () => {
                try {
                    const favs = await getFavorites();
                    setSavedMenus(favs);
                } catch (e) {
                    console.error('즐겨찾기 목록 불러오기 에러:', e);
                    setSavedMenus([]);
                }
            })();
        } else {
            // 로그아웃 상태에서는 즐겨찾기 목록 초기화
            setSavedMenus([]);
        }
    }, [isLoggedIn]);

    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getCategories(1, 50);
            setCategories(response.categories);
        } catch (err) {
            console.error('카테고리 조회 에러:', err);
            setCategories([]);
        }
    };

    const getMenuRecommendations = async () => {
        setLoading(true);
        setError(null);
        setAbTestInfo(null);

        try {
            const response =
                await RecommendationService.getSimpleRecommendations({
                    time_slot: selectedTimeSlot,
                    category_id: categoryId || undefined,
                    session_id: sessionId,
                });

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
            console.error('API 에러:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getCollaborativeRecommendations = async () => {
        setShowCollaborative(true);
        await fetchCollaborativeRecommendations(sessionId, 5);
    };

    const removeMenuFromSaved = async (menuToRemove: Menu) => {
        if (!isLoggedIn) {
            Alert.alert(
                '로그인 필요',
                '즐겨찾기 기능을 사용하려면 로그인이 필요합니다.'
            );
            return;
        }

        try {
            await removeFavorite(menuToRemove.id);
            setSavedMenus(
                savedMenus.filter((menu) => menu.id !== menuToRemove.id)
            );
            Alert.alert(
                '취소',
                `${menuToRemove.name} 메뉴를 즐겨찾기에서 제거했습니다.`
            );
        } catch (e) {
            console.error('즐겨찾기 해제 에러:', e);
            Alert.alert('오류', '즐겨찾기 해제에 실패했습니다.');
        }
        // 즐겨찾기 취소 상호작용 기록
        await recordMenuFavorite(sessionId, menuToRemove.id, false);
    };

    const addMenuToSaved = async (menuToAdd: Menu) => {
        if (!isLoggedIn) {
            Alert.alert(
                '로그인 필요',
                '즐겨찾기 기능을 사용하려면 로그인이 필요합니다.'
            );
            return;
        }

        try {
            await addFavorite(menuToAdd.id);
            setSavedMenus([...savedMenus, menuToAdd]);
            Alert.alert(
                '저장',
                `${menuToAdd.name} 메뉴를 즐겨찾기에 추가했습니다.`
            );
        } catch (e) {
            console.error('즐겨찾기 추가 에러:', e);
            Alert.alert('오류', '즐겨찾기 추가에 실패했습니다.');
        }
        await recordMenuFavorite(sessionId, menuToAdd.id, true);
    };

    const handleMenuClick = async (menu: Menu) => {
        await recordMenuClick(sessionId, menu.id, {
            time_slot: selectedTimeSlot,
            category_id: categoryId,
            source: 'menu_recommendations',
        });
    };

    return {
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
        collaborativeRecs,
        collaborativeLoading,
        getMenuRecommendations,
        getCollaborativeRecommendations,
        removeMenuFromSaved,
        addMenuToSaved,
        handleMenuClick,
    };
}

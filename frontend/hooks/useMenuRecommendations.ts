import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useUserInteraction } from './useUserInteraction';
import { useCollaborativeRecommendations } from './useCollaborativeRecommendations';
import { CategoryService, Category } from '../services/categoryService';
import {
    RecommendationService,
    Menu,
    MenuRecommendation,
    ABTestInfo,
} from '../services/recommendationService';
import { AppError } from '../utils/apiClient';
import { getFavorites, addFavorite, removeFavorite } from '../services/favoriteService';

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
        // 즐겨찾기 목록 불러오기
        (async () => {
            try {
                const favs = await getFavorites();
                setSavedMenus(favs);
            } catch (e) {
                setSavedMenus([]);
            }
        })();
    }, []);

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
                setAbTestInfo(response.ab_test_info);
            }

            // 추천 선택 상호작용 기록
            for (const rec of response.recommendations) {
                await recordRecommendationSelect(
                    sessionId,
                    rec.menu.id.toString(),
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

    const addMenuToSaved = async (menuToAdd: Menu) => {
        if (savedMenus.some((menu) => menu.id === menuToAdd.id)) {
            Alert.alert('알림', '이미 추가된 메뉴입니다.');
        } else {
            try {
                await addFavorite(menuToAdd.id);
                setSavedMenus([...savedMenus, menuToAdd]);
                Alert.alert('성공', `${menuToAdd.name} 메뉴를 즐겨찾기에 추가했습니다.`);
            } catch (e) {
                Alert.alert('오류', '즐겨찾기 추가에 실패했습니다.');
            }
            // 즐겨찾기 상호작용 기록
            await recordMenuFavorite(sessionId, menuToAdd.id.toString(), true);
        }
    };

    const removeMenuFromSaved = async (menuToRemove: Menu) => {
        try {
            await removeFavorite(menuToRemove.id);
            setSavedMenus(savedMenus.filter((menu) => menu.id !== menuToRemove.id));
            Alert.alert('취소', `${menuToRemove.name} 메뉴를 즐겨찾기에서 제거했습니다.`);
        } catch (e) {
            Alert.alert('오류', '즐겨찾기 해제에 실패했습니다.');
        }
        // 즐겨찾기 취소 상호작용 기록
        await recordMenuFavorite(sessionId, menuToRemove.id.toString(), false);
    };

    const handleMenuClick = async (menu: Menu) => {
        await recordMenuClick(sessionId, menu.id.toString(), {
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
        addMenuToSaved,
        removeMenuFromSaved,
        handleMenuClick,
    };
}

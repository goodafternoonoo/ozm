import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { useUserInteraction } from './useUserInteraction';
import { useCollaborativeRecommendations } from './useCollaborativeRecommendations';

export type Menu = {
    id: number;
    name: string;
    description: string;
    category: string;
    rating: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
};

export type MenuRecommendation = {
    menu: Menu;
    score: number;
    reason: string;
};

export type TimeSlot = 'breakfast' | 'lunch' | 'dinner';

export type Category = {
    id: string;
    name: string;
    cuisine_type?: string;
    description?: string;
    icon_url?: string;
    color_code?: string;
};

export type ABTestInfo = {
    abGroup: string;
    weightSet: Record<string, number>;
    recommendationType: string;
};

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
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/v1/categories?page=1&size=50'
            );
            const cats = response.data?.data?.categories || [];
            setCategories(cats);
        } catch (err) {
            setCategories([]);
        }
    };

    const getMenuRecommendations = async () => {
        setLoading(true);
        setError(null);
        setAbTestInfo(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/v1/recommendations/simple',
                {
                    time_slot: selectedTimeSlot,
                    category_id: categoryId || undefined,
                    session_id: sessionId,
                }
            );

            const recs = response.data?.data?.recommendations || [];
            setRecommendations(recs);

            // A/B 테스트 정보 추출
            if (response.data?.data?.ab_test_info) {
                const info = response.data.data.ab_test_info;
                setAbTestInfo({
                    abGroup: info.ab_group,
                    weightSet: info.weight_set ?? {},
                    recommendationType: info.recommendation_type,
                });
            }

            // 추천 선택 상호작용 기록
            for (const rec of recs) {
                await recordRecommendationSelect(
                    sessionId,
                    rec.menu.id.toString(),
                    'simple_personalized'
                );
            }

            return recs;
        } catch (err) {
            setError('메뉴 추천을 가져오는데 실패했습니다');
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
            setSavedMenus([...savedMenus, menuToAdd]);
            Alert.alert('성공', `${menuToAdd.name} 메뉴를 추가했습니다.`);

            // 즐겨찾기 상호작용 기록
            await recordMenuFavorite(sessionId, menuToAdd.id.toString(), true);
        }
    };

    const removeMenuFromSaved = async (menuToRemove: Menu) => {
        setSavedMenus(savedMenus.filter((menu) => menu.id !== menuToRemove.id));
        Alert.alert(
            '취소',
            `${menuToRemove.name} 메뉴를 목록에서 제거했습니다.`
        );

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

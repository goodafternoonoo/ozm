import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

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

export function useMenuRecommendations() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('lunch');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([]);
  const [savedMenus, setSavedMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/categories?page=1&size=50');
      setCategories(response.data.categories || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const getMenuRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/recommendations/simple', {
        time_slot: selectedTimeSlot,
        category_id: categoryId || undefined,
      });
      // 응답 구조: { success, data: { recommendations, ... }, error }
      const recs = response.data?.data?.recommendations || [];
      setRecommendations(recs);
    } catch (err) {
      setError('메뉴 추천을 가져오는데 실패했습니다');
      console.error('API 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMenuToSaved = (menuToAdd: Menu) => {
    if (savedMenus.some(menu => menu.id === menuToAdd.id)) {
      Alert.alert('알림', '이미 추가된 메뉴입니다.');
    } else {
      setSavedMenus([...savedMenus, menuToAdd]);
      Alert.alert('성공', `${menuToAdd.name} 메뉴를 추가했습니다.`);
    }
  };

  const removeMenuFromSaved = (menuToRemove: Menu) => {
    setSavedMenus(savedMenus.filter(menu => menu.id !== menuToRemove.id));
    Alert.alert('취소', `${menuToRemove.name} 메뉴를 목록에서 제거했습니다.`);
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
    getMenuRecommendations,
    addMenuToSaved,
    removeMenuFromSaved,
  };
} 
import axios from 'axios';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';

type Menu = {
  id: number;
  name: string;
  description: string;
  category: string;
  rating: number;
};

type MenuRecommendation = {
  menu: Menu;
  score: number;
  reason: string;
};

type TimeSlot = 'breakfast' | 'lunch' | 'dinner';

export default function MenuRecommendationScreen() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('lunch');
  const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([]);
  const [savedMenus, setSavedMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlotOptions = [
    { value: 'breakfast' as TimeSlot, label: '아침', icon: 'sunny-outline' },
    { value: 'lunch' as TimeSlot, label: '점심', icon: 'restaurant-outline' },
    { value: 'dinner' as TimeSlot, label: '저녁', icon: 'moon-outline' }
  ];

  const getMenuRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 백엔드 API 호출
      const response = await axios.post('http://localhost:8000/api/v1/recommendations/simple', {
        time_slot: selectedTimeSlot
      });
      
      setRecommendations(response.data.recommendations || []);
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#FFD700" : "#C7C7CC"}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={MenuRecommendationStyles.container}>
      <View style={MenuRecommendationStyles.header}>
        <Text style={MenuRecommendationStyles.title}>메뉴 추천</Text>
        <Text style={MenuRecommendationStyles.subtitle}>시간대를 선택하고 추천받아보세요!</Text>
      </View>

      <View style={MenuRecommendationStyles.inputContainer}>
        <Text style={MenuRecommendationStyles.sectionTitle}>시간대 선택</Text>
        <View style={MenuRecommendationStyles.timeSlotContainer}>
          {timeSlotOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                MenuRecommendationStyles.timeSlotButton,
                selectedTimeSlot === option.value && MenuRecommendationStyles.timeSlotButtonActive
              ]}
              onPress={() => setSelectedTimeSlot(option.value)}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={selectedTimeSlot === option.value ? '#fff' : '#007AFF'}
              />
              <Text style={[
                MenuRecommendationStyles.timeSlotText,
                selectedTimeSlot === option.value && MenuRecommendationStyles.timeSlotTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={getMenuRecommendations}
          style={MenuRecommendationStyles.button}
          disabled={loading}
        >
          <Text style={MenuRecommendationStyles.buttonText}>
            {loading ? '추천 중...' : `${timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label} 메뉴 추천받기`}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={MenuRecommendationStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={MenuRecommendationStyles.loadingText}>맛있는 메뉴를 찾고 있어요...</Text>
        </View>
      )}
      
      {error && (
        <View style={MenuRecommendationStyles.errorContainer}>
          <Text style={MenuRecommendationStyles.errorText}>{error}</Text>
        </View>
      )}
      
      {savedMenus.length > 0 && (
        <View style={MenuRecommendationStyles.recommendationsContainer}>
          <Text style={MenuRecommendationStyles.recommendationsTitle}>내가 선택한 메뉴</Text>
          {savedMenus.map((menu) => (
            <View key={menu.id} style={MenuRecommendationStyles.menuCard}>
              <View style={MenuRecommendationStyles.menuHeader}>
                <Text style={MenuRecommendationStyles.menuName}>{menu.name}</Text>
                <View style={MenuRecommendationStyles.ratingContainer}>
                  {renderStars(menu.rating)}
                  <Text style={MenuRecommendationStyles.ratingText}>{menu.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={MenuRecommendationStyles.menuDescription}>{menu.description}</Text>
              <View style={MenuRecommendationStyles.categoryContainer}>
                <Text style={MenuRecommendationStyles.categoryText}>{menu.category}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={MenuRecommendationStyles.recommendationsContainer}>
          <Text style={MenuRecommendationStyles.recommendationsTitle}>추천 메뉴</Text>
          {recommendations.map(({ menu, reason }) => (
            <View key={menu.id} style={MenuRecommendationStyles.menuCard}>
              <View style={MenuRecommendationStyles.reasonContainer}>
                <Ionicons name="sparkles-outline" size={16} color="#007AFF" />
                <Text style={MenuRecommendationStyles.reasonText}>{reason}</Text>
              </View>
              <View style={MenuRecommendationStyles.menuHeader}>
                <Text style={MenuRecommendationStyles.menuName}>{menu.name}</Text>
                <View style={MenuRecommendationStyles.ratingContainer}>
                  {renderStars(menu.rating)}
                  <Text style={MenuRecommendationStyles.ratingText}>{menu.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={MenuRecommendationStyles.menuDescription}>{menu.description}</Text>
              <View style={MenuRecommendationStyles.cardFooter}>
                <View style={MenuRecommendationStyles.categoryContainer}>
                  <Text style={MenuRecommendationStyles.categoryText}>{menu.category}</Text>
                </View>
                <TouchableOpacity
                  style={MenuRecommendationStyles.addButton}
                  onPress={() => addMenuToSaved(menu)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={MenuRecommendationStyles.addButtonText}>메뉴 추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

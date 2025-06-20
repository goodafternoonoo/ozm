import axios from 'axios';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput, 
  ScrollView, 
  StyleSheet,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MenuRecommendation = {
  id: number;
  name: string;
  description: string;
  category: string;
  rating: number;
};

type TimeSlot = 'breakfast' | 'lunch' | 'dinner';

export default function MenuRecommendationScreen() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('lunch');
  const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([]);
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
      
      // 임시 더미 데이터 (API 연결 전용)
      setRecommendations([
        {
          id: 1,
          name: "김치찌개",
          description: "매콤한 김치와 돼지고기로 만든 한국의 대표적인 찌개 요리",
          category: "한식",
          rating: 4.5
        },
        {
          id: 2,
          name: "파스타 카르보나라",
          description: "계란 노른자와 파마산 치즈로 만든 크림소스 파스타",
          category: "양식",
          rating: 4.3
        },
        {
          id: 3,
          name: "초밥 세트",
          description: "신선한 생선으로 만든 일본 전통 초밥",
          category: "일식",
          rating: 4.7
        }
      ]);
    } finally {
      setLoading(false);
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>메뉴 추천</Text>
        <Text style={styles.subtitle}>시간대를 선택하고 추천받아보세요!</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>시간대 선택</Text>
        <View style={styles.timeSlotContainer}>
          {timeSlotOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeSlotButton,
                selectedTimeSlot === option.value && styles.timeSlotButtonActive
              ]}
              onPress={() => setSelectedTimeSlot(option.value)}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={selectedTimeSlot === option.value ? '#fff' : '#007AFF'}
              />
              <Text style={[
                styles.timeSlotText,
                selectedTimeSlot === option.value && styles.timeSlotTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={getMenuRecommendations}
          style={styles.button}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '추천 중...' : `${timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label} 메뉴 추천받기`}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>맛있는 메뉴를 찾고 있어요...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>추천 메뉴</Text>
          {recommendations.map((menu) => (
            <View key={menu.id} style={styles.menuCard}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuName}>{menu.name}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(menu.rating)}
                  <Text style={styles.ratingText}>{menu.rating}</Text>
                </View>
              </View>
              <Text style={styles.menuDescription}>{menu.description}</Text>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{menu.category}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeSlotButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginHorizontal: 5,
  },
  timeSlotButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFE5E5',
    margin: 20,
    borderRadius: 12,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  recommendationsContainer: {
    padding: 20,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8E8E93',
  },
  menuDescription: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 10,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: '#8E8E93',
  },
});

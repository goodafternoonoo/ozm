import axios from 'axios';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';
import { MenuCard, Menu } from '../components/MenuCard';
import { useMenuRecommendations, TimeSlot } from '../hooks/useMenuRecommendations';
import { useQuizRecommendation } from '../hooks/useQuizRecommendation';

type MenuRecommendation = {
  menu: Menu;
  score: number;
  reason: string;
};

export default function MenuRecommendationScreen() {
  const [mode, setMode] = useState<'simple' | 'quiz'>('simple');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const {
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
  } = useMenuRecommendations();
  const quiz = useQuizRecommendation();

  const timeSlotOptions = [
    { value: 'breakfast' as TimeSlot, label: '아침', icon: 'sunny-outline' },
    { value: 'lunch' as TimeSlot, label: '점심', icon: 'restaurant-outline' },
    { value: 'dinner' as TimeSlot, label: '저녁', icon: 'moon-outline' }
  ];

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

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 12, backgroundColor: mode === 'simple' ? '#007AFF' : '#E5E5EA', borderRadius: 8, marginRight: 4 }}
          onPress={() => setMode('simple')}
        >
          <Text style={{ color: mode === 'simple' ? '#fff' : '#1C1C1E', textAlign: 'center', fontWeight: 'bold' }}>간단 추천</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, padding: 12, backgroundColor: mode === 'quiz' ? '#007AFF' : '#E5E5EA', borderRadius: 8, marginLeft: 4 }}
          onPress={() => setMode('quiz')}
        >
          <Text style={{ color: mode === 'quiz' ? '#fff' : '#1C1C1E', textAlign: 'center', fontWeight: 'bold' }}>퀴즈 추천</Text>
        </TouchableOpacity>
      </View>

      {mode === 'simple' ? (
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

          <Text style={[MenuRecommendationStyles.sectionTitle, { marginTop: 20 }]}>카테고리 선택</Text>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: '#E5E5EA',
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
                alignItems: 'center',
              }}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>
                {categoryId
                  ? categories.find((cat) => cat.id === categoryId)?.name
                  : '카테고리 선택'}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={categoryModalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setCategoryModalVisible(false)}
            >
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  width: '85%',
                  maxHeight: '70%',
                  elevation: 8,
                  shadowColor: 'transparent',
                }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>카테고리 선택</Text>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          paddingVertical: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                        onPress={() => {
                          setCategoryId(item.id);
                          setCategoryModalVisible(false);
                        }}
                      >
                        <Text style={{
                          color: categoryId === item.id ? '#007AFF' : '#1C1C1E',
                          fontWeight: categoryId === item.id ? 'bold' : 'normal',
                          fontSize: 16,
                          textAlign: 'center',
                        }}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={{
                      marginTop: 16,
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: '#E5E5EA',
                    }}
                    onPress={() => setCategoryModalVisible(false)}
                  >
                    <Text style={{ color: '#1C1C1E', fontWeight: 'bold' }}>닫기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
      ) : (
        <View style={{ marginTop: 8 }}>
          {quiz.loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />}
          {quiz.error && <Text style={{ color: 'red', marginBottom: 8 }}>{quiz.error}</Text>}
          {quiz.questions.length > 0 && (
            <>
              {quiz.questions.map((q, idx) => (
                <View key={q.id} style={{ marginBottom: 18 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{idx + 1}. {q.text}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {q.options.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={{
                          backgroundColor: quiz.answers[q.id] === opt ? '#007AFF' : '#E5E5EA',
                          borderRadius: 20,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                        onPress={() => quiz.setAnswer(q.id, opt)}
                      >
                        <Text style={{ color: quiz.answers[q.id] === opt ? '#fff' : '#1C1C1E', fontWeight: '500' }}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={quiz.getQuizRecommendations}
                style={{ backgroundColor: '#007AFF', borderRadius: 8, padding: 14, marginTop: 8, marginBottom: 16 }}
                disabled={quiz.loading || Object.keys(quiz.answers).length < quiz.questions.length}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>퀴즈 기반 추천받기</Text>
              </TouchableOpacity>
            </>
          )}
          {quiz.recommendations.length > 0 && (
            <View style={MenuRecommendationStyles.recommendationsContainer}>
              <Text style={MenuRecommendationStyles.recommendationsTitle}>추천 메뉴</Text>
              {quiz.recommendations.map(({ menu, reason }) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  reason={reason}
                  onAdd={addMenuToSaved}
                  isSaved={savedMenus.some((m) => m.id === menu.id)}
                />
              ))}
            </View>
          )}
        </View>
      )}

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
            <MenuCard key={menu.id} menu={menu} isSaved onRemove={removeMenuFromSaved} />
          ))}
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={MenuRecommendationStyles.recommendationsContainer}>
          <Text style={MenuRecommendationStyles.recommendationsTitle}>추천 메뉴</Text>
          {recommendations.map(({ menu, reason }) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              reason={reason}
              onAdd={addMenuToSaved}
              isSaved={savedMenus.some((m) => m.id === menu.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

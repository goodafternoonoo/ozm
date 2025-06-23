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
import QuizRecommendation from '../components/QuizRecommendation';

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

      <View style={MenuRecommendationStyles.modeSwitchContainer}>
        <TouchableOpacity
          style={[MenuRecommendationStyles.modeButton, mode === 'simple' && MenuRecommendationStyles.modeButtonActive]}
          onPress={() => setMode('simple')}
        >
          <Text style={MenuRecommendationStyles.modeButtonText}>간단 추천</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[MenuRecommendationStyles.modeButton, mode === 'quiz' && MenuRecommendationStyles.modeButtonActive]}
          onPress={() => setMode('quiz')}
        >
          <Text style={MenuRecommendationStyles.modeButtonText}>퀴즈 추천</Text>
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
              style={MenuRecommendationStyles.categoryModalButton}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={[MenuRecommendationStyles.categoryModalItemText, categoryId && MenuRecommendationStyles.categoryModalItemTextActive]}>
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
              <View style={MenuRecommendationStyles.categoryModalOverlay}>
                <View style={MenuRecommendationStyles.categoryModalContent}>
                  <Text style={MenuRecommendationStyles.categoryModalTitle}>카테고리 선택</Text>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={MenuRecommendationStyles.categoryModalItem}
                        onPress={() => {
                          setCategoryId(item.id);
                          setCategoryModalVisible(false);
                        }}
                      >
                        <Text style={[MenuRecommendationStyles.categoryModalItemText, categoryId === item.id && MenuRecommendationStyles.categoryModalItemTextActive]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={MenuRecommendationStyles.categoryModalCloseButton}
                    onPress={() => setCategoryModalVisible(false)}
                  >
                    <Text style={MenuRecommendationStyles.categoryModalCloseButtonText}>닫기</Text>
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
            <QuizRecommendation
              questions={quiz.questions}
              onSubmit={(answers) => {
                Object.entries(answers).forEach(([qid, ans]) => quiz.setAnswer(qid, ans));
                quiz.getQuizRecommendations();
              }}
            />
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

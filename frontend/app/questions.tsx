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
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Question = {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
  category?: string;
};

export default function QuestionsScreen() {
  const [userQuestion, setUserQuestion] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuestion = async () => {
    if (!userQuestion.trim()) {
      Alert.alert('알림', '질문을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // 백엔드 API 호출 (실제 API 엔드포인트로 변경 필요)
      const response = await axios.post('http://localhost:8000/api/v1/questions/', {
        question: userQuestion
      });
      
      const newQuestion: Question = {
        id: Date.now(),
        question: userQuestion,
        answer: response.data.answer || '답변을 준비 중입니다...',
        timestamp: new Date().toLocaleString('ko-KR'),
        category: response.data.category
      };
      
      setQuestions([newQuestion, ...questions]);
      setUserQuestion('');
    } catch (err) {
      setError('질문을 전송하는데 실패했습니다');
      console.error('API 에러:', err);
      
      // 임시 더미 데이터 (API 연결 전용)
      const dummyAnswer = getDummyAnswer(userQuestion);
      const newQuestion: Question = {
        id: Date.now(),
        question: userQuestion,
        answer: dummyAnswer,
        timestamp: new Date().toLocaleString('ko-KR'),
        category: '일반'
      };
      
      setQuestions([newQuestion, ...questions]);
      setUserQuestion('');
    } finally {
      setLoading(false);
    }
  };

  const getDummyAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('메뉴') || lowerQuestion.includes('음식')) {
      return '메뉴 추천 페이지에서 다양한 음식을 추천받을 수 있습니다. 원하는 요리 스타일이나 재료를 말씀해주세요!';
    } else if (lowerQuestion.includes('영양') || lowerQuestion.includes('건강')) {
      return '건강한 식단을 위해서는 균형 잡힌 영양소 섭취가 중요합니다. 단백질, 탄수화물, 지방을 적절히 조합하시는 것을 추천드립니다.';
    } else if (lowerQuestion.includes('레시피') || lowerQuestion.includes('조리법')) {
      return '레시피는 각 메뉴의 상세 페이지에서 확인할 수 있습니다. 단계별 조리법과 필요한 재료를 제공해드립니다.';
    } else {
      return '좋은 질문이네요! 더 구체적인 내용을 알려주시면 더 정확한 답변을 드릴 수 있습니다.';
    }
  };

  const clearAllQuestions = () => {
    Alert.alert(
      '질문 기록 삭제',
      '모든 질문 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => setQuestions([])
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>질문답변</Text>
          <Text style={styles.subtitle}>음식에 대한 궁금한 점을 물어보세요!</Text>
          {questions.length > 0 && (
            <TouchableOpacity onPress={clearAllQuestions} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.clearButtonText}>기록 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="예: 김치찌개 만드는 방법이 궁금해요, 건강한 아침 식사 추천해주세요..."
            value={userQuestion}
            onChangeText={setUserQuestion}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity 
            onPress={submitQuestion}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '답변 중...' : '질문하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>답변을 준비하고 있어요...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {questions.length > 0 && (
          <View style={styles.questionsContainer}>
            <Text style={styles.questionsTitle}>질문 기록</Text>
            {questions.map((item) => (
              <View key={item.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.questionLabel}>질문</Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                <Text style={styles.questionText}>{item.question}</Text>
                
                <View style={styles.answerSection}>
                  <View style={styles.answerHeader}>
                    <Ionicons name="chatbubble-outline" size={20} color="#34C759" />
                    <Text style={styles.answerLabel}>답변</Text>
                    {item.category && (
                      <View style={styles.categoryContainer}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {questions.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#C7C7CC" />
            <Text style={styles.emptyText}>아직 질문이 없습니다</Text>
            <Text style={styles.emptySubtext}>음식에 대한 궁금한 점을 물어보세요!</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 4,
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
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
  questionsContainer: {
    padding: 20,
  },
  questionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 'auto',
  },
  questionText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 15,
    paddingLeft: 28,
  },
  answerSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 15,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 8,
  },
  categoryContainer: {
    marginLeft: 'auto',
  },
  categoryText: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: '#8E8E93',
  },
  answerText: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 22,
    paddingLeft: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 5,
    textAlign: 'center',
  },
}); 
import { useState } from 'react';
import { QuestionService, ChujonQuestion } from '../services/questionService';
import { RecommendationService, Menu } from '../services/recommendationService';
import { useUserInteraction } from './useUserInteraction';

export interface ChujonRecommendation {
  menu: Menu;
  reason: string;
  score: number;
}

export type ChujonAnswers = { [questionId: string]: string };

export function useChujonRecommendation() {
  const [questions, setQuestions] = useState<ChujonQuestion[]>([]);
  const [answers, setAnswers] = useState<ChujonAnswers>({});
  const [recommendations, setRecommendations] = useState<ChujonRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abTestInfo, setAbTestInfo] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const { recordRecommendationSelect } = useUserInteraction();

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 임시로 샘플 질문 데이터 사용 (백엔드 연결 전까지)
      const sampleQuestions = [
        {
          id: '1',
          text: '어떤 맛을 선호하시나요?',
          options: ['매운맛', '달콤한맛', '고소한맛', '신맛'],
          category: 'taste',
          weight: 1.0
        },
        {
          id: '2',
          text: '어떤 음식을 좋아하시나요?',
          options: ['한식', '중식', '일식', '양식'],
          category: 'cuisine',
          weight: 0.8
        },
        {
          id: '3',
          text: '건강을 고려한 식사를 원하시나요?',
          options: ['네', '아니오'],
          category: 'health',
          weight: 0.6
        }
      ];
      
      setQuestions(sampleQuestions);
      
      // 실제 API 호출 (백엔드 준비되면 주석 해제)
      // const questionsData = await QuestionService.getQuestions();
      // setQuestions(questionsData);
    } catch (err) {
      setError('질문을 불러오는데 실패했습니다.');
      console.error('질문 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const getChujonRecommendations = async () => {
    if (Object.keys(answers).length === 0) {
      setError('질문에 답변해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 임시로 샘플 추천 결과 사용 (백엔드 연결 전까지)
      const sampleRecommendations = [
        {
          menu: {
            id: 1,
            name: '김치볶음밥',
            description: '매콤한 김치와 함께 볶은 맛있는 볶음밥',
            category: '한식',
            rating: 4.5,
            image_url: 'https://example.com/kimchi-fried-rice.jpg',
            cooking_time: 15,
            difficulty: '쉬움',
            calories: 350,
            protein: 12,
            carbs: 45,
            fat: 8,
            spicy_level: 3,
            is_healthy: true,
            is_vegetarian: false,
            tags: ['매운맛', '한식', '볶음밥']
          },
          reason: '매운맛을 선호하시고 한식을 좋아하시는 분께 추천합니다.',
          score: 0.92
        },
        {
          menu: {
            id: 2,
            name: '마파두부',
            description: '매콤달콤한 마파두부',
            category: '중식',
            rating: 4.3,
            image_url: 'https://example.com/mapo-tofu.jpg',
            cooking_time: 20,
            difficulty: '보통',
            calories: 280,
            protein: 15,
            carbs: 25,
            fat: 12,
            spicy_level: 4,
            is_healthy: true,
            is_vegetarian: true,
            tags: ['매운맛', '중식', '두부']
          },
          reason: '매운맛과 건강식을 원하시는 분께 적합합니다.',
          score: 0.88
        }
      ];

      setRecommendations(sampleRecommendations);
      setAbTestInfo({
        abGroup: 'A',
        weightSet: { spicy: 0.8, healthy: 0.6 },
        recommendationType: 'chujon'
      });
      setSessionId(`session_${Date.now()}`);

      // 실제 API 호출 (백엔드 준비되면 주석 해제)
      // const response = await RecommendationService.getChujonRecommendations({
      //   answers,
      //   timeSlot: 'lunch'
      // });
      // setRecommendations(response.recommendations);
      // setAbTestInfo(response.ab_test_info);
      // setSessionId(response.session_id || '');
    } catch (err) {
      setError('추천을 가져오는데 실패했습니다.');
      console.error('취존 추천 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectRecommendation = async (menuId: string) => {
    try {
      await recordRecommendationSelect(sessionId, menuId, 'chujon_hybrid');
    } catch (err) {
      console.error('추천 선택 기록 에러:', err);
    }
  };

  return {
    questions,
    answers,
    recommendations,
    loading,
    error,
    abTestInfo,
    sessionId,
    loadQuestions,
    setAnswer,
    getChujonRecommendations,
    selectRecommendation,
  };
}

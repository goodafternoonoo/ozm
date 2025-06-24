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
      const questionsData = await QuestionService.getQuestions();
      setQuestions(questionsData);
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

      const response = await RecommendationService.getChujonRecommendations({
        answers,
        timeSlot: 'lunch' // 기본값으로 점심 설정
      });

      setRecommendations(response.recommendations);
      setAbTestInfo(response.ab_test_info);
      setSessionId(response.session_id || '');
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

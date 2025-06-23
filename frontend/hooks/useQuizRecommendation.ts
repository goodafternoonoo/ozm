import { useState, useEffect } from 'react';
import axios from 'axios';

export type QuizQuestion = {
  id: string;
  text: string;
  order: number;
  options: string[];
  category: string;
};

export type QuizAnswers = { [questionId: string]: string };

export type Menu = {
  id: number;
  name: string;
  description: string;
  category: string;
  rating: number;
};

export type MenuRecommendation = {
  menu: Menu;
  score: number;
  reason: string;
};

export function useQuizRecommendation() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/questions/');
      setQuestions(response.data || []);
    } catch (err) {
      setError('질문을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getQuizRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/recommendations/quiz', {
        answers,
      });
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError('추천을 가져오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    answers,
    setAnswer,
    loading,
    error,
    recommendations,
    getQuizRecommendations,
  };
} 
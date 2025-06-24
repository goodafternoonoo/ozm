import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChujonQuestion {
  id: string;
  text: string;
  options: string[];
  category: string;
  weight: number;
}

interface ChujonRecommendationProps {
  questions: ChujonQuestion[];
  onSubmit: () => void;
}

const ChujonRecommendation: React.FC<ChujonRecommendationProps> = ({ questions, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onSubmit();
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text>질문을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity onPress={goBack} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>
        {currentQuestion.text}
      </Text>

      <ScrollView style={{ flex: 1 }}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              alignItems: 'center'
            }}
            onPress={() => handleAnswer(option)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>취존 기반 추천받기</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ChujonRecommendation; 
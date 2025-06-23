import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

interface QuizRecommendationProps {
  questions: QuizQuestion[];
  onSubmit: (answers: { [id: string]: string }) => void;
}

const QuizRecommendation: React.FC<QuizRecommendationProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});

  const handleSelect = (qid: string, opt: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      {questions.map((q, idx) => (
        <View key={q.id} style={{ marginBottom: 18 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{idx + 1}. {q.text}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {q.options.map((opt: string) => (
              <TouchableOpacity
                key={opt}
                style={{
                  backgroundColor: answers[q.id] === opt ? '#007AFF' : '#E5E5EA',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                }}
                onPress={() => handleSelect(q.id, opt)}
              >
                <Text style={{
                  color: answers[q.id] === opt ? '#fff' : '#1C1C1E',
                  fontWeight: '500',
                }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#007AFF',
          borderRadius: 8,
          padding: 14,
          marginTop: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
        disabled={Object.keys(answers).length < questions.length}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>퀴즈 기반 추천받기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default QuizRecommendation; 
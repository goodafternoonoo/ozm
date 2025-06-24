import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../styles/GlobalStyles';

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
  onAnswerChange?: (questionId: string, answer: string) => void;
}

const ChujonRecommendation: React.FC<ChujonRecommendationProps> = ({ 
  questions, 
  onSubmit, 
  onAnswerChange 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer
    };
    setAnswers(newAnswers);
    
    // 부모 컴포넌트에 답변 변경 알림
    if (onAnswerChange) {
      onAnswerChange(currentQuestion.id, answer);
    }

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>질문을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <Text style={styles.questionText}>
        {currentQuestion.text}
      </Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = answers[currentQuestion.id] === option;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected
              ]}
              onPress={() => handleAnswer(option)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]}>
                {option}
              </Text>
              {isSelected && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={colors.primary} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    ...typography.body2,
    color: colors.text.secondary,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    flex: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  questionText: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonSelected: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  optionText: {
    ...typography.button,
    color: colors.text.primary,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
});

export default ChujonRecommendation; 
import React from 'react';
import { View, Text } from 'react-native';
import { QuestionsStyles } from '../styles/QuestionsStyles';

interface QuestionBubbleProps {
  text: string;
  isUser: boolean;
  timestamp: string;
}

export const QuestionBubble: React.FC<QuestionBubbleProps> = ({ text, isUser, timestamp }) => (
  <View style={[
    QuestionsStyles.messageBubble,
    isUser ? QuestionsStyles.userMessage : QuestionsStyles.botMessage
  ]}>
    <Text style={isUser ? QuestionsStyles.userMessageText : QuestionsStyles.botMessageText}>
      {text}
    </Text>
    <Text style={isUser ? QuestionsStyles.userMessageTimestamp : QuestionsStyles.botMessageTimestamp}>
      {timestamp}
    </Text>
  </View>
); 
import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { QuestionsStyles } from '../styles/QuestionsStyles';
import { QuestionBubble } from '../components/QuestionBubble';
import { useQuestions } from '../hooks/useQuestions';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
};

export default function QuestionsScreen() {
  const {
    userQuestion,
    setUserQuestion,
    messages,
    loading,
    sendMessage,
    clearAllMessages,
  } = useQuestions();
  const scrollViewRef = useRef<ScrollView>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  const getDummyAnswer = (question: string): string => {
    return '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  };

  return (
    <KeyboardAvoidingView
      style={QuestionsStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={QuestionsStyles.header}>
        <Text style={QuestionsStyles.title}>푸드봇</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearAllMessages} style={QuestionsStyles.clearButton}>
            <Ionicons name="trash-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={QuestionsStyles.messagesContainer}
        contentContainerStyle={QuestionsStyles.messagesContentContainer}
      >
        {messages.length === 0 && !loading && (
          <View style={QuestionsStyles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#C7C7CC" />
            <Text style={QuestionsStyles.emptyText}>궁금한 점을 물어보세요!</Text>
            <Text style={QuestionsStyles.emptySubtext}>예: &quot;건강한 아침 메뉴 추천해줘&quot;</Text>
          </View>
        )}

        {messages.map(item => (
          <QuestionBubble
            key={item.id}
            text={item.text}
            isUser={item.isUser}
            timestamp={item.timestamp}
          />
        ))}

        {loading && (
          <View style={[QuestionsStyles.messageBubble, QuestionsStyles.botMessage, QuestionsStyles.loadingBubble]}>
            <ActivityIndicator size="small" color="#5A5A5A" />
            <Text style={[QuestionsStyles.botMessageText, { marginLeft: 8 }]}>답변을 생각 중...</Text>
          </View>
        )}
      </ScrollView>

      <View style={QuestionsStyles.inputContainer}>
        <TextInput
          style={QuestionsStyles.input}
          placeholder="메시지를 입력하세요..."
          value={userQuestion}
          onChangeText={setUserQuestion}
          multiline
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={QuestionsStyles.sendButton}
          disabled={!userQuestion.trim()}
        >
          <Ionicons name="arrow-up-circle" size={36} color={userQuestion.trim() ? '#007AFF' : '#C7C7CC'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
} 
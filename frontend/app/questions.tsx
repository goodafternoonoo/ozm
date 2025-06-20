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
  const [userQuestion, setUserQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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

  const sendMessage = async () => {
    if (!userQuestion.trim()) {
      return;
    }

    const currentQuestion = userQuestion;
    const newUserMessage: Message = {
      id: Date.now(),
      text: currentQuestion,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserQuestion('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/questions/', {
        question: currentQuestion,
      });

      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: response.data.answer || '답변을 받지 못했습니다.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (err) {
      console.error('API 에러:', err);
      
      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, newBotMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getDummyAnswer = (question: string): string => {
    return '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  };

  const clearAllMessages = () => {
    Alert.alert('대화 기록 삭제', '모든 대화 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setMessages([]) },
    ]);
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
            <Text style={QuestionsStyles.emptySubtext}>예: "건강한 아침 메뉴 추천해줘"</Text>
          </View>
        )}

        {messages.map(item => (
          <View
            key={item.id}
            style={[QuestionsStyles.messageBubble, item.isUser ? QuestionsStyles.userMessage : QuestionsStyles.botMessage]}
          >
            <Text style={item.isUser ? QuestionsStyles.userMessageText : QuestionsStyles.botMessageText}>
              {item.text}
            </Text>
            <Text style={item.isUser ? QuestionsStyles.userMessageTimestamp : QuestionsStyles.botMessageTimestamp}>
              {item.timestamp}
            </Text>
          </View>
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
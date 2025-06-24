import { useState } from 'react';
import { Alert } from 'react-native';
import { QuestionService } from '../services/questionService';
import { AppError } from '../utils/apiClient';

export type Message = {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
};

export function useQuestions() {
    const [userQuestion, setUserQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!userQuestion.trim()) {
            return;
        }
        const currentQuestion = userQuestion;
        const newUserMessage: Message = {
            id: Date.now(),
            text: currentQuestion,
            isUser: true,
            timestamp: new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
        setMessages((prev) => [...prev, newUserMessage]);
        setUserQuestion('');
        setLoading(true);
        try {
            const response = await QuestionService.askQuestion({
                question: currentQuestion,
            });
            const newBotMessage: Message = {
                id: Date.now() + 1,
                text: response.answer || '답변을 받지 못했습니다.',
                isUser: false,
                timestamp: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            setMessages((prev) => [...prev, newBotMessage]);
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
            const newBotMessage: Message = {
                id: Date.now() + 1,
                text: errorMessage,
                isUser: false,
                timestamp: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            setMessages((prev) => [...prev, newBotMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearAllMessages = () => {
        Alert.alert('대화 기록 삭제', '모든 대화 기록을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: () => setMessages([]),
            },
        ]);
    };

    return {
        userQuestion,
        setUserQuestion,
        messages,
        loading,
        sendMessage,
        clearAllMessages,
    };
}

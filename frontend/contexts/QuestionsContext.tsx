import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { QuestionService } from '../services/questionService';
import { AppError } from '../utils/apiClient';
import { logUserInteraction, logError, LogCategory } from '../utils/logger';

export type Message = {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
    sources?: unknown[];
    model?: string;
};

interface QuestionsContextType {
    userQuestion: string;
    setUserQuestion: (question: string) => void;
    messages: Message[];
    loading: boolean;
    sendMessage: () => Promise<void>;
    clearMessages: () => void;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

interface QuestionsProviderProps {
    children: ReactNode;
}

export const QuestionsProvider: React.FC<QuestionsProviderProps> = ({ children }) => {
    const [userQuestion, setUserQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = useCallback(async () => {
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
            logUserInteraction('사용자 메시지 전송', { message: currentQuestion });
            // AI 답변 요청 (Perplexity 기반)
            const response = await QuestionService.getAIAnswer({
                question: currentQuestion,
            });
            logUserInteraction('AI 응답 수신', { response });
            const newBotMessage: Message = {
                id: Date.now() + 1,
                text: response.answer || '답변을 받지 못했습니다.',
                isUser: false,
                timestamp: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                sources: response.sources,
                model: response.model,
            };
            setMessages((prev) => [...prev, newBotMessage]);
        } catch (err) {
            logError(LogCategory.USER_INTERACTION, 'sendMessage 에러', err as Error);
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : 'AI 답변을 받는데 실패했습니다';
            Alert.alert('오류', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [userQuestion]);

    const clearMessages = useCallback(() => {
        logUserInteraction('메시지 히스토리 초기화');
        setMessages([]);
    }, []);

    const value = {
        userQuestion,
        setUserQuestion,
        messages,
        loading,
        sendMessage,
        clearMessages,
    };

    return (
        <QuestionsContext.Provider value={value}>
            {children}
        </QuestionsContext.Provider>
    );
};

export const useQuestions = (): QuestionsContextType => {
    const context = useContext(QuestionsContext);
    if (context === undefined) {
        throw new Error('useQuestions must be used within a QuestionsProvider');
    }
    return context;
}; 
import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { QuestionService } from '../services/questionService';
import { AppError } from '../utils/apiClient';

export type Message = {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
    sources?: any[];
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
            // AI 답변 요청 (Perplexity 기반)
            const response = await QuestionService.getAIAnswer({
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
                sources: response.sources,
                model: response.model,
            };
            setMessages((prev) => [...prev, newBotMessage]);
        } catch (err) {
            const errorMessage =
                err instanceof AppError
                    ? err.message
                    : 'AI 답변을 받는데 실패했습니다';
            Alert.alert('오류', errorMessage);
            console.error('AI 답변 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

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
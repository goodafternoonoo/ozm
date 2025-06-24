import { api, AppError } from '../utils/apiClient';

// 타입 정의
export interface ChujonQuestion {
    id: string;
    text: string;
    options: string[];
    category: string;
    weight: number;
    question_type: string;
}

export interface QuestionRequest {
    question: string;
}

export interface QuestionResponse {
    answer: string;
}

export interface QuestionsResponse {
    questions: ChujonQuestion[];
    total_count: number;
}

export interface AIQuestionRequest {
    question: string;
    context?: string;
}

export interface AIQuestionResponse {
    answer: string;
    model: string;
    sources: any[];
    usage: any;
}

// 질문 서비스 클래스
export class QuestionService {
    // 질문 목록 조회 (취존용)
    static async getQuestions(): Promise<ChujonQuestion[]> {
        try {
            return await api.get<ChujonQuestion[]>('/api/v1/questions/');
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '질문을 가져오는데 실패했습니다',
                'QUESTION_FETCH_ERROR'
            );
        }
    }

    // 질문 답변 요청 (챗봇용)
    static async askQuestion(
        request: QuestionRequest
    ): Promise<QuestionResponse> {
        try {
            return await api.post<QuestionResponse>(
                '/api/v1/questions/',
                request
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '질문 답변을 가져오는데 실패했습니다',
                'QUESTION_ANSWER_ERROR'
            );
        }
    }

    // AI 답변 요청 (Perplexity 기반)
    static async getAIAnswer(
        request: AIQuestionRequest
    ): Promise<AIQuestionResponse> {
        try {
            return await api.post<AIQuestionResponse>(
                '/api/v1/questions/ai-answer',
                request
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                'AI 답변을 가져오는데 실패했습니다',
                'AI_ANSWER_ERROR'
            );
        }
    }
}

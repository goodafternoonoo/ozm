import { api, AppError } from '../utils/apiClient';

// 타입 정의
export interface QuizQuestion {
    id: string;
    text: string;
    order: number;
    options: string[];
    category: string;
}

export interface QuestionRequest {
    question: string;
}

export interface QuestionResponse {
    answer: string;
}

export interface QuestionsResponse {
    questions: QuizQuestion[];
    total_count: number;
}

// 질문 서비스 클래스
export class QuestionService {
    // 질문 목록 조회 (퀴즈용)
    static async getQuestions(): Promise<QuestionsResponse> {
        try {
            return await api.get<QuestionsResponse>('/api/v1/questions/');
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
}

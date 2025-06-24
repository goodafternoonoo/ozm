import { api, AppError } from '../utils/apiClient';

// 타입 정의
export interface Category {
    id: string;
    name: string;
    cuisine_type?: string;
    description?: string;
    icon_url?: string;
    color_code?: string;
}

export interface CategoryResponse {
    categories: Category[];
    total_count: number;
    page: number;
    size: number;
}

// 카테고리 서비스 클래스
export class CategoryService {
    // 카테고리 목록 조회
    static async getCategories(
        page: number = 1,
        size: number = 50
    ): Promise<CategoryResponse> {
        try {
            return await api.get<CategoryResponse>(
                `/api/v1/categories?page=${page}&size=${size}`
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '카테고리를 가져오는데 실패했습니다',
                'CATEGORY_FETCH_ERROR'
            );
        }
    }

    // 카테고리 상세 조회
    static async getCategoryById(categoryId: string): Promise<Category> {
        try {
            return await api.get<Category>(`/api/v1/categories/${categoryId}`);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                '카테고리 상세 정보를 가져오는데 실패했습니다',
                'CATEGORY_DETAIL_ERROR'
            );
        }
    }
}

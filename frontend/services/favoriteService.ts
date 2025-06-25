import { api } from '../utils/apiClient';
import { Menu } from './recommendationService';

export interface FavoriteResponse {
    id: string;
    user_id: string;
    menu_id: string;
    created_at: string;
}

// 즐겨찾기 추가
export async function addFavorite(menuId: string): Promise<FavoriteResponse> {
    return await api.post<FavoriteResponse>('/api/v1/menus/favorites', {
        menu_id: menuId,
    });
}

// 즐겨찾기 목록 조회
export async function getFavorites(): Promise<Menu[]> {
    return await api.get<Menu[]>('/api/v1/menus/favorites/');
}

// 즐겨찾기 해제
export async function removeFavorite(menuId: string): Promise<void> {
    await api.delete('/api/v1/menus/favorites', {
        params: { menu_id: menuId },
    });
}

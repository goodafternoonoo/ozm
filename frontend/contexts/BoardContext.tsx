import React, { createContext, useContext, useState, ReactNode } from 'react';

// 게시글 타입 정의
export interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    views: number;
    comments: number;
    category?: string;
}

// 컨텍스트 타입 정의
interface BoardContextType {
    searchText: string;
    setSearchText: (text: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    posts: Post[];
    categories: string[];
    filteredPosts: Post[];
}

// 컨텍스트 생성
const BoardContext = createContext<BoardContextType | undefined>(undefined);

// 임시 게시글 데이터
const mockPosts: Post[] = [
    {
        id: '1',
        title: '오늘 점심 뭐 먹을까요?',
        author: '맛집탐험가',
        date: '2024-01-15',
        views: 128,
        comments: 12,
        category: '질문',
    },
    {
        id: '2',
        title: '집에서 만들기 쉬운 한식 추천해주세요',
        author: '요리초보',
        date: '2024-01-14',
        views: 89,
        comments: 8,
        category: '레시피',
    },
    {
        id: '3',
        title: '건강한 다이어트 식단 공유합니다',
        author: '건강러버',
        date: '2024-01-13',
        views: 256,
        comments: 23,
        category: '다이어트',
    },
    {
        id: '4',
        title: '회사 근처 맛집 추천받아요',
        author: '직장인',
        date: '2024-01-12',
        views: 67,
        comments: 15,
        category: '맛집추천',
    },
    {
        id: '5',
        title: '주말 브런치 맛집 리스트',
        author: '브런치러버',
        date: '2024-01-11',
        views: 145,
        comments: 19,
        category: '맛집추천',
    },
];

// 카테고리 목록
const categories = ['전체', '맛집추천', '레시피', '다이어트', '질문'];

// Provider 컴포넌트
interface BoardProviderProps {
    children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');

    // 필터링된 게시글 계산
    const filteredPosts = mockPosts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                            post.author.toLowerCase().includes(searchText.toLowerCase());
        
        const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    const value: BoardContextType = {
        searchText,
        setSearchText,
        selectedCategory,
        setSelectedCategory,
        posts: mockPosts,
        categories,
        filteredPosts,
    };

    return (
        <BoardContext.Provider value={value}>
            {children}
        </BoardContext.Provider>
    );
};

// 커스텀 훅
export const useBoard = (): BoardContextType => {
    const context = useContext(BoardContext);
    if (context === undefined) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};


// 색상 팔레트
export const COLORS = {
    // 기본 색상
    PRIMARY: '#FF6B35', // 주황색 (메인 브랜드 컬러)
    SECONDARY: '#4ECDC4', // 청록색
    ACCENT: '#FFE66D', // 노란색
    
    // 배경색
    BACKGROUND: {
        PRIMARY: '#FFFFFF',
        SECONDARY: '#F8F9FA',
        TERTIARY: '#E9ECEF',
        DARK: '#212529',
    },
    
    // 텍스트 색상
    TEXT: {
        PRIMARY: '#212529',
        SECONDARY: '#6C757D',
        TERTIARY: '#ADB5BD',
        INVERSE: '#FFFFFF',
        LINK: '#007BFF',
    },
    
    // 상태 색상
    STATUS: {
        SUCCESS: '#28A745',
        WARNING: '#FFC107',
        ERROR: '#DC3545',
        INFO: '#17A2B8',
    },
    
    // 카테고리별 색상
    CATEGORY: {
        KOREAN: '#FF6B35', // 한식
        CHINESE: '#FF8E53', // 중식
        JAPANESE: '#FFB366', // 일식
        WESTERN: '#4ECDC4', // 양식
        ASIAN: '#45B7D1', // 아시아
        DESSERT: '#96CEB4', // 디저트
        DRINK: '#FFEAA7', // 음료
    },
    
    // 그라데이션
    GRADIENT: {
        PRIMARY: ['#FF6B35', '#F7931E'],
        SECONDARY: ['#4ECDC4', '#44A08D'],
        ACCENT: ['#FFE66D', '#FFD93D'],
    },
    
    // 그림자
    SHADOW: {
        LIGHT: 'rgba(0, 0, 0, 0.1)',
        MEDIUM: 'rgba(0, 0, 0, 0.15)',
        DARK: 'rgba(0, 0, 0, 0.2)',
    },
} as const; 
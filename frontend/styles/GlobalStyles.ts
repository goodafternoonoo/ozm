import { Platform } from 'react-native';

// 디자인 시스템 - 색상 팔레트
export const colors = {
    primary: '#FF6B35', // 냠냠이 브랜드 컬러 (오렌지)
    primaryLight: '#FF8A65',
    primaryDark: '#E55A2B',
    secondary: '#4ECDC4', // 보조 컬러 (민트)
    background: '#FAFBFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    text: {
        primary: '#1A1A1A',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
    },
    border: {
        light: '#E5E7EB',
        medium: '#D1D5DB',
        dark: '#9CA3AF',
    },
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },
    shadow: {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        dark: 'rgba(0, 0, 0, 0.15)',
    },
};

// 타이포그래피 시스템
export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    h2: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 36,
        letterSpacing: -0.3,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    h3: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
        letterSpacing: -0.2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    body1: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    body2: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
};

// 간격 시스템
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// 그림자 시스템
export const shadows = {
    small: {
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    },
    large: {
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
    },
};

// 전역 스타일
export const globalStyles = {
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        ...shadows.small,
    },
    button: {
        primary: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            ...shadows.small,
        },
        secondary: {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 12,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.light,
        },
    },
    text: {
        primary: {
            ...typography.body1,
            color: colors.text.primary,
        },
        secondary: {
            ...typography.body2,
            color: colors.text.secondary,
        },
        caption: {
            ...typography.caption,
            color: colors.text.tertiary,
        },
    },
};

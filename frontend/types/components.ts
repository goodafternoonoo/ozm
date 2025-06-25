import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Menu, Category, Restaurant, MenuRecommendation } from './domain';

// 기본 컴포넌트 Props 타입
export interface BaseComponentProps {
    children?: ReactNode;
    style?: ViewStyle | TextStyle | ImageStyle;
    testID?: string;
    onPress?: (...args: unknown[]) => void;
}

// 카드 컴포넌트 Props 타입
export interface CardProps extends BaseComponentProps {
    onPress?: (...args: any[]) => void;
    disabled?: boolean;
    elevation?: number;
    borderRadius?: number;
    padding?: number;
}

// 메뉴 카드 Props 타입
export interface MenuCardProps extends CardProps {
    menu: Menu;
    showRating?: boolean;
    showCategory?: boolean;
    showCookingTime?: boolean;
    showCalories?: boolean;
    onFavoritePress?: (menuId: string, isFavorite: boolean) => void;
    isFavorite?: boolean;
    size?: 'small' | 'medium' | 'large';
}

// 레스토랑 카드 Props 타입
export interface RestaurantCardProps extends CardProps {
    restaurant: Restaurant;
    showDistance?: boolean;
    showRating?: boolean;
    showCategory?: boolean;
    onPress?: (restaurant: Restaurant) => void;
}

// 추천 메뉴 카드 Props 타입
export interface RecommendationCardProps extends MenuCardProps {
    recommendation: MenuRecommendation;
    showScore?: boolean;
    showReason?: boolean;
    onRecommendationPress?: (recommendation: MenuRecommendation) => void;
}

// 협업 필터링 메뉴 카드 Props 타입
export interface CollaborativeMenuCardProps extends MenuCardProps {
    recommendation: MenuRecommendation;
    similarityScore: number;
    similarUsersCount: number;
    showSimilarityInfo?: boolean;
}

// 버튼 Props 타입
export interface ButtonProps extends BaseComponentProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

// 입력 필드 Props 타입
export interface InputFieldProps extends BaseComponentProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    onFocus?: () => void;
    onBlur?: () => void;
    onSubmitEditing?: () => void;
}

// 검색 입력 필드 Props 타입
export interface SearchInputProps extends InputFieldProps {
    onSearch: (query: string) => void;
    onClear?: () => void;
    debounceDelay?: number;
    showClearButton?: boolean;
    loading?: boolean;
}

// 모달 Props 타입
export interface ModalProps extends BaseComponentProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    showCloseButton?: boolean;
    closeOnBackdropPress?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
}

// 로딩 컴포넌트 Props 타입
export interface LoadingProps extends BaseComponentProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    text?: string;
    fullScreen?: boolean;
}

// 에러 컴포넌트 Props 타입
export interface ErrorProps extends BaseComponentProps {
    message: string;
    onRetry?: () => void;
    showRetryButton?: boolean;
    retryButtonText?: string;
}

// 빈 상태 컴포넌트 Props 타입
export interface EmptyStateProps extends BaseComponentProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actionButton?: {
        title: string;
        onPress: () => void;
    };
}

// 탭 컴포넌트 Props 타입
export interface TabProps extends BaseComponentProps {
    title: string;
    isActive: boolean;
    onPress: () => void;
    badge?: number;
    icon?: ReactNode;
}

// 탭바 Props 타입
export interface TabBarProps extends BaseComponentProps {
    tabs: TabProps[];
    activeTabIndex: number;
    onTabPress: (index: number) => void;
    variant?: 'default' | 'segmented' | 'pills';
}

// 리스트 아이템 Props 타입
export interface ListItemProps extends BaseComponentProps {
    title: string;
    subtitle?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    showChevron?: boolean;
    showDivider?: boolean;
}

// 카테고리 아이템 Props 타입
export interface CategoryItemProps extends ListItemProps {
    category: Category;
    isSelected?: boolean;
    showIcon?: boolean;
    showColor?: boolean;
}

// 헤더 Props 타입
export interface HeaderProps extends BaseComponentProps {
    title: string;
    subtitle?: string;
    leftButton?: {
        icon: ReactNode;
        onPress: () => void;
    };
    rightButton?: {
        icon: ReactNode;
        onPress: () => void;
    };
    showBackButton?: boolean;
    onBackPress?: () => void;
}

// 플로팅 액션 버튼 Props 타입
export interface FloatingActionButtonProps extends BaseComponentProps {
    icon: ReactNode;
    onPress: () => void;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

// 스켈레톤 Props 타입
export interface SkeletonProps extends BaseComponentProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    variant?: 'text' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave';
}

// 토스트 Props 타입
export interface ToastProps extends BaseComponentProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose?: () => void;
    position?: 'top' | 'bottom' | 'center';
}

// 툴팁 Props 타입
export interface TooltipProps extends BaseComponentProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    showArrow?: boolean;
    delay?: number;
}

// 드롭다운 Props 타입
export interface DropdownProps extends BaseComponentProps {
    options: { label: string; value: string }[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

// 체크박스 Props 타입
export interface CheckboxProps extends BaseComponentProps {
    checked: boolean;
    onValueChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}

// 라디오 버튼 Props 타입
export interface RadioButtonProps extends BaseComponentProps {
    selected: boolean;
    onSelect: () => void;
    label?: string;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}

// 슬라이더 Props 타입
export interface SliderProps extends BaseComponentProps {
    value: number;
    onValueChange: (value: number) => void;
    minimumValue: number;
    maximumValue: number;
    step?: number;
    disabled?: boolean;
    showValue?: boolean;
    showTrack?: boolean;
    showThumb?: boolean;
} 
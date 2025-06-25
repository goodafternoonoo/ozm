import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';
import { Menu, ABTestInfo } from '../services/recommendationService';
import { spacing, colors } from '../styles/GlobalStyles';

interface MenuCardProps {
    menu: Menu;
    reason?: string;
    onRemove?: (menu: Menu) => void;
    onAdd?: (menu: Menu) => void;
    onMenuClick?: (menu: Menu) => void;
    isSaved?: boolean;
    abTestInfo?: ABTestInfo | null;
    showABTestInfo?: boolean;
    interactionEnabled?: boolean;
}

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Ionicons
                key={i}
                name={i <= rating ? 'star' : 'star-outline'}
                size={16}
                color={i <= rating ? '#FFD700' : '#C7C7CC'}
            />
        );
    }
    return stars;
};

export const renderABTestInfo = (abTestInfo: ABTestInfo) => {
    const weightLabels: Record<string, string> = {
        spicy: '매운맛',
        healthy: '건강식',
        vegetarian: '채식',
        quick: '빠른조리',
        rice: '밥류',
        soup: '국물요리',
        meat: '고기요리',
    };

    if (!abTestInfo.weightSet || typeof abTestInfo.weightSet !== 'object') {
        return null;
    }

    return (
        <View style={MenuRecommendationStyles.abTestContainer}>
            <View style={MenuRecommendationStyles.abTestHeader}>
                <Ionicons name='flask-outline' size={14} color='#007AFF' />
                <Text style={MenuRecommendationStyles.abTestTitle}>
                    A/B 테스트 그룹 {abTestInfo.abGroup}
                </Text>
            </View>
            <View style={MenuRecommendationStyles.weightSetContainer}>
                {Object.entries(abTestInfo.weightSet).map(([key, value]) => (
                    <Text key={key} style={MenuRecommendationStyles.weightText}>
                        {weightLabels[key] || key}: {value.toFixed(1)}
                    </Text>
                ))}
            </View>
        </View>
    );
};

export const MenuCard: React.FC<MenuCardProps> = React.memo(({
    menu,
    reason,
    onRemove,
    onAdd,
    onMenuClick,
    isSaved,
    abTestInfo,
    showABTestInfo = false,
    interactionEnabled = true,
}) => {
    const handleCardPress = () => {
        if (onMenuClick && interactionEnabled) {
            onMenuClick(menu);
        }
    };

    const handleRemovePress = () => {
        if (onRemove) {
            onRemove(menu);
        }
    };

    const handleAddPress = () => {
        if (onAdd) {
            onAdd(menu);
        }
    };

    const CardContainer =
        onMenuClick && interactionEnabled ? TouchableOpacity : View;

    return (
        <CardContainer
            style={MenuRecommendationStyles.menuCard}
            {...(onMenuClick && interactionEnabled
                ? { onPress: handleCardPress }
                : {})}
            disabled={onMenuClick && interactionEnabled ? false : undefined}
        >
            {reason && (
                <View style={MenuRecommendationStyles.reasonContainer}>
                    <Ionicons
                        name='sparkles-outline'
                        size={16}
                        color='#007AFF'
                    />
                    <Text style={MenuRecommendationStyles.reasonText}>
                        {reason}
                    </Text>
                </View>
            )}

            {showABTestInfo && abTestInfo && renderABTestInfo(abTestInfo)}

            <View style={MenuRecommendationStyles.menuHeader}>
                <Text style={MenuRecommendationStyles.menuName}>
                    {menu.name}
                </Text>
                <View style={MenuRecommendationStyles.ratingContainer}>
                    {renderStars(menu.rating)}
                    <Text style={MenuRecommendationStyles.ratingText}>
                        {menu.rating.toFixed(1)}
                    </Text>
                </View>
            </View>

            <Text style={MenuRecommendationStyles.menuDescription}>
                {menu.description}
            </Text>

            {/* 영양성분 표기 */}
            {(menu.calories || menu.protein || menu.carbs || menu.fat) && (
                <View
                    style={{
                        marginTop: spacing.sm,
                        marginBottom: spacing.md,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        backgroundColor: colors.surfaceSecondary,
                        padding: spacing.sm,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.light + '30',
                    }}
                >
                    {menu.calories !== undefined && (
                        <View
                            style={{
                                marginRight: spacing.md,
                                marginBottom: spacing.xs,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.text.tertiary,
                                    fontSize: 11,
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}
                            >
                                칼로리
                            </Text>
                            <Text
                                style={{
                                    color: colors.text.primary,
                                    fontSize: 14,
                                    fontWeight: '700',
                                }}
                            >
                                {menu.calories}kcal
                            </Text>
                        </View>
                    )}
                    {menu.protein !== undefined && (
                        <View
                            style={{
                                marginRight: spacing.md,
                                marginBottom: spacing.xs,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.text.tertiary,
                                    fontSize: 11,
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}
                            >
                                단백질
                            </Text>
                            <Text
                                style={{
                                    color: colors.text.primary,
                                    fontSize: 14,
                                    fontWeight: '700',
                                }}
                            >
                                {menu.protein}g
                            </Text>
                        </View>
                    )}
                    {menu.carbs !== undefined && (
                        <View
                            style={{
                                marginRight: spacing.md,
                                marginBottom: spacing.xs,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.text.tertiary,
                                    fontSize: 11,
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}
                            >
                                탄수화물
                            </Text>
                            <Text
                                style={{
                                    color: colors.text.primary,
                                    fontSize: 14,
                                    fontWeight: '700',
                                }}
                            >
                                {menu.carbs}g
                            </Text>
                        </View>
                    )}
                    {menu.fat !== undefined && (
                        <View
                            style={{
                                marginRight: spacing.md,
                                marginBottom: spacing.xs,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.text.tertiary,
                                    fontSize: 11,
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}
                            >
                                지방
                            </Text>
                            <Text
                                style={{
                                    color: colors.text.primary,
                                    fontSize: 14,
                                    fontWeight: '700',
                                }}
                            >
                                {menu.fat}g
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* 즐겨찾기 버튼 */}
            {isSaved !== undefined && (
                <View style={MenuRecommendationStyles.cardFooter}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: isSaved ? '#FF3B3015' : colors.surfaceSecondary,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: isSaved ? '#FF3B3030' : colors.border.light,
                        }}
                        onPress={isSaved ? handleRemovePress : handleAddPress}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isSaved ? '#FF3B30' : '#007AFF'}
                        />
                        <Text
                            style={{
                                marginLeft: spacing.xs,
                                color: isSaved ? '#FF3B30' : colors.text.secondary,
                                fontSize: 13,
                                fontWeight: '600',
                            }}
                        >
                            {isSaved ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </CardContainer>
    );
});

MenuCard.displayName = 'MenuCard';

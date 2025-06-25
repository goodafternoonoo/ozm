import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';
import { spacing, colors } from '../styles/GlobalStyles';

export type CollaborativeMenu = {
    id: number;
    name: string;
    description: string;
    category: string;
    rating: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
};

interface CollaborativeMenuCardProps {
    menu: CollaborativeMenu;
    reason?: string;
    similarityScore: number;
    similarUsersCount: number;
    onMenuClick?: (menu: CollaborativeMenu) => void;
    onRemove?: (menu: CollaborativeMenu) => void;
    onAdd?: (menu: CollaborativeMenu) => void;
    isSaved?: boolean;
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

const renderCollaborativeInfo = (
    similarityScore: number,
    similarUsersCount: number
) => {
    return (
        <View style={MenuRecommendationStyles.collaborativeContainer}>
            <View style={MenuRecommendationStyles.collaborativeHeader}>
                <Ionicons name='people-outline' size={14} color='#FFA000' />
                <Text style={MenuRecommendationStyles.collaborativeTitle}>
                    유사한 취향의 사용자들이 좋아한 메뉴
                </Text>
            </View>
            <View style={MenuRecommendationStyles.similarityInfo}>
                <Text style={MenuRecommendationStyles.similarityText}>
                    유사도: {(similarityScore * 100).toFixed(1)}%
                </Text>
                <Text style={MenuRecommendationStyles.similarityText}>
                    유사 사용자: {similarUsersCount}명
                </Text>
            </View>
        </View>
    );
};

export const CollaborativeMenuCard: React.FC<CollaborativeMenuCardProps> = ({
    menu,
    reason,
    similarityScore,
    similarUsersCount,
    onMenuClick,
    onRemove,
    onAdd,
    isSaved,
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
            {renderCollaborativeInfo(similarityScore, similarUsersCount)}

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

            <View style={MenuRecommendationStyles.cardFooter}>
                <View style={MenuRecommendationStyles.categoryContainer}>
                    <Text style={MenuRecommendationStyles.categoryText}>
                        {menu.category}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                    }}
                >
                    {/* 즐겨찾기 하트 버튼 또는 로그인 안내 */}
                    {onRemove || onAdd ? (
                        // 로그인된 상태: 즐겨찾기 버튼 표시
                        isSaved ? (
                            onRemove && (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor:
                                            colors.status.error + '15',
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.sm,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: colors.status.error + '30',
                                    }}
                                    onPress={handleRemovePress}
                                >
                                    <Ionicons
                                        name={'heart'}
                                        size={20}
                                        color={colors.status.error}
                                    />
                                    <Text
                                        style={{
                                            marginLeft: spacing.xs,
                                            color: colors.status.error,
                                            fontSize: 13,
                                            fontWeight: '600',
                                        }}
                                    >
                                        즐겨찾기 해제
                                    </Text>
                                </TouchableOpacity>
                            )
                        ) : (
                            onAdd && (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor:
                                            colors.surfaceSecondary,
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.sm,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}
                                    onPress={handleAddPress}
                                >
                                    <Ionicons
                                        name={'heart-outline'}
                                        size={20}
                                        color={colors.text.secondary}
                                    />
                                    <Text
                                        style={{
                                            marginLeft: spacing.xs,
                                            color: colors.text.secondary,
                                            fontSize: 13,
                                            fontWeight: '600',
                                        }}
                                    >
                                        즐겨찾기 추가
                                    </Text>
                                </TouchableOpacity>
                            )
                        )
                    ) : (
                        // 로그인하지 않은 상태: 로그인 안내 메시지
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary + '10',
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: colors.primary + '20',
                            }}
                        >
                            <Ionicons
                                name='log-in-outline'
                                size={16}
                                color={colors.primary}
                            />
                            <Text
                                style={{
                                    marginLeft: spacing.xs,
                                    color: colors.primary,
                                    fontSize: 12,
                                    fontWeight: '600',
                                }}
                            >
                                로그인 후 즐겨찾기 가능
                            </Text>
                        </View>
                    )}

                    {isSaved && !onRemove && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.status.success + '15',
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: colors.status.success + '30',
                            }}
                        >
                            <Ionicons
                                name='checkmark-circle'
                                size={20}
                                color={colors.status.success}
                            />
                            <Text
                                style={{
                                    marginLeft: spacing.xs,
                                    color: colors.status.success,
                                    fontSize: 13,
                                    fontWeight: '600',
                                }}
                            >
                                즐겨찾기됨
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </CardContainer>
    );
};

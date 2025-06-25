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

export const MenuCard: React.FC<MenuCardProps> = ({
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

    return (
        <TouchableOpacity
            style={MenuRecommendationStyles.menuCard}
            onPress={handleCardPress}
            disabled={!interactionEnabled}
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

            <View style={MenuRecommendationStyles.cardFooter}>
                <View style={MenuRecommendationStyles.categoryContainer}>
                    <Ionicons
                        name='restaurant-outline'
                        size={14}
                        color='#007AFF'
                        style={{ marginRight: 4 }}
                    />
                    <Text style={MenuRecommendationStyles.categoryText}>
                        {menu.category?.cuisine_type || '카테고리 없음'}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                    }}
                >
                    {/* 즐겨찾기 하트 버튼 */}
                    {isSaved
                        ? onRemove && (
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
                        : onAdd && (
                              <TouchableOpacity
                                  style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      backgroundColor: colors.surfaceSecondary,
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
        </TouchableOpacity>
    );
};

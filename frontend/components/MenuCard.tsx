import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';
import { Menu, ABTestInfo } from '../services/recommendationService';

interface MenuCardProps {
    menu: Menu;
    reason?: string;
    onAdd?: (menu: Menu) => void;
    onRemove?: (menu: Menu) => void;
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
    onAdd,
    onRemove,
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

    const handleAddPress = () => {
        if (onAdd) {
            onAdd(menu);
        }
    };

    const handleRemovePress = () => {
        if (onRemove) {
            onRemove(menu);
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
                        marginTop: 8,
                        marginBottom: 4,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                    }}
                >
                    {menu.calories !== undefined && (
                        <Text
                            style={{
                                marginRight: 12,
                                color: '#888',
                                fontSize: 13,
                            }}
                        >
                            칼로리: {menu.calories}kcal
                        </Text>
                    )}
                    {menu.protein !== undefined && (
                        <Text
                            style={{
                                marginRight: 12,
                                color: '#888',
                                fontSize: 13,
                            }}
                        >
                            단백질: {menu.protein}g
                        </Text>
                    )}
                    {menu.carbs !== undefined && (
                        <Text
                            style={{
                                marginRight: 12,
                                color: '#888',
                                fontSize: 13,
                            }}
                        >
                            탄수화물: {menu.carbs}g
                        </Text>
                    )}
                    {menu.fat !== undefined && (
                        <Text
                            style={{
                                marginRight: 12,
                                color: '#888',
                                fontSize: 13,
                            }}
                        >
                            지방: {menu.fat}g
                        </Text>
                    )}
                </View>
            )}

            <View style={MenuRecommendationStyles.cardFooter}>
                <View style={MenuRecommendationStyles.categoryContainer}>
                    <Text style={MenuRecommendationStyles.categoryText}>
                        {menu.category?.cuisine_type || '카테고리 없음'}
                    </Text>
                </View>

                {/* 즐겨찾기 하트 버튼 */}
                {(onAdd || onRemove) && (
                    <TouchableOpacity
                        onPress={isSaved ? handleRemovePress : handleAddPress}
                        style={{
                            marginLeft: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={26}
                            color={isSaved ? '#FF3B30' : '#C7C7CC'}
                        />
                        <Text
                            style={{
                                marginLeft: 4,
                                color: isSaved ? '#FF3B30' : '#888',
                                fontSize: 14,
                            }}
                        >
                            {isSaved ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* 메뉴 추가/제거 버튼 (원래대로 복원) */}
                {onAdd && !isSaved && (
                    <TouchableOpacity
                        style={MenuRecommendationStyles.addButton}
                        onPress={handleAddPress}
                    >
                        <Ionicons
                            name='add-circle-outline'
                            size={24}
                            color='#007AFF'
                        />
                        <Text style={MenuRecommendationStyles.addButtonText}>
                            메뉴 추가
                        </Text>
                    </TouchableOpacity>
                )}
                {onRemove && isSaved && (
                    <TouchableOpacity
                        style={MenuRecommendationStyles.removeButton}
                        onPress={handleRemovePress}
                    >
                        <Ionicons
                            name='remove-circle-outline'
                            size={24}
                            color='#FF3B30'
                        />
                        <Text style={MenuRecommendationStyles.removeButtonText}>
                            메뉴 제거
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

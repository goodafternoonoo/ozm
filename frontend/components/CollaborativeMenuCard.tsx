import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';

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
    onAdd?: (menu: CollaborativeMenu) => void;
    onRemove?: (menu: CollaborativeMenu) => void;
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
    onAdd,
    onRemove,
    isSaved,
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
                        {menu.category}
                    </Text>
                </View>

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

                {isSaved && onRemove && (
                    <TouchableOpacity
                        style={MenuRecommendationStyles.addButton}
                        onPress={handleRemovePress}
                    >
                        <Ionicons
                            name='remove-circle-outline'
                            size={24}
                            color='#FF3B30'
                        />
                        <Text
                            style={[
                                MenuRecommendationStyles.addButtonText,
                                { color: '#FF3B30' },
                            ]}
                        >
                            추가 취소
                        </Text>
                    </TouchableOpacity>
                )}

                {isSaved && !onRemove && (
                    <Ionicons
                        name='checkmark-circle'
                        size={24}
                        color='#4CD964'
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

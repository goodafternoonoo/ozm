import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NearbyStyles } from '../styles/NearbyStyles';
import { colors } from '../styles/GlobalStyles';

export interface Restaurant {
    id: string;
    name: string;
    category: string;
    distance: number;
    distanceFormatted: string;
    rating: number;
    address: string;
    phone: string;
    placeUrl: string;
    roadAddress: string;
    latitude: number;
    longitude: number;
}

interface RestaurantListItemProps {
    restaurant: Restaurant;
    onPress?: (restaurant: Restaurant) => void;
    onCall?: (phone: string) => void;
    onMap?: (restaurant: Restaurant) => void;
}

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const starName = i <= Math.floor(rating) ? 'star' : 'star-outline';
        const starColor = i <= Math.floor(rating) ? '#FFD700' : '#C7C7CC';

        stars.push(
            <Ionicons key={i} name={starName} size={16} color={starColor} />
        );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

const openKakaoMap = (name: string, lat: number, lng: number) => {
    const url = `https://map.kakao.com/link/map/${encodeURIComponent(
        name
    )},${lat},${lng}`;
    Linking.openURL(url).catch(() => {
        Alert.alert('오류', '카카오맵을 열 수 없습니다.');
    });
};

export const RestaurantListItem: React.FC<RestaurantListItemProps> = ({
    restaurant,
    onPress,
    onCall,
    onMap,
}) => (
    <TouchableOpacity
        style={NearbyStyles.restaurantCard}
        onPress={() => onPress?.(restaurant)}
    >
        <View style={NearbyStyles.restaurantHeader}>
            <Text style={NearbyStyles.restaurantName}>{restaurant.name}</Text>
            {
                <View style={NearbyStyles.ratingContainer}>
                    {renderStars(restaurant.rating)}
                    <Text style={NearbyStyles.ratingText}>
                        {restaurant.rating.toFixed(1)}
                    </Text>
                </View>
            }
        </View>
        <Text style={NearbyStyles.categoryText}>{restaurant.category}</Text>
        <Text style={NearbyStyles.addressText}>{restaurant.address}</Text>
        <View style={NearbyStyles.cardFooter}>
            <Text style={NearbyStyles.distanceText}>
                {restaurant.distanceFormatted}
            </Text>
            {/* 전화 버튼 제거 - 조건부 렌더링 문제로 인해
      {restaurant.phone && (
        <TouchableOpacity style={NearbyStyles.phoneButton}>
          <Ionicons name="call-outline" size={18} color="#007AFF"/>
        </TouchableOpacity>
      )}
      */}
            <TouchableOpacity
                onPress={() =>
                    openKakaoMap(
                        restaurant.name,
                        restaurant.latitude,
                        restaurant.longitude
                    )
                }
                style={NearbyStyles.mapButton}
            >
                <Ionicons name='map-outline' size={22} color={colors.primary} />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

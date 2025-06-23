import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NearbyStyles } from '../styles/NearbyStyles';

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

export const RestaurantListItem: React.FC<RestaurantListItemProps> = ({ restaurant, onPress, onCall, onMap }) => (
  <TouchableOpacity style={NearbyStyles.restaurantCard} onPress={() => onPress?.(restaurant)}>
    <View style={NearbyStyles.restaurantHeader}>
      <Text style={NearbyStyles.restaurantName}>{restaurant.name}</Text>
      <View style={NearbyStyles.ratingContainer}>
        {renderStars(restaurant.rating)}
        <Text style={NearbyStyles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
      </View>
    </View>
    <Text style={NearbyStyles.categoryText}>{restaurant.category}</Text>
    <Text style={NearbyStyles.addressText}>{restaurant.address}</Text>
    <View style={NearbyStyles.cardFooter}>
      <Text style={NearbyStyles.distanceText}>{restaurant.distanceFormatted}</Text>
      {restaurant.phone && (
        <TouchableOpacity onPress={() => onCall?.(restaurant.phone)} style={NearbyStyles.phoneButton}>
          <Ionicons name="call-outline" size={18} color="#007AFF" />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => onMap?.(restaurant)} style={NearbyStyles.mapButton}>
        <Ionicons name="map-outline" size={18} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
); 
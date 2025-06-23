import { useState } from 'react';
import { Alert } from 'react-native';
import { LocationService, LocationData } from '../utils/locationService';
import { KakaoApiService } from '../utils/kakaoApiService';

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

export function useNearbyRestaurants() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'loading'>('loading');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchRadius, setSearchRadius] = useState(1000);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        setLocationPermission('granted');
        await searchNearbyRestaurants(currentLocation.latitude, currentLocation.longitude);
      } else {
        setLocationPermission('denied');
      }
    } catch (error) {
      setLocationPermission('denied');
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyRestaurants = async (latitude: number, longitude: number) => {
    try {
      let kakaoPlaces;
      if (searchKeyword.trim()) {
        kakaoPlaces = await KakaoApiService.searchRestaurantsByKeyword(
          searchKeyword,
          latitude,
          longitude,
          searchRadius
        );
      } else {
        kakaoPlaces = await KakaoApiService.searchRestaurants(
          latitude,
          longitude,
          searchRadius
        );
      }
      const transformedRestaurants: Restaurant[] = kakaoPlaces.map(place => ({
        id: place.id,
        name: place.place_name,
        category: place.category_name,
        distance: parseInt(place.distance),
        distanceFormatted: KakaoApiService.formatDistance(parseInt(place.distance)),
        rating: 4.0 + Math.random() * 1.0,
        address: place.address_name,
        phone: place.phone,
        placeUrl: place.place_url,
        roadAddress: place.road_address_name
      }));
      setRestaurants(transformedRestaurants);
    } catch (error) {
      Alert.alert('오류', '맛집 검색에 실패했습니다. 카카오 API 키를 확인해주세요.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await searchNearbyRestaurants(location.latitude, location.longitude);
    }
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!location) {
      Alert.alert('오류', '위치 정보가 없습니다.');
      return;
    }
    setLoading(true);
    await searchNearbyRestaurants(location.latitude, location.longitude);
    setLoading(false);
  };

  return {
    location,
    restaurants,
    loading,
    refreshing,
    locationPermission,
    searchKeyword,
    setSearchKeyword,
    searchRadius,
    setSearchRadius,
    getCurrentLocation,
    searchNearbyRestaurants,
    onRefresh,
    handleSearch,
  };
} 
import { useState } from 'react';
import { Alert } from 'react-native';
import { LocationService, LocationData } from '../services/locationService';
import { KakaoApiService } from '../services/kakaoApiService';

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

export function useNearbyRestaurants() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'loading'>('loading');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchRadius, setSearchRadius] = useState(1000);

  const getCurrentLocation = async () => {
    console.log('🔄 getCurrentLocation 호출됨');
    setLoading(true);
    try {
      console.log('📍 LocationService.getCurrentLocation() 호출...');
      const currentLocation = await LocationService.getCurrentLocation();
      console.log('📍 LocationService 결과:', currentLocation);
      
      if (currentLocation) {
        console.log('✅ 위치 정보 설정:', currentLocation);
        setLocation(currentLocation);
        setLocationPermission('granted');
        console.log('📍 맛집 검색 시작...');
        await searchNearbyRestaurants(currentLocation.latitude, currentLocation.longitude);
      } else {
        console.log('❌ 위치 정보 없음, 권한 거부됨');
        setLocationPermission('denied');
      }
    } catch (error) {
      console.error('❌ getCurrentLocation 에러:', error);
      setLocationPermission('denied');
    } finally {
      setLoading(false);
      console.log('🔄 getCurrentLocation 완료');
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
        rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
        address: place.address_name,
        phone: place.phone,
        placeUrl: place.place_url,
        roadAddress: place.road_address_name,
        latitude: parseFloat(place.y),
        longitude: parseFloat(place.x),
      }));
      setRestaurants(transformedRestaurants);
    } catch (error) {
      console.error('❌ searchNearbyRestaurants 에러:', error);
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
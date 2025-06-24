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
  
  // 무한 스크롤을 위한 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
        // 초기 검색 시 페이지 리셋
        setCurrentPage(1);
        setHasMoreData(true);
        await searchNearbyRestaurants(currentLocation.latitude, currentLocation.longitude, 1, true);
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

  const searchNearbyRestaurants = async (
    latitude: number, 
    longitude: number, 
    page: number = 1, 
    reset: boolean = false,
    sortBy: 'distance' | 'distance_desc' = 'distance'
  ) => {
    try {
      let kakaoPlaces;
      if (searchKeyword.trim()) {
        kakaoPlaces = await KakaoApiService.searchRestaurantsByKeyword(
          searchKeyword,
          latitude,
          longitude,
          searchRadius,
          page,
          sortBy
        );
      } else {
        kakaoPlaces = await KakaoApiService.searchRestaurants(
          latitude,
          longitude,
          searchRadius,
          page,
          sortBy
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

      if (reset) {
        // 초기 검색 또는 새로고침 시 기존 데이터 교체
        setRestaurants(transformedRestaurants);
      } else {
        // 추가 로드 시 기존 데이터에 추가
        setRestaurants(prev => [...prev, ...transformedRestaurants]);
      }

      // 더 이상 데이터가 없으면 hasMoreData를 false로 설정
      setHasMoreData(kakaoPlaces.length === 15); // 카카오 API는 한 번에 최대 15개 반환
      
    } catch (error) {
      console.error('❌ searchNearbyRestaurants 에러:', error);
      Alert.alert('오류', '맛집 검색에 실패했습니다. 카카오 API 키를 확인해주세요.');
    }
  };

  const loadMoreRestaurants = async (sortBy: 'distance' | 'distance_desc' = 'distance') => {
    if (!location || loadingMore || !hasMoreData) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    try {
      await searchNearbyRestaurants(location.latitude, location.longitude, nextPage, false, sortBy);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async (sortBy: 'distance' | 'distance_desc' = 'distance') => {
    setRefreshing(true);
    if (location) {
      setCurrentPage(1);
      setHasMoreData(true);
      await searchNearbyRestaurants(location.latitude, location.longitude, 1, true, sortBy);
    }
    setRefreshing(false);
  };

  const handleSearch = async (sortBy: 'distance' | 'distance_desc' = 'distance') => {
    if (!location) {
      Alert.alert('오류', '위치 정보가 없습니다.');
      return;
    }
    setLoading(true);
    setCurrentPage(1);
    setHasMoreData(true);
    await searchNearbyRestaurants(location.latitude, location.longitude, 1, true, sortBy);
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
    // 무한 스크롤 관련
    loadMoreRestaurants,
    loadingMore,
    hasMoreData,
  };
} 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationService, LocationData } from '../utils/locationService';
import { KakaoApiService } from '../utils/kakaoApiService';
import { NearbyStyles } from '../styles/NearbyStyles';
import RestaurantMap from '../components/RestaurantMap';

interface Restaurant {
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

export default function NearbyScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'loading'>('loading');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchRadius, setSearchRadius] = useState(1000);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      
      if (currentLocation) {
        setLocation(currentLocation);
        setLocationPermission('granted');
        
        // 카카오 API로 근처 맛집 검색
        await searchNearbyRestaurants(currentLocation.latitude, currentLocation.longitude);
      } else {
        setLocationPermission('denied');
      }
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      setLocationPermission('denied');
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyRestaurants = async (latitude: number, longitude: number) => {
    try {
      let kakaoPlaces;
      
      if (searchKeyword.trim()) {
        // 키워드로 검색
        kakaoPlaces = await KakaoApiService.searchRestaurantsByKeyword(
          searchKeyword,
          latitude,
          longitude,
          searchRadius
        );
      } else {
        // 카테고리로 검색 (음식점)
        kakaoPlaces = await KakaoApiService.searchRestaurants(
          latitude,
          longitude,
          searchRadius
        );
      }

      // 데이터 변환
      const transformedRestaurants: Restaurant[] = kakaoPlaces.map(place => ({
        id: place.id,
        name: place.place_name,
        category: place.category_name,
        distance: parseInt(place.distance),
        distanceFormatted: KakaoApiService.formatDistance(parseInt(place.distance)),
        rating: 4.0 + Math.random() * 1.0, // 카카오 API에는 평점이 없으므로 랜덤 생성
        address: place.address_name,
        phone: place.phone,
        placeUrl: place.place_url,
        roadAddress: place.road_address_name
      }));

      setRestaurants(transformedRestaurants);
    } catch (error) {
      console.error('맛집 검색 실패:', error);
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#FFD700" : "#C7C7CC"}
        />
      );
    }
    return stars;
  };

  const openMap = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMap(true);
  };

  const closeMap = () => {
    setShowMap(false);
    setSelectedRestaurant(null);
  };

  const callRestaurant = (phone: string) => {
    if (phone) {
      Alert.alert(
        '전화 걸기',
        `${phone}로 전화를 걸까요?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '전화', onPress: () => Alert.alert('전화 기능', '전화 기능은 추후 구현 예정입니다.') }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={NearbyStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={NearbyStyles.loadingText}>맛집을 검색하고 있습니다...</Text>
      </View>
    );
  }

  if (locationPermission === 'denied') {
    return (
      <View style={NearbyStyles.errorContainer}>
        <Ionicons name="location" size={80} color="#FF3B30" />
        <Text style={NearbyStyles.errorTitle}>위치 권한이 필요합니다</Text>
        <Text style={NearbyStyles.errorText}>
          근처 맛집을 추천받으려면 위치 권한을 허용해주세요.
        </Text>
        <TouchableOpacity style={NearbyStyles.retryButton} onPress={getCurrentLocation}>
          <Text style={NearbyStyles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={NearbyStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={NearbyStyles.header}>
        <View style={NearbyStyles.locationInfo}>
          <Ionicons name="location" size={24} color="#007AFF" />
          <View style={NearbyStyles.locationText}>
            <Text style={NearbyStyles.locationTitle}>현재 위치</Text>
            <TouchableOpacity onPress={() => setShowFullAddress(!showFullAddress)}>
              <Text style={NearbyStyles.locationAddress}>
                {location?.address 
                  ? (showFullAddress ? location.address : LocationService.formatAddressToDistrict(location.address))
                  : location 
                    ? '주소 정보 없음' 
                    : '위치 정보를 가져오는 중...'
                }
              </Text>
              {location?.address && (
                <Text style={NearbyStyles.locationHint}>
                  {showFullAddress ? '간단히 보기' : '상세 주소 보기'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={NearbyStyles.refreshButton} onPress={getCurrentLocation}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={NearbyStyles.content}>
        <View style={NearbyStyles.searchContainer}>
          <TextInput
            style={NearbyStyles.searchInput}
            placeholder="맛집 이름이나 음식 종류를 검색하세요"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={NearbyStyles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={NearbyStyles.radiusContainer}>
          <Text style={NearbyStyles.radiusLabel}>검색 반경: {searchRadius}m</Text>
          <View style={NearbyStyles.radiusButtons}>
            {[500, 1000, 2000, 3000].map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  NearbyStyles.radiusButton,
                  searchRadius === radius && NearbyStyles.radiusButtonActive
                ]}
                onPress={() => {
                  setSearchRadius(radius);
                  if (location) {
                    searchNearbyRestaurants(location.latitude, location.longitude);
                  }
                }}
              >
                <Text style={[
                  NearbyStyles.radiusButtonText,
                  searchRadius === radius && NearbyStyles.radiusButtonTextActive
                ]}>
                  {radius}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={NearbyStyles.sectionTitle}>
          {searchKeyword ? `"${searchKeyword}" 검색 결과` : '근처 맛집'}
        </Text>
        
        {restaurants.length === 0 ? (
          <View style={NearbyStyles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color="#C7C7CC" />
            <Text style={NearbyStyles.emptyText}>
              {searchKeyword ? '검색 결과가 없습니다' : '근처에 맛집이 없습니다'}
            </Text>
            <Text style={NearbyStyles.emptySubtext}>
              {searchKeyword ? '다른 키워드로 검색해보세요' : '다른 지역에서 검색해보세요'}
            </Text>
          </View>
        ) : (
          restaurants.map((restaurant) => (
            <View key={restaurant.id} style={NearbyStyles.restaurantCard}>
              <TouchableOpacity
                style={NearbyStyles.restaurantContent}
                onPress={() => {
                  // 카드 클릭시 상세 정보 표시 (추후 구현)
                  Alert.alert(restaurant.name, `${restaurant.address}\n거리: ${restaurant.distanceFormatted}`);
                }}
              >
                <View style={NearbyStyles.restaurantHeader}>
                  <Text style={NearbyStyles.restaurantName}>{restaurant.name}</Text>
                  <View style={NearbyStyles.ratingContainer}>
                    {renderStars(restaurant.rating)}
                    <Text style={NearbyStyles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                  </View>
                </View>
                
                <View style={NearbyStyles.restaurantInfo}>
                  <View style={NearbyStyles.categoryContainer}>
                    <Text style={NearbyStyles.categoryText}>{restaurant.category}</Text>
                  </View>
                  <View style={NearbyStyles.distanceContainer}>
                    <Ionicons name="location-outline" size={16} color="#8E8E93" />
                    <Text style={NearbyStyles.distanceText}>{restaurant.distanceFormatted}</Text>
                  </View>
                </View>
                
                <Text style={NearbyStyles.addressText}>
                  {restaurant.roadAddress || restaurant.address}
                </Text>
              </TouchableOpacity>
              
              {/* 지도 미리보기 썸네일 */}
              <TouchableOpacity
                style={NearbyStyles.mapThumbnailContainer}
                onPress={async () => {
                  const address = restaurant.roadAddress || restaurant.address;
                  const encodedAddress = encodeURIComponent(address);
                  const webUrl = `https://map.kakao.com/link/search/${encodedAddress}`;
                  
                  try {
                    const supported = await Linking.canOpenURL(webUrl);
                    if (supported) {
                      await Linking.openURL(webUrl);
                    } else {
                      Alert.alert('안내', '카카오맵을 브라우저에서 열어주세요.');
                    }
                  } catch (error) {
                    Alert.alert('오류', '카카오맵을 열 수 없습니다. 브라우저에서 직접 검색해주세요.');
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={NearbyStyles.mapThumbnail}>
                  <Ionicons name="map" size={60} color="#C7C7CC" />
                  <Text style={NearbyStyles.mapThumbnailText}>지도에서 보기</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {showMap && selectedRestaurant && (
        <RestaurantMap
          restaurant={selectedRestaurant}
          onClose={closeMap}
        />
      )}
    </ScrollView>
  );
} 
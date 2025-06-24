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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationService } from '../services/locationService';
import { NearbyStyles } from '../styles/NearbyStyles';
import RestaurantMap from '../components/RestaurantMap';
import { RestaurantListItem } from '../components/RestaurantListItem';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';

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
  const {
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
    onRefresh,
    handleSearch,
  } = useNearbyRestaurants();
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [distanceSort, setDistanceSort] = useState<'asc' | 'desc' | null>('asc');
  const [ratingSort, setRatingSort] = useState<'asc' | 'desc' | null>(null);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 정렬된 레스토랑 목록
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    // 거리순 정렬이 우선
    if (distanceSort) {
      const distanceDiff = distanceSort === 'asc' ? a.distance - b.distance : b.distance - a.distance;
      if (distanceDiff !== 0) return distanceDiff;
    }
    
    // 거리가 같으면 별점순 정렬
    if (ratingSort) {
      return ratingSort === 'asc' ? b.rating - a.rating : a.rating - b.rating;
    }
    
    return 0;
  });

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
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
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
                    handleSearch();
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

        <View style={NearbyStyles.sortContainer}>
          <Text style={NearbyStyles.sortLabel}>정렬:</Text>
          <View style={NearbyStyles.sortButtons}>
            <TouchableOpacity
              style={NearbyStyles.sortButton}
              onPress={() => setShowDistanceModal(true)}
            >
              <Ionicons 
                name="location" 
                size={16} 
                color="#007AFF" 
              />
              <Text style={NearbyStyles.sortButtonText}>
                {distanceSort === 'asc' ? '가까운 순' : distanceSort === 'desc' ? '먼 순' : '거리순'}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={16} 
                color="#007AFF" 
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={NearbyStyles.sortButton}
              onPress={() => setShowRatingModal(true)}
            >
              <Ionicons 
                name="star" 
                size={16} 
                color="#007AFF" 
              />
              <Text style={NearbyStyles.sortButtonText}>
                {ratingSort === 'asc' ? '별점 높은 순' : ratingSort === 'desc' ? '별점 낮은 순' : '별점순'}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={16} 
                color="#007AFF" 
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
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
          sortedRestaurants.map((restaurant) => (
            <RestaurantListItem
              key={restaurant.id}
              restaurant={restaurant}
              onPress={setSelectedRestaurant}
              onCall={callRestaurant}
              onMap={openMap}
            />
          ))
        )}
      </View>

      {showMap && selectedRestaurant && (
        <RestaurantMap
          restaurant={selectedRestaurant}
          onClose={closeMap}
        />
      )}

      {/* 거리 정렬 모달 */}
      <Modal
        visible={showDistanceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDistanceModal(false)}
      >
        <TouchableOpacity 
          style={NearbyStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDistanceModal(false)}
        >
          <View style={NearbyStyles.modalContent}>
            <View style={NearbyStyles.modalHeader}>
              <Text style={NearbyStyles.modalTitle}>거리순 정렬</Text>
              <TouchableOpacity onPress={() => setShowDistanceModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={NearbyStyles.sortOptions}>
              <TouchableOpacity
                style={[
                  NearbyStyles.sortOption,
                  distanceSort === 'asc' && NearbyStyles.sortOptionActive
                ]}
                onPress={() => {
                  setDistanceSort('asc');
                  setShowDistanceModal(false);
                }}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={distanceSort === 'asc' ? "#fff" : "#007AFF"} 
                />
                <Text style={[
                  NearbyStyles.sortOptionText,
                  distanceSort === 'asc' && NearbyStyles.sortOptionTextActive
                ]}>
                  가까운 순
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  NearbyStyles.sortOption,
                  distanceSort === 'desc' && NearbyStyles.sortOptionActive
                ]}
                onPress={() => {
                  setDistanceSort('desc');
                  setShowDistanceModal(false);
                }}
              >
                <Ionicons 
                  name="arrow-down" 
                  size={20} 
                  color={distanceSort === 'desc' ? "#fff" : "#007AFF"} 
                />
                <Text style={[
                  NearbyStyles.sortOptionText,
                  distanceSort === 'desc' && NearbyStyles.sortOptionTextActive
                ]}>
                  먼 순
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 별점 정렬 모달 */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <TouchableOpacity 
          style={NearbyStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRatingModal(false)}
        >
          <View style={NearbyStyles.modalContent}>
            <View style={NearbyStyles.modalHeader}>
              <Text style={NearbyStyles.modalTitle}>별점순 정렬</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={NearbyStyles.sortOptions}>
              <TouchableOpacity
                style={[
                  NearbyStyles.sortOption,
                  ratingSort === 'asc' && NearbyStyles.sortOptionActive
                ]}
                onPress={() => {
                  setRatingSort('asc');
                  setShowRatingModal(false);
                }}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={ratingSort === 'asc' ? "#fff" : "#007AFF"} 
                />
                <Text style={[
                  NearbyStyles.sortOptionText,
                  ratingSort === 'asc' && NearbyStyles.sortOptionTextActive
                ]}>
                  별점 높은 순
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  NearbyStyles.sortOption,
                  ratingSort === 'desc' && NearbyStyles.sortOptionActive
                ]}
                onPress={() => {
                  setRatingSort('desc');
                  setShowRatingModal(false);
                }}
              >
                <Ionicons 
                  name="arrow-down" 
                  size={20} 
                  color={ratingSort === 'desc' ? "#fff" : "#007AFF"} 
                />
                <Text style={[
                  NearbyStyles.sortOptionText,
                  ratingSort === 'desc' && NearbyStyles.sortOptionTextActive
                ]}>
                  별점 낮은 순
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
} 
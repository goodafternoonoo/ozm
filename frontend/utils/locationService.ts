import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { KakaoApiService } from '../services/kakaoApiService';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export class LocationService {
  /**
   * 위치 권한을 요청하고 현재 위치를 가져옵니다
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      console.log('📍 위치 권한 요청 시작...');
      
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 위치 권한 상태:', status);
      
      if (status !== 'granted') {
        console.log('❌ 위치 권한이 거부됨');
        Alert.alert(
          '위치 권한 필요',
          '맛집 추천을 위해 위치 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        return null;
      }

      console.log('✅ 위치 권한 승인됨, 현재 위치 가져오기 시작...');

      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10초로 증가
        distanceInterval: 10,
      });

      console.log('📍 위치 정보:', location.coords);
      console.log('📍 위치 정확도:', location.coords.accuracy);
      console.log('📍 위치 타임스탬프:', new Date(location.timestamp).toLocaleString());

      // 카카오 API를 사용하여 주소 정보 가져오기 (우선 시도)
      let address = '';
      try {
        console.log('📍 카카오 API로 주소 변환 시도...');
        const kakaoAddress = await KakaoApiService.getAddressFromCoordinates(
          location.coords.latitude,
          location.coords.longitude
        );
        
        if (kakaoAddress) {
          address = kakaoAddress;
          console.log('✅ 카카오 API 주소:', address);
        }
      } catch (error) {
        console.log('❌ 카카오 API 주소 변환 실패:', error);
      }

      // 카카오 API가 실패하면 Expo Location의 reverseGeocode 사용
      if (!address) {
        try {
          console.log('📍 Expo Location으로 주소 변환 시도...');
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          console.log('📍 Expo Location 주소 변환 결과:', reverseGeocode);
          
          if (reverseGeocode.length > 0) {
            const place = reverseGeocode[0];
            const addressParts = [
              place.country,
              place.region,
              place.city,
              place.district,
              place.street,
              place.name
            ].filter(Boolean);
            
            address = addressParts.join(' ');
            
            // 주소가 너무 길면 축약
            if (address.length > 50) {
              address = addressParts.slice(-3).join(' '); // 마지막 3개 부분만 사용
            }
            console.log('✅ Expo Location 주소:', address);
          }
        } catch (error) {
          console.log('❌ Expo Location 주소 변환 실패:', error);
        }
      }
      
      // 주소가 없으면 좌표로 대체
      if (!address) {
        address = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
        console.log('📍 좌표로 주소 대체:', address);
      }

      const result = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      };
      
      console.log('✅ 최종 위치 데이터:', result);
      return result;
    } catch (error) {
      console.error('❌ 위치 가져오기 실패:', error);
      Alert.alert(
        '위치 오류',
        '현재 위치를 가져올 수 없습니다. GPS가 켜져 있는지 확인해주세요.',
        [{ text: '확인' }]
      );
      return null;
    }
  }

  /**
   * 주소를 동/구 단위로 축약합니다
   */
  static formatAddressToDistrict(address: string): string {
    if (!address) return '';
    
    // 한국 주소 패턴에 맞게 동/구 추출
    const districtPatterns = [
      /([가-힣]+구)/, // XX구
      /([가-힣]+동)/, // XX동
      /([가-힣]+읍)/, // XX읍
      /([가-힣]+면)/, // XX면
    ];
    
    for (const pattern of districtPatterns) {
      const match = address.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // 패턴에 맞지 않으면 첫 번째 공백까지 사용
    const firstPart = address.split(' ')[0];
    return firstPart || address;
  }

  /**
   * 두 지점 간의 거리를 계산합니다 (미터 단위)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * 거리를 사람이 읽기 쉬운 형태로 변환합니다
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * 위치 기반 맛집 추천을 위한 더미 데이터 (실제로는 API에서 가져올 예정)
   */
  static getNearbyRestaurants(latitude: number, longitude: number) {
    // 실제로는 API 호출로 대체될 예정
    const dummyRestaurants = [
      {
        id: 1,
        name: '맛있는 김치찌개',
        category: '한식',
        distance: this.calculateDistance(latitude, longitude, latitude + 0.001, longitude + 0.001),
        rating: 4.5,
        address: '서울시 강남구 테헤란로 123',
        image: null,
      },
      {
        id: 2,
        name: '신선한 초밥',
        category: '일식',
        distance: this.calculateDistance(latitude, longitude, latitude + 0.002, longitude - 0.001),
        rating: 4.3,
        address: '서울시 강남구 역삼동 456',
        image: null,
      },
      {
        id: 3,
        name: '크리미 파스타',
        category: '양식',
        distance: this.calculateDistance(latitude, longitude, latitude - 0.001, longitude + 0.002),
        rating: 4.7,
        address: '서울시 강남구 삼성동 789',
        image: null,
      },
    ];

    return dummyRestaurants
      .map(restaurant => ({
        ...restaurant,
        distanceFormatted: this.formatDistance(restaurant.distance),
      }))
      .sort((a, b) => a.distance - b.distance);
  }
} 
import axios from 'axios';
import { KAKAO_API_CONFIG } from '../config/api';

// 카카오 JavaScript 키 (웹/앱에서 사용)
const KAKAO_API_KEY = KAKAO_API_CONFIG.JAVASCRIPT_KEY;

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  place_url: string;
  distance: string;
  x: string; // longitude
  y: string; // latitude
}

interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export class KakaoApiService {
  private static baseURL = KAKAO_API_CONFIG.BASE_URL;

  // CORS 우회를 위한 프록시 서버 사용 (선택사항)
  private static corsProxy = 'https://cors-anywhere.herokuapp.com/';
  // 대안 프록시 서버들
  private static corsProxyAlternatives = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  // 맛집 검색 (카테고리: 음식점)
  static async searchRestaurants(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    page: number = 1
  ): Promise<KakaoPlace[]> {
    try {
      // 방법 1: 직접 호출 (CORS 문제 가능성)
      const response = await axios.get<KakaoSearchResponse>(
        `${this.baseURL}/search/category.json`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          params: {
            category_group_code: 'FD6', // 음식점 카테고리 코드
            x: longitude,
            y: latitude,
            radius: radius,
            page: page,
            size: 15,
            sort: 'distance' // 거리순 정렬
          }
        }
      );

      return response.data.documents;
    } catch (error) {
      console.error('카카오 API 직접 호출 실패:', error);
      
      // 방법 2: CORS 프록시 사용 (백업)
      try {
        console.log('CORS 프록시를 통해 재시도...');
        const proxyResponse = await axios.get<KakaoSearchResponse>(
          `${this.corsProxy}${this.baseURL}/search/category.json`,
          {
            headers: {
              'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            params: {
              category_group_code: 'FD6',
              x: longitude,
              y: latitude,
              radius: radius,
              page: page,
              size: 15,
              sort: 'distance'
            }
          }
        );
        
        return proxyResponse.data.documents;
      } catch (proxyError) {
        console.error('프록시 호출도 실패:', proxyError);
        throw new Error('맛집 검색에 실패했습니다. 카카오 API 키와 도메인 설정을 확인해주세요.');
      }
    }
  }

  // 키워드로 맛집 검색
  static async searchRestaurantsByKeyword(
    keyword: string,
    latitude: number,
    longitude: number,
    radius: number = 1000,
    page: number = 1
  ): Promise<KakaoPlace[]> {
    try {
      const response = await axios.get<KakaoSearchResponse>(
        `${this.baseURL}/search/keyword.json`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          params: {
            query: keyword,
            category_group_code: 'FD6', // 음식점 카테고리 코드
            x: longitude,
            y: latitude,
            radius: radius,
            page: page,
            size: 15,
            sort: 'distance'
          }
        }
      );

      return response.data.documents;
    } catch (error) {
      console.error('카카오 API 키워드 검색 실패:', error);
      
      // CORS 프록시 사용 (백업)
      try {
        console.log('CORS 프록시를 통해 재시도...');
        const proxyResponse = await axios.get<KakaoSearchResponse>(
          `${this.corsProxy}${this.baseURL}/search/keyword.json`,
          {
            headers: {
              'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            params: {
              query: keyword,
              category_group_code: 'FD6',
              x: longitude,
              y: latitude,
              radius: radius,
              page: page,
              size: 15,
              sort: 'distance'
            }
          }
        );
        
        return proxyResponse.data.documents;
      } catch (proxyError) {
        console.error('프록시 호출도 실패:', proxyError);
        throw new Error('맛집 검색에 실패했습니다. 카카오 API 키와 도메인 설정을 확인해주세요.');
      }
    }
  }

  // 주소를 좌표로 변환
  static async getCoordinatesFromAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}/search/address.json`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          params: {
            query: address
          }
        }
      );

      if (response.data.documents.length > 0) {
        const doc = response.data.documents[0];
        return {
          latitude: parseFloat(doc.y),
          longitude: parseFloat(doc.x)
        };
      }
      return null;
    } catch (error) {
      console.error('주소 변환 실패:', error);
      return null;
    }
  }

  // 좌표를 주소로 변환
  static async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}/geo/coord2address.json`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          params: {
            x: longitude,
            y: latitude
          }
        }
      );

      if (response.data.documents.length > 0) {
        const doc = response.data.documents[0];
        return doc.address?.address_name || doc.road_address?.address_name || null;
      }
      return null;
    } catch (error) {
      console.error('좌표 변환 실패:', error);
      return null;
    }
  }

  // 거리 계산 (미터 단위)
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // 거리를 읽기 쉬운 형태로 변환
  static formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }
} 
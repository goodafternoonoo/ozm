// 카카오 맵 JavaScript API를 사용한 대안 서비스
// 이 방법은 웹에서만 작동하며, React Native에서는 제한적입니다.

export class KakaoMapService {
  private static isKakaoMapLoaded = false;

  // 카카오 맵 JavaScript API 로드
  static async loadKakaoMapAPI(): Promise<void> {
    if (this.isKakaoMapLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=011fde08b6dca27806cb9186f2f75e3b&libraries=services`;
      script.onload = () => {
        this.isKakaoMapLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 장소 검색 (카카오 맵 JavaScript API 사용)
  static async searchPlaces(keyword: string, latitude: number, longitude: number, radius: number = 1000) {
    try {
      await this.loadKakaoMapAPI();
      
      // 카카오 맵 JavaScript API의 장소 검색 서비스 사용
      const places = new (window as any).kakao.maps.services.Places();
      
      return new Promise((resolve, reject) => {
        const callback = (result: any, status: any) => {
          if (status === (window as any).kakao.maps.services.Status.OK) {
            resolve(result);
          } else {
            reject(new Error('장소 검색 실패'));
          }
        };

        const options = {
          location: new (window as any).kakao.maps.LatLng(latitude, longitude),
          radius: radius,
          sort: (window as any).kakao.maps.services.SortBy.DISTANCE
        };

        places.keywordSearch(keyword, callback, options);
      });
    } catch (error) {
      console.error('카카오 맵 API 검색 실패:', error);
      throw error;
    }
  }

  // 카테고리 검색
  static async searchByCategory(latitude: number, longitude: number, category: string, radius: number = 1000) {
    try {
      await this.loadKakaoMapAPI();
      
      const places = new (window as any).kakao.maps.services.Places();
      
      return new Promise((resolve, reject) => {
        const callback = (result: any, status: any) => {
          if (status === (window as any).kakao.maps.services.Status.OK) {
            resolve(result);
          } else {
            reject(new Error('카테고리 검색 실패'));
          }
        };

        const options = {
          location: new (window as any).kakao.maps.LatLng(latitude, longitude),
          radius: radius,
          sort: (window as any).kakao.maps.services.SortBy.DISTANCE
        };

        places.categorySearch(category, callback, options);
      });
    } catch (error) {
      console.error('카카오 맵 API 카테고리 검색 실패:', error);
      throw error;
    }
  }
} 
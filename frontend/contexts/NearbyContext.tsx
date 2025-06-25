import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { LocationService, LocationData } from '../services/locationService';
import { KakaoApiService } from '../services/kakaoApiService';
import { logLocation, logError, LogCategory } from '../utils/logger';
import { LOCATION, SEARCH } from '../constants';

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

interface NearbyContextType {
    location: LocationData | null;
    restaurants: Restaurant[];
    loading: boolean;
    refreshing: boolean;
    locationPermission: 'granted' | 'denied' | 'loading';
    searchKeyword: string;
    setSearchKeyword: (keyword: string) => void;
    searchRadius: number;
    setSearchRadius: React.Dispatch<React.SetStateAction<number>>;
    currentPage: number;
    hasMoreData: boolean;
    loadingMore: boolean;
    getCurrentLocation: () => Promise<void>;
    searchNearbyRestaurants: (
        latitude: number,
        longitude: number,
        page?: number,
        reset?: boolean,
        sortBy?: 'distance' | 'distance_desc'
    ) => Promise<void>;
    loadMoreRestaurants: () => Promise<void>;
    refreshRestaurants: () => Promise<void>;
    searchByKeyword: (keyword: string) => Promise<void>;
}

const NearbyContext = createContext<NearbyContextType | undefined>(undefined);

interface NearbyProviderProps {
    children: ReactNode;
}

export const NearbyProvider: React.FC<NearbyProviderProps> = ({ children }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'loading'>('loading');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchRadius, setSearchRadius] = useState(LOCATION.RADIUS.DEFAULT);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);

    const searchNearbyRestaurants = useCallback(async (
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
            logError(LogCategory.LOCATION, 'searchNearbyRestaurants 에러', error as Error);
        }
    }, [searchKeyword, searchRadius]);

    const getCurrentLocation = useCallback(async () => {
        logLocation('getCurrentLocation 호출됨');
        setLoading(true);
        try {
            logLocation('LocationService.getCurrentLocation() 호출...');
            const currentLocation = await LocationService.getCurrentLocation();
            logLocation('LocationService 결과', { currentLocation });
            
            if (currentLocation) {
                logLocation('위치 정보 설정', { currentLocation });
                setLocation(currentLocation);
                setLocationPermission('granted');
                logLocation('맛집 검색 시작...');
                // 초기 검색 시 페이지 리셋
                setCurrentPage(1);
                setHasMoreData(true);
                await searchNearbyRestaurants(currentLocation.latitude, currentLocation.longitude, 1, true);
            } else {
                logLocation('위치 정보 없음, 권한 거부됨');
                setLocationPermission('denied');
            }
        } catch (error) {
            logError(LogCategory.LOCATION, 'getCurrentLocation 에러', error as Error);
            setLocationPermission('denied');
        } finally {
            setLoading(false);
            logLocation('getCurrentLocation 완료');
        }
    }, [searchNearbyRestaurants]);

    const loadMoreRestaurants = useCallback(async () => {
        if (!location || loadingMore || !hasMoreData) return;

        setLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            await searchNearbyRestaurants(location.latitude, location.longitude, nextPage, false);
            setCurrentPage(nextPage);
        } catch (error) {
            logError(LogCategory.LOCATION, 'loadMoreRestaurants 에러', error as Error);
        } finally {
            setLoadingMore(false);
        }
    }, [location, loadingMore, hasMoreData, currentPage, searchNearbyRestaurants]);

    const refreshRestaurants = useCallback(async () => {
        if (!location) return;

        setRefreshing(true);
        try {
            setCurrentPage(1);
            setHasMoreData(true);
            await searchNearbyRestaurants(location.latitude, location.longitude, 1, true);
        } catch (error) {
            logError(LogCategory.LOCATION, 'refreshRestaurants 에러', error as Error);
        } finally {
            setRefreshing(false);
        }
    }, [location, searchNearbyRestaurants]);

    const searchByKeyword = useCallback(async (keyword: string) => {
        if (!location) return;

        setSearchKeyword(keyword);
        setCurrentPage(1);
        setHasMoreData(true);
        await searchNearbyRestaurants(location.latitude, location.longitude, 1, true);
    }, [location, searchNearbyRestaurants]);

    const value = {
        location,
        restaurants,
        loading,
        refreshing,
        locationPermission,
        searchKeyword,
        setSearchKeyword,
        searchRadius,
        setSearchRadius,
        currentPage,
        hasMoreData,
        loadingMore,
        getCurrentLocation,
        searchNearbyRestaurants,
        loadMoreRestaurants,
        refreshRestaurants,
        searchByKeyword,
    };

    return (
        <NearbyContext.Provider value={value}>
            {children}
        </NearbyContext.Provider>
    );
};

export const useNearbyRestaurants = (): NearbyContextType => {
    const context = useContext(NearbyContext);
    if (context === undefined) {
        throw new Error('useNearbyRestaurants must be used within a NearbyProvider');
    }
    return context;
}; 
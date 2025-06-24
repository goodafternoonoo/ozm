import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RestaurantMapProps {
    restaurant: {
        name: string;
        address: string;
        roadAddress?: string;
        latitude?: number;
        longitude?: number;
    };
    onClose: () => void;
}

export default function RestaurantMap({
    restaurant,
    onClose,
}: RestaurantMapProps) {
    const openKakaoMap = async () => {
        try {
            const address = restaurant.roadAddress || restaurant.address;
            const encodedAddress = encodeURIComponent(address);

            // 카카오맵 앱으로 열기
            const kakaoMapUrl = `kakaomap://look?p=${encodedAddress}`;
            const webUrl = `https://map.kakao.com/link/search/${encodedAddress}`;

            const canOpen = await Linking.canOpenURL(kakaoMapUrl);

            if (canOpen) {
                await Linking.openURL(kakaoMapUrl);
            } else {
                // 카카오맵 앱이 없으면 웹으로 열기
                await Linking.openURL(webUrl);
            }
        } catch (error) {
            console.error('카카오맵 열기 실패:', error);
            Alert.alert('오류', '카카오맵을 열 수 없습니다.');
        }
    };

    const openDirections = async () => {
        try {
            const address = restaurant.roadAddress || restaurant.address;
            const encodedAddress = encodeURIComponent(address);

            // 네이비게이션 앱으로 길찾기
            const directionsUrl = `https://map.kakao.com/link/to/${encodedAddress}`;

            await Linking.openURL(directionsUrl);
        } catch (error) {
            console.error('길찾기 실패:', error);
            Alert.alert('오류', '길찾기를 열 수 없습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Ionicons name='location' size={20} color='#007AFF' />
                    <Text style={styles.title}>{restaurant.name}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name='close' size={24} color='#8E8E93' />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.mapPlaceholder}>
                    <Ionicons name='map' size={80} color='#C7C7CC' />
                    <Text style={styles.mapPlaceholderText}>지도 미리보기</Text>
                    <Text style={styles.mapPlaceholderSubtext}>
                        카카오맵 앱에서 정확한 위치를 확인하세요
                    </Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons
                            name='location-outline'
                            size={20}
                            color='#8E8E93'
                        />
                        <Text style={styles.infoText}>
                            {restaurant.roadAddress || restaurant.address}
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={openKakaoMap}
                        >
                            <Ionicons
                                name='map-outline'
                                size={20}
                                color='#007AFF'
                            />
                            <Text style={styles.buttonText}>
                                카카오맵에서 보기
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.directionsButton}
                            onPress={openDirections}
                        >
                            <Ionicons
                                name='navigate'
                                size={20}
                                color='#007AFF'
                            />
                            <Text style={styles.buttonText}>길찾기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: '#fff',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginLeft: 8,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mapPlaceholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 16,
    },
    mapPlaceholderSubtext: {
        fontSize: 14,
        color: '#C7C7CC',
        marginTop: 8,
        textAlign: 'center',
    },
    infoContainer: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        color: '#3A3A3C',
        marginLeft: 12,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mapButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    directionsButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F2F7',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
});

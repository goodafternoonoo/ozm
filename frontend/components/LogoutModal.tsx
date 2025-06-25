import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cookies from 'js-cookie';
import { logApi, LogCategory } from '../utils/logger';

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onLogoutSuccess: () => void; // 로그아웃 성공 시 호출할 함수
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
    visible,
    onClose,
    onLogoutSuccess,
}) => {
    const handleLogoutWithCache = () => {
        logApi(LogCategory.API, '캐싱 유지하고 로그아웃');
        // JWT 토큰만 삭제, 카카오 토큰은 유지 (캐싱)
        AsyncStorage.removeItem('jwt_token');
        // 쿠키에서 삭제
        Cookies.remove('ozm_nickname');
        Cookies.remove('ozm_email');
        onClose();
        onLogoutSuccess();
        Alert.alert('로그아웃 완료', '로그아웃되었습니다. (캐싱 유지)');
    };

    const handleLogoutWithoutCache = () => {
        logApi(LogCategory.API, '캐싱 삭제하고 로그아웃');
        // 모든 토큰 삭제
        AsyncStorage.removeItem('jwt_token');
        AsyncStorage.removeItem('kakao_access_token'); // 캐싱된 토큰도 삭제
        // 쿠키에서 삭제
        Cookies.remove('ozm_nickname');
        Cookies.remove('ozm_email');
        onClose();
        onLogoutSuccess();
        Alert.alert('로그아웃 완료', '로그아웃되었습니다. (캐싱 삭제)');
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 24,
                    margin: 20,
                    minWidth: 300,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}>
                    {/* 모달 헤더 */}
                    <View style={{
                        alignItems: 'center',
                        marginBottom: 20,
                    }}>
                        <View style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: '#FF6B35',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 12,
                        }}>
                            <Ionicons name="log-out-outline" size={24} color="white" />
                        </View>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: 8,
                        }}>
                            로그아웃
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            color: '#666',
                            textAlign: 'center',
                            lineHeight: 20,
                        }}>
                            캐싱된 토큰을 어떻게 처리하시겠습니까?
                        </Text>
                    </View>

                    {/* 버튼들 */}
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#FF6B35',
                                paddingVertical: 14,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                            onPress={handleLogoutWithoutCache}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: '600',
                            }}>
                                캐싱 삭제
                            </Text>
                            <Text style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: 12,
                                marginTop: 2,
                            }}>
                                다음 로그인 시 새로 인증
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#F3F4F6',
                                paddingVertical: 14,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                            onPress={handleLogoutWithCache}
                        >
                            <Text style={{
                                color: '#374151',
                                fontSize: 16,
                                fontWeight: '600',
                            }}>
                                캐싱 유지
                            </Text>
                            <Text style={{
                                color: '#6B7280',
                                fontSize: 12,
                                marginTop: 2,
                            }}>
                                빠른 재로그인 가능
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                            onPress={onClose}
                        >
                            <Text style={{
                                color: '#6B7280',
                                fontSize: 14,
                            }}>
                                취소
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}; 
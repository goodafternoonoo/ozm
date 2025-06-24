import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { LoginScreenStyles } from '../styles/LoginScreenStyles';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { KAKAO_API_CONFIG } from '@/config/api';
import Cookies from 'js-cookie';

const KAKAO_REST_API_KEY = KAKAO_API_CONFIG.RESTAPI_KEY;
const KAKAO_CLIENT_SECRET = KAKAO_API_CONFIG.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8081/oauth/callback'; // localhost용

const LoginScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [userInfo, setUserInfo] = useState<{
        nickname?: string;
        email?: string;
    } | null>(null);

    useEffect(() => {
        // 메시지 리스너 등록 (콜백 창에서 보내는 메시지 처리)
        const handleMessage = async (event: MessageEvent) => {
            if (event.data.type === 'KAKAO_LOGIN_SUCCESS' && event.data.code) {
                await handleKakaoTokenExchange(event.data.code);
            } else if (event.data.type === 'KAKAO_LOGIN_ERROR') {
                setLoading(false);
                Alert.alert('인증 실패', '카카오 인증 중 오류가 발생했습니다.');
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleKakaoTokenExchange = async (code: string) => {
        try {
            // code로 access_token 교환 (Client Secret 포함)
            const tokenResponse = await axios.post(
                'https://kauth.kakao.com/oauth/token',
                {
                    grant_type: 'authorization_code',
                    client_id: KAKAO_REST_API_KEY,
                    client_secret: KAKAO_CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    code: code,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const accessToken = tokenResponse.data.access_token;

            // 백엔드로 access_token 전송하여 로그인
            const loginResponse = await axios.post(
                'http://localhost:8000/api/v1/auth/kakao-login',
                {
                    access_token: accessToken,
                }
            );

            // 응답 구조에 맞게 파싱
            const { access_token, user } = loginResponse.data?.data || {};
            // TODO: AsyncStorage.setItem('jwt_token', access_token);

            // 사용자 정보 설정 (백엔드에서 받은 정보 또는 카카오에서 직접 조회)
            setUserInfo({
                nickname: user?.nickname || '사용자',
                email: user?.email || '이메일 없음',
            });

            // 쿠키에 저장
            Cookies.set('ozm_nickname', user?.nickname || '사용자', {
                expires: 7,
            });
            Cookies.set('ozm_email', user?.email || '이메일 없음', {
                expires: 7,
            });

            setLoginSuccess(true);
            Alert.alert('로그인 성공', '카카오 로그인이 완료되었습니다!');
        } catch (error) {
            console.error('카카오 로그인 에러:', error);
            Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setLoginSuccess(false);
        setUserInfo(null);
        // TODO: AsyncStorage.removeItem('jwt_token');
        // 쿠키에서 삭제
        Cookies.remove('ozm_nickname');
        Cookies.remove('ozm_email');
        Alert.alert('로그아웃', '로그아웃되었습니다.');
    };

    useEffect(() => {
        // 페이지 새로고침 시 쿠키에서 사용자 정보 복원
        const nickname = Cookies.get('ozm_nickname');
        const email = Cookies.get('ozm_email');
        if (nickname && email) {
            setUserInfo({ nickname, email });
            setLoginSuccess(true);
        }
    }, []);

    const handleKakaoLogin = async () => {
        setLoading(true);
        try {
            // 카카오 인증 요청 (code 받기)
            const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(
                REDIRECT_URI
            )}`;

            await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI, {
                showInRecents: false,
                createTask: false,
            });
        } catch (error) {
            console.error('카카오 인증 에러:', error);
            Alert.alert('인증 실패', '카카오 인증 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={LoginScreenStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* 로그인 완료 표시 */}
            {loginSuccess && (
                <View style={LoginScreenStyles.loginSuccessBadge}>
                    <Text style={LoginScreenStyles.loginSuccessBadgeText}>
                        카톡 로그인완료
                    </Text>
                </View>
            )}

            <View style={LoginScreenStyles.form}>
                {!loginSuccess ? (
                    <>
                        {/* 환영 메시지 */}
                        <View style={LoginScreenStyles.welcomeContainer}>
                            <View style={LoginScreenStyles.welcomeIcon}>
                                <Ionicons
                                    name='restaurant'
                                    size={80}
                                    color='#FF6B35'
                                />
                            </View>
                            <Text style={LoginScreenStyles.welcomeText}>
                                냠냠이에 오신 것을 환영합니다!
                            </Text>
                            <Text style={LoginScreenStyles.welcomeSubtext}>
                                카카오 계정으로 간편하게 로그인하고{'\n'}
                                맛있는 음식을 추천받아보세요
                            </Text>
                        </View>

                        {/* 로그인 버튼 */}
                        <TouchableOpacity
                            style={[
                                LoginScreenStyles.kakaoLoginButton,
                                loading &&
                                    LoginScreenStyles.kakaoLoginButtonDisabled,
                            ]}
                            onPress={handleKakaoLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <View
                                    style={LoginScreenStyles.loadingContainer}
                                >
                                    <Ionicons
                                        name='refresh'
                                        size={20}
                                        color='#3C1E1E'
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={LoginScreenStyles.loadingText}>
                                        로그인 중...
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <Ionicons
                                        name='chatbubble-ellipses'
                                        size={20}
                                        color='#3C1E1E'
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={
                                            LoginScreenStyles.kakaoLoginButtonText
                                        }
                                    >
                                        카카오로 로그인
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    // 사용자 정보 (로그인 후)
                    <View style={LoginScreenStyles.userInfoContainer}>
                        {/* 사용자 프로필 */}
                        <View style={LoginScreenStyles.userProfileCard}>
                            <View style={LoginScreenStyles.userAvatar}>
                                <Ionicons
                                    name='person'
                                    size={40}
                                    color='#FF6B35'
                                />
                            </View>
                            <Text style={LoginScreenStyles.userName}>
                                {userInfo?.nickname || '사용자'}
                            </Text>
                            <Text style={LoginScreenStyles.userEmail}>
                                {userInfo?.email || '이메일 없음'}
                            </Text>
                            <View
                                style={LoginScreenStyles.loginStatusContainer}
                            >
                                <Ionicons
                                    name='checkmark-circle'
                                    size={16}
                                    color='#10B981'
                                />
                                <Text style={LoginScreenStyles.loginStatusText}>
                                    카카오 계정으로 로그인됨
                                </Text>
                            </View>
                        </View>

                        {/* 로그아웃 버튼 */}
                        <TouchableOpacity
                            style={LoginScreenStyles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={LoginScreenStyles.logoutButtonText}>
                                로그아웃
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

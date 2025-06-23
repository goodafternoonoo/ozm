import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LoginScreenStyles } from '../styles/LoginScreenStyles';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { KAKAO_API_CONFIG } from '@/config/api';

const KAKAO_REST_API_KEY = KAKAO_API_CONFIG.RESTAPI_KEY;
const KAKAO_CLIENT_SECRET = KAKAO_API_CONFIG.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8081/oauth/callback'; // localhost용

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<{nickname?: string, email?: string} | null>(null);

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
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: KAKAO_REST_API_KEY,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = tokenResponse.data.access_token;

      // 백엔드로 access_token 전송하여 로그인
      const loginResponse = await axios.post('http://localhost:8000/api/v1/auth/kakao-login', {
        access_token: accessToken,
      });

      // JWT 토큰 저장
      const jwtToken = loginResponse.data.access_token;
      // TODO: AsyncStorage.setItem('jwt_token', jwtToken);
      
      // 사용자 정보 설정 (백엔드에서 받은 정보 또는 카카오에서 직접 조회)
      setUserInfo({
        nickname: loginResponse.data.user?.nickname || '사용자',
        email: loginResponse.data.user?.email || '이메일 없음'
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
    Alert.alert('로그아웃', '로그아웃되었습니다.');
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      // 카카오 인증 요청 (code 받기)
      const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      
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
        <View style={{
          position: 'absolute',
          top: 50,
          right: 20,
          backgroundColor: '#4CD964',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          zIndex: 1000,
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            카톡 로그인완료
          </Text>
        </View>
      )}
      
      <View style={LoginScreenStyles.form}>
        {!loginSuccess ? (
          // 로그인 버튼 (로그인 전)
          <TouchableOpacity
            style={{
              backgroundColor: '#FEE500',
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleKakaoLogin}
            disabled={loading}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#3C1E1E" style={{ marginRight: 8 }} />
            <Text style={{ color: '#3C1E1E', fontWeight: 'bold', fontSize: 16 }}>
              {loading ? '로그인 중...' : '카카오로 로그인'}
            </Text>
          </TouchableOpacity>
        ) : (
          // 사용자 정보 (로그인 후)
          <View style={{
            alignItems: 'center',
            marginTop: 16,
          }}>
            {/* 사용자 프로필 */}
            <View style={{
              backgroundColor: '#F7F7F7',
              borderRadius: 12,
              padding: 20,
              width: '100%',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#FEE500',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Ionicons name="person" size={30} color="#3C1E1E" />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1C1C1E',
                marginBottom: 4,
              }}>
                {userInfo?.nickname || '사용자'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 8,
              }}>
                {userInfo?.email || '이메일 없음'}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark-circle" size={16} color="#4CD964" />
                <Text style={{
                  fontSize: 12,
                  color: '#4CD964',
                  marginLeft: 4,
                }}>
                  카카오 계정으로 로그인됨
                </Text>
              </View>
            </View>
            
            {/* 로그아웃 버튼 */}
            <TouchableOpacity
              style={{
                backgroundColor: '#FF3B30',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: 'center',
              }}
              onPress={handleLogout}
            >
              <Text style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
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
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cookies from 'js-cookie';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from './login';
import { LoginScreenStyles } from '../styles/LoginScreenStyles';

const ProfileScreen: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<{
        nickname?: string;
        email?: string;
    } | null>(null);

    useEffect(() => {
        const checkLogin = async () => {
            const token = await AsyncStorage.getItem('jwt_token');
            const nickname = Cookies.get('ozm_nickname');
            const email = Cookies.get('ozm_email');
            if (token && nickname && email) {
                setIsLoggedIn(true);
                setUserInfo({ nickname, email });
            } else {
                setIsLoggedIn(false);
                setUserInfo(null);
            }
        };
        checkLogin();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('jwt_token');
        Cookies.remove('ozm_nickname');
        Cookies.remove('ozm_email');
        setIsLoggedIn(false);
        setUserInfo(null);
        Alert.alert('로그아웃', '로그아웃되었습니다.');
    };

    if (!isLoggedIn) {
        return <LoginScreen />;
    }

    return (
        <View style={LoginScreenStyles.container}>
            <View style={LoginScreenStyles.userInfoContainer}>
                <View style={LoginScreenStyles.userProfileCard}>
                    <View style={LoginScreenStyles.userAvatar}>
                        <Ionicons name='person' size={40} color='#FF6B35' />
                    </View>
                    <Text style={LoginScreenStyles.userName}>
                        {userInfo?.nickname || '사용자'}
                    </Text>
                    <Text style={LoginScreenStyles.userEmail}>
                        {userInfo?.email || '이메일 없음'}
                    </Text>
                    <View style={LoginScreenStyles.loginStatusContainer}>
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
                <TouchableOpacity
                    style={LoginScreenStyles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={LoginScreenStyles.logoutButtonText}>
                        로그아웃
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProfileScreen;

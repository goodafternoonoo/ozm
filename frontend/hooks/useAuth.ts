import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cookies from 'js-cookie';

export interface UserInfo {
    nickname?: string;
    email?: string;
}

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
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
        } catch (error) {
            console.error('로그인 상태 확인 에러:', error);
            setIsLoggedIn(false);
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('jwt_token');
            Cookies.remove('ozm_nickname');
            Cookies.remove('ozm_email');
            setIsLoggedIn(false);
            setUserInfo(null);
        } catch (error) {
            console.error('로그아웃 에러:', error);
        }
    };

    return {
        isLoggedIn,
        userInfo,
        loading,
        checkLoginStatus,
        logout,
    };
}

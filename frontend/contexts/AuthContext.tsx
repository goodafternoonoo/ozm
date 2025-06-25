import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cookies from 'js-cookie';
import { logAuth, logError, LogCategory } from '../utils/logger';

export interface UserInfo {
    nickname?: string;
    email?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    userInfo: UserInfo | null;
    loading: boolean;
    login: (userData: UserInfo) => void;
    logout: () => void;
    checkLoginStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const checkLoginStatus = useCallback(async () => {
        try {
            logAuth('로그인 상태 확인 시도');
            const token = await AsyncStorage.getItem('jwt_token');
            const nickname = Cookies.get('ozm_nickname');
            const email = Cookies.get('ozm_email');

            const newIsLoggedIn = !!(token && nickname && email);

            setIsLoggedIn(newIsLoggedIn);
            if (newIsLoggedIn) {
                setUserInfo({ nickname, email });
                logAuth('로그인 상태 확인됨', { nickname, email });
            } else {
                setUserInfo(null);
                logAuth('로그인되지 않은 상태');
            }
        } catch (error) {
            logError(LogCategory.AUTH, '로그인 상태 확인 에러', error as Error);
            setIsLoggedIn(false);
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((userData: UserInfo) => {
        logAuth('로그인 처리', { userData });
        setIsLoggedIn(true);
        setUserInfo(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            logAuth('로그아웃 시도');
            await AsyncStorage.removeItem('jwt_token');
            Cookies.remove('ozm_nickname');
            Cookies.remove('ozm_email');
            setIsLoggedIn(false);
            setUserInfo(null);
            logAuth('로그아웃 완료');
        } catch (error) {
            logError(LogCategory.AUTH, '로그아웃 에러', error as Error);
        }
    }, []);

    useEffect(() => {
        checkLoginStatus();

        // 주기적으로 로그인 상태 확인 (5초마다)
        const interval = setInterval(checkLoginStatus, 5000);

        return () => clearInterval(interval);
    }, [checkLoginStatus]);

    const value = {
        isLoggedIn,
        userInfo,
        loading,
        login,
        logout,
        checkLoginStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

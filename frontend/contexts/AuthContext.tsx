import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cookies from 'js-cookie';

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

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            const nickname = Cookies.get('ozm_nickname');
            const email = Cookies.get('ozm_email');

            const newIsLoggedIn = !!(token && nickname && email);

            setIsLoggedIn(newIsLoggedIn);
            if (newIsLoggedIn) {
                setUserInfo({ nickname, email });
            } else {
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

    const login = (userData: UserInfo) => {
        setIsLoggedIn(true);
        setUserInfo(userData);
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

    useEffect(() => {
        checkLoginStatus();

        // 주기적으로 로그인 상태 확인 (5초마다)
        const interval = setInterval(checkLoginStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    const value = {
        isLoggedIn,
        userInfo,
        loading,
        login,
        logout,
        checkLoginStatus,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

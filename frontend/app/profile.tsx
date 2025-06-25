import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from './login';
import { LoginScreenStyles } from '../styles/LoginScreenStyles';
import { LogoutModal } from '../components/LogoutModal';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen: React.FC = () => {
    const { isLoggedIn, userInfo, logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutSuccess = () => {
        logout(); // useAuth의 logout 함수 호출
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
                    onPress={() => setShowLogoutModal(true)}
                >
                    <Text style={LoginScreenStyles.logoutButtonText}>
                        로그아웃
                    </Text>
                </TouchableOpacity>
            </View>

            <LogoutModal
                visible={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onLogoutSuccess={handleLogoutSuccess}
            />
        </View>
    );
};

export default ProfileScreen;

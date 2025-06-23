import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LoginScreenStyles } from '../../styles/LoginScreenStyles';

export default function OAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('인증 처리 중...');

  useEffect(() => {
    // URL에서 code 추출 (웹 환경에서만 동작)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        setStatus('success');
        setMessage('카카오 인증이 완료되었습니다!');
        
        // 부모 창으로 메시지 전송 후 창 닫기
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'KAKAO_LOGIN_SUCCESS', code }, '*');
          }
          window.close();
        }, 1000);
      } else {
        setStatus('error');
        setMessage('인증 코드를 받지 못했습니다.');
        
        // 에러 시에도 창 닫기
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'KAKAO_LOGIN_ERROR' }, '*');
          }
          window.close();
        }, 2000);
      }
    }
  }, []);

  return (
    <View style={LoginScreenStyles.container}>
      <View style={LoginScreenStyles.form}>
        {status === 'loading' && (
          <ActivityIndicator size="large" color="#007AFF" />
        )}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          color: status === 'success' ? '#4CD964' : status === 'error' ? '#FF3B30' : '#007AFF',
          marginTop: 16,
        }}>
          {message}
        </Text>
        {status === 'success' && (
          <Text style={{
            fontSize: 14,
            textAlign: 'center',
            color: '#666',
            marginTop: 8,
          }}>
            잠시 후 창이 자동으로 닫힙니다...
          </Text>
        )}
      </View>
    </View>
  );
} 
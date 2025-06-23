import { useEffect } from 'react';

export default function OAuthCallback() {
  useEffect(() => {
    // URL에서 code 추출 (웹 환경에서만 동작)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        // 부모 창으로 메시지 전송 후 창 닫기
        if (window.opener) {
          window.opener.postMessage({ type: 'KAKAO_LOGIN_SUCCESS', code }, '*');
        }
        window.close();
      } else {
        // 에러 시에도 창 닫기
        if (window.opener) {
          window.opener.postMessage({ type: 'KAKAO_LOGIN_ERROR' }, '*');
        }
        window.close();
      }
    }
  }, []);

  // 아무것도 렌더링하지 않음
  return null;
} 
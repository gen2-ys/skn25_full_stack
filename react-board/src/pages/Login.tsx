import React, { useState } from 'react';
import './Auth.css';

interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }

      const data = await response.json();
      
      // JWT 토큰과 사용자 정보를 로컬 스토리지에 저장합니다.
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', data.username);
      }

      alert('로그인 성공!');
      
      // 모달 닫기 함수 실행
      if (onSuccess) {
        onSuccess();
      }

      // 화면 갱신 엇박자 문제를 해결하기 위해 페이지를 강제로 새로고침합니다.
      window.location.reload(); 

    } catch (error: any) {
      console.error('로그인 오류:', error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">로그인</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          
          <div className="auth-input-group">
            <label htmlFor="login-username">아이디</label>
            <input
              type="text"
              id="login-username"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-password">비밀번호</label>
            <input
              type="password"
              id="login-password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {errorMessage && (
            <div className="error-message" style={{ textAlign: 'center', marginTop: '10px' }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-auth-submit">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
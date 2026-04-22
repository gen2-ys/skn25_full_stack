import React, { useState } from 'react';
import './Auth.css';

// 부모 컴포넌트(App.tsx)에서 모달을 닫기 위해 전달할 수 있는 콜백 함수를 정의한다.
interface SignupProps {
  onSuccess?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // 기존 에러 메시지 초기화
    
    // 1. 프론트엔드 측 유효성 검사
    if (!username || !email || !password || !passwordConfirm) {
      setErrorMessage('모든 항목을 입력해야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 2. 백엔드 API 서버로 POST 요청 전송
    try {

      const response = await fetch('/api/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      // 3. 서버 응답 처리
      if (!response.ok) {
        // 서버에서 400(Bad Request) 등의 에러를 반환한 경우
        const errorData = await response.json();
        // Django 측에서 전달한 에러 메시지를 화면에 출력하도록 처리한다.
        throw new Error(errorData.detail || errorData.message || '회원가입에 실패했습니다.');
      }

      // 4. 회원가입 성공 시 처리
      alert('회원가입이 완료되었습니다.');
      
      // 폼 초기화
      setUsername('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');

      // 부모 컴포넌트에서 onSuccess 함수를 전달받았다면 실행한다 (예: 모달 닫기).
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('회원가입 API 호출 오류:', error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">회원가입</h2>
        <form className="auth-form" onSubmit={handleSignup}>
          
          <div className="auth-input-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용할 아이디를 입력하세요"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              type="password"
              id="passwordConfirm"
              className="auth-input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {/* 에러 발생 시 폼 하단에 붉은색 글씨로 메시지를 출력한다. */}
          {errorMessage && (
            <div className="error-message" style={{ textAlign: 'center', marginTop: '10px' }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-auth-submit">가입하기</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
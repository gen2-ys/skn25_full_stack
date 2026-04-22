import React, { useState, useEffect } from 'react';
import './App.css';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PostList from './pages/PostList';

const App: React.FC = () => {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    alert('로그아웃 되었습니다.');
  };

  return (
    <div className="app-container">
      <header className="top-navbar">
        
        {/* onClick 이벤트와 마우스 포인터 스타일을 추가합니다 */}
        <div 
                className="logo-area" 
                onClick={() => window.location.href = '/'} 
                style={{ cursor: 'pointer' }}
                >
            <span className="logo">SKN25</span>
            <span className="site-title">게시판</span>
        </div>

        <div className="user-menu">
          <span>랭킹</span>
          <span>최근이력</span>
          {isLoggedIn ? (
            <>
              <span style={{ fontWeight: 'bold' }}>{username}님 환영합니다</span>
              <span onClick={handleLogout} style={{ fontWeight: 'bold', cursor: 'pointer', color: '#dc3545' }}>
                로그아웃
              </span>
            </>
          ) : (
            <>
              <span onClick={() => setIsLoginModalOpen(true)} style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                로그인
              </span>
              <span onClick={() => setIsSignupModalOpen(true)} style={{ fontWeight: 'bold', color: '#66d9ef', cursor: 'pointer' }}>
                회원가입
              </span>
            </>
          )}
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <nav>
            <ul className="menu-list">
              <li className="active">질문과답변</li>
              <li>자유게시판</li>
              <li>버그및건의</li>
            </ul>
          </nav>
        </aside>

        <main className="board-content">
          {/* PostList 컴포넌트에 isLoggedIn 속성을 전달하도록 수정되었습니다. */}
          <PostList isLoggedIn={isLoggedIn} />
        </main>
      </div>

      {isSignupModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSignupModalOpen(false)}>
          <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsSignupModalOpen(false)}>&times;</button>
            <Signup onSuccess={() => setIsSignupModalOpen(false)} />
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsLoginModalOpen(false)}>&times;</button>
            <Login onSuccess={() => {
              setIsLoginModalOpen(false);
              setIsLoggedIn(true);
              setUsername(localStorage.getItem('username'));
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import PostTable from '../components/PostTable';
import type { Post } from '../components/PostTable';
import Pagination from '../components/Pagination';
import PostForm from '../components/PostForm';
import PostDetail from '../components/PostDetail';

interface PostListProps {
  isLoggedIn: boolean;
}

const PostList: React.FC<PostListProps> = ({ isLoggedIn }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 화면 전환을 위한 상태 관리
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const fetchPosts = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setErrorMessage('로그인이 필요한 서비스입니다.');
      setPosts([]);
      return;
    }

    try {
      // 백엔드의 페이징 설정(5개)에 맞춰 요청을 보냅니다.
      const response = await fetch(`/api/questions/?page=${currentPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      
      // 목록 데이터 저장
      setPosts(data.results || []); 
      
      // 전체 데이터 개수를 5로 나누어 전체 페이지 수를 정확히 계산합니다.
      const totalCount = data.count || 0;
      setTotalPages(Math.ceil(totalCount / 5));
      setErrorMessage('');

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);
    }
  };

  // 페이지 번호나 로그인 상태가 변경될 때마다 데이터를 다시 불러옵니다.
  useEffect(() => {
    fetchPosts();
  }, [currentPage, isLoggedIn]);

  // 1. 글쓰기 모드일 때의 렌더링
  if (isWriting) {
    return (
      <PostForm 
        onSuccess={() => {
          setIsWriting(false);
          setCurrentPage(1); // 첫 페이지로 이동하여 새 글 확인
          fetchPosts();
        }} 
        onCancel={() => setIsWriting(false)} 
      />
    );
  }

  // 2. 상세 보기 모드일 때의 렌더링
  if (selectedPostId) {
    return (
      <PostDetail 
        id={selectedPostId} 
        onBack={() => setSelectedPostId(null)} 
        onDeleteSuccess={() => {
          setSelectedPostId(null);
          fetchPosts(); // 삭제 후 목록 갱신
        }}
      />
    );
  }

  // 3. 기본 목록 화면 렌더링
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>질문과답변</h2>
        <button 
          onClick={() => {
            const token = localStorage.getItem('access_token');
            if (!token) {
              alert("로그인이 필요합니다.");
              return;
            }
            setIsWriting(true);
          }} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#66d9ef', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          글쓰기
        </button>
      </div>

      {errorMessage ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
          {errorMessage}
        </div>
      ) : (
        <>
          <PostTable 
            posts={posts} 
            onPostClick={(id) => setSelectedPostId(id)} 
          />
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </>
      )}
    </div>
  );
};

export default PostList;
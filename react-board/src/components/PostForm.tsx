import React, { useState } from 'react';

interface PostFormProps {
  onSuccess: () => void; // 글 작성 성공 시 목록으로 돌아가기 위한 함수
  onCancel: () => void;  // 취소 시 목록으로 돌아가기 위한 함수
}

const PostForm: React.FC<PostFormProps> = ({ onSuccess, onCancel }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      setErrorMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      // 백엔드의 질문 생성 API(POST) 호출
      const response = await fetch('/api/questions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // JWT 토큰 포함
        },
        body: JSON.stringify({
          subject: subject,
          content: content
        })
      });

      if (!response.ok) {
        throw new Error('게시글 등록에 실패했습니다.');
      }

      alert('게시글이 성공적으로 등록되었습니다.');
      onSuccess(); // 성공 시 부모 컴포넌트에 알려 화면 전환 및 목록 갱신

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #343a40', paddingBottom: '10px' }}>
        새 질문 등록
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="subject" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>제목</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box' }}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="content" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', padding: '10px', height: '200px', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
            placeholder="내용을 입력하세요"
          />
        </div>

        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            취소
          </button>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
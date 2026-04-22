import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface CommentType {
  id: number;
  author_name: string;
  content: string;
  create_date: string;
}

interface AnswerType {
  id: number;
  author_name: string;
  content: string;
  create_date: string;
  voter_count: number;
  comment_set: CommentType[];
}

interface PostDetailData {
  id: number;
  subject: string;
  content: string;
  author_name: string;
  create_date: string;
  voter_count: number;
  answer_set: AnswerType[];
  comment_set: CommentType[];
}

interface PostDetailProps {
  id: number;
  onBack: () => void;
  onDeleteSuccess: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ id, onBack, onDeleteSuccess }) => {
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 작성 폼 상태
  const [answerContent, setAnswerContent] = useState('');
  const [questionComment, setQuestionComment] = useState('');
  const [answerComments, setAnswerComments] = useState<{ [key: number]: string }>({});
  
  // 수정 모드 상태 (본문)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionSubject, setEditQuestionSubject] = useState('');
  const [editQuestionContent, setEditQuestionContent] = useState('');

  // 수정 모드 상태 (답변)
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');

  // 수정 모드 상태 (댓글)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  
  const currentUsername = localStorage.getItem('username');
  const token = localStorage.getItem('access_token');

  const fetchPost = useCallback(async () => {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/questions/${id}/`, { headers });
      if (!response.ok) throw new Error('게시글을 가져오는 데 실패했습니다.');
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error(error);
      alert('데이터 로드 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  /* ================= API 통신 함수: 본문 ================= */
  const handleVoteQuestion = async () => {
    if (!token) return alert('로그인이 필요합니다.');
    try {
      const response = await fetch(`/api/questions/${id}/vote/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (response.ok) {
        fetchPost();
      } else {
        alert('추천 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('본문을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/questions/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('본문이 삭제되었습니다.');
        onDeleteSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editQuestionSubject.trim() || !editQuestionContent.trim()) return alert('제목과 내용을 입력하십시오.');
    try {
      const response = await fetch(`/api/questions/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ subject: editQuestionSubject, content: editQuestionContent })
      });
      if (response.ok) {
        setIsEditingQuestion(false);
        fetchPost();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= API 통신 함수: 답변 ================= */
  const handleCreateAnswer = async () => {
    if (!token) return alert('로그인이 필요합니다.');
    if (!answerContent.trim()) return alert('답변 내용을 입력해야 합니다.');
    try {
      const response = await fetch(`/api/answers/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: id, content: answerContent })
      });
      if (response.ok) {
        setAnswerContent('');
        fetchPost();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    if (!window.confirm('답변을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/answers/${answerId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateAnswer = async (answerId: number) => {
    if (!editAnswerContent.trim()) return alert('답변 내용을 입력하십시오.');
    try {
      const response = await fetch(`/api/answers/${answerId}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editAnswerContent })
      });
      if (response.ok) {
        setEditingAnswerId(null);
        fetchPost();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoteAnswer = async (answerId: number) => {
    if (!token) return alert('로그인이 필요합니다.');
    try {
      const response = await fetch(`/api/answers/${answerId}/vote/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (response.ok) {
        fetchPost();
      } else {
        alert('추천 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= API 통신 함수: 댓글 ================= */
  const handleCreateComment = async (targetType: 'question' | 'answer', targetId: number) => {
    if (!token) return alert('로그인이 필요합니다.');
    
    let content = '';
    let bodyData = {};
    
    if (targetType === 'question') {
      content = questionComment;
      bodyData = { question: targetId, content: content };
    } else {
      content = answerComments[targetId] || '';
      bodyData = { answer: targetId, content: content };
    }

    if (!content.trim()) return alert('댓글 내용을 입력해야 합니다.');

    try {
      const response = await fetch(`/api/comments/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (response.ok) {
        if (targetType === 'question') setQuestionComment('');
        else setAnswerComments(prev => ({ ...prev, [targetId]: '' }));
        fetchPost();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/comments/${commentId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editCommentContent.trim()) return alert('댓글 내용을 입력하십시오.');
    try {
      const response = await fetch(`/api/comments/${commentId}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentContent })
      });
      if (response.ok) {
        setEditingCommentId(null);
        fetchPost();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= 렌더링 ================= */
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;
  if (!post) return <div style={{ padding: '20px', textAlign: 'center' }}>해당 게시글을 찾을 수 없습니다.</div>;

  const isQuestionAuthor = currentUsername === post.author_name;

  return (
    <div style={{ padding: '30px', backgroundColor: '#ffffff', border: '1px solid #dee2e6', textAlign: 'left', borderRadius: '8px' }}>
      
      {/* 1. 본문 영역 */}
      {isEditingQuestion ? (
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            value={editQuestionSubject} 
            onChange={(e) => setEditQuestionSubject(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '1.2rem', boxSizing: 'border-box' }}
          />
          <textarea 
            value={editQuestionContent} 
            onChange={(e) => setEditQuestionContent(e.target.value)} 
            style={{ width: '100%', height: '200px', padding: '10px', boxSizing: 'border-box' }}
          />
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button onClick={handleUpdateQuestion} style={{ padding: '8px 16px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', marginRight: '5px', borderRadius: '4px' }}>저장</button>
            <button onClick={() => setIsEditingQuestion(false)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>취소</button>
          </div>
        </div>
      ) : (
        <>
          <h2 style={{ borderBottom: '2px solid #343a40', paddingBottom: '15px', marginTop: 0 }}>{post.subject}</h2>
          <div style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '10px 15px', borderRadius: '4px' }}>
            <span>작성자: <strong>{post.author_name}</strong> | 작성일: {new Date(post.create_date).toLocaleString()}</span>
          </div>
          
          <div style={{ minHeight: '150px', marginBottom: '20px', lineHeight: '1.6', overflowWrap: 'break-word', color: '#212529' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
            <button onClick={handleVoteQuestion} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#ffffff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
              추천 {post.voter_count}
            </button>
            {isQuestionAuthor && (
              <>
                <button onClick={() => { setIsEditingQuestion(true); setEditQuestionSubject(post.subject); setEditQuestionContent(post.content); }} style={{ padding: '8px 16px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>수정</button>
                <button onClick={handleDeleteQuestion} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#ffffff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>삭제</button>
              </>
            )}
            <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#ffffff', border: 'none', cursor: 'pointer', marginLeft: 'auto', borderRadius: '4px' }}>
              목록으로
            </button>
          </div>
        </>
      )}

      {/* 2. 본문 댓글 영역 */}
      <div style={{ marginBottom: '40px', borderTop: '1px dotted #cccccc', paddingTop: '15px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#495057' }}>본문 댓글</h4>
        {post.comment_set.map((comment) => (
          <div key={comment.id} style={{ fontSize: '14px', padding: '8px 0', borderBottom: '1px solid #eeeeee' }}>
            {editingCommentId === comment.id ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} style={{ flex: 1, padding: '5px' }} />
                <button onClick={() => handleUpdateComment(comment.id)} style={{ padding: '5px 10px', cursor: 'pointer' }}>저장</button>
                <button onClick={() => setEditingCommentId(null)} style={{ padding: '5px 10px', cursor: 'pointer' }}>취소</button>
              </div>
            ) : (
              <>
                <span>{comment.content}</span>
                <span style={{ color: '#888888', marginLeft: '10px', fontSize: '12px' }}>- {comment.author_name}, {new Date(comment.create_date).toLocaleString()}</span>
                {currentUsername === comment.author_name && (
                  <span style={{ marginLeft: '10px' }}>
                    <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); }} style={{ border: 'none', background: 'none', color: '#0d6efd', cursor: 'pointer', fontSize: '12px' }}>수정</button>
                    <button onClick={() => handleDeleteComment(comment.id)} style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px', marginLeft: '8px' }}>삭제</button>
                  </span>
                )}
              </>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', marginTop: '15px' }}>
          <input type="text" value={questionComment} onChange={(e) => setQuestionComment(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }} placeholder="본문에 대한 댓글을 입력하십시오" />
          <button onClick={() => handleCreateComment('question', post.id)} style={{ padding: '8px 16px', marginLeft: '5px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>등록</button>
        </div>
      </div>

      {/* 3. 답변 목록 영역 */}
      <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginTop: '50px' }}>{post.answer_set.length}개의 답변이 존재합니다.</h3>
      {post.answer_set.map((answer) => (
        <div key={answer.id} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef', paddingTop: '15px' }}>
          {editingAnswerId === answer.id ? (
            <div style={{ marginBottom: '15px' }}>
              <textarea value={editAnswerContent} onChange={(e) => setEditAnswerContent(e.target.value)} style={{ width: '100%', height: '100px', padding: '10px', boxSizing: 'border-box' }} />
              <div style={{ marginTop: '5px' }}>
                <button onClick={() => handleUpdateAnswer(answer.id)} style={{ padding: '5px 10px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', marginRight: '5px', borderRadius: '4px' }}>저장</button>
                <button onClick={() => setEditingAnswerId(null)} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>취소</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '15px', lineHeight: '1.6', overflowWrap: 'break-word', color: '#212529' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {answer.content}
                </ReactMarkdown>
              </div>
              
              <div style={{ fontSize: '13px', color: '#666666', marginBottom: '15px' }}>
                작성자: {answer.author_name} | {new Date(answer.create_date).toLocaleString()}
                {currentUsername === answer.author_name && (
                  <span style={{ marginLeft: '15px' }}>
                    <button onClick={() => { setEditingAnswerId(answer.id); setEditAnswerContent(answer.content); }} style={{ border: 'none', background: 'none', color: '#0d6efd', cursor: 'pointer' }}>수정</button>
                    <button onClick={() => handleDeleteAnswer(answer.id)} style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', marginLeft: '8px' }}>삭제</button>
                  </span>
                )}
              </div>
              <button onClick={() => handleVoteAnswer(answer.id)} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '12px', borderRadius: '4px' }}>
                추천 {answer.voter_count}
              </button>
            </>
          )}

          {/* 답변 댓글 영역 */}
          <div style={{ marginTop: '20px', paddingLeft: '15px', borderLeft: '3px solid #e9ecef' }}>
            {answer.comment_set.map(comment => (
               <div key={comment.id} style={{ fontSize: '13px', padding: '5px 0' }}>
                 {editingCommentId === comment.id ? (
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                      <input type="text" value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} style={{ flex: 1, padding: '3px' }} />
                      <button onClick={() => handleUpdateComment(comment.id)} style={{ cursor: 'pointer' }}>저장</button>
                      <button onClick={() => setEditingCommentId(null)} style={{ cursor: 'pointer' }}>취소</button>
                    </div>
                 ) : (
                   <>
                    <span>{comment.content}</span> <span style={{ color: '#888888', fontSize: '11px', marginLeft: '5px' }}>- {comment.author_name}</span>
                    {currentUsername === comment.author_name && (
                      <span style={{ marginLeft: '10px' }}>
                        <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); }} style={{ border: 'none', background: 'none', color: '#0d6efd', cursor: 'pointer', fontSize: '11px' }}>수정</button>
                        <button onClick={() => handleDeleteComment(comment.id)} style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '11px', marginLeft: '8px' }}>삭제</button>
                      </span>
                    )}
                   </>
                 )}
               </div>
            ))}
            <div style={{ display: 'flex', marginTop: '10px' }}>
              <input type="text" value={answerComments[answer.id] || ''} onChange={(e) => setAnswerComments(prev => ({ ...prev, [answer.id]: e.target.value }))} style={{ flex: 1, padding: '6px', fontSize: '12px', border: '1px solid #ced4da', borderRadius: '4px' }} placeholder="답변에 대한 댓글을 입력하십시오" />
              <button onClick={() => handleCreateComment('answer', answer.id)} style={{ padding: '6px 12px', marginLeft: '5px', fontSize: '12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>댓글 등록</button>
            </div>
          </div>
        </div>
      ))}

      {/* 4. 답변 작성 폼 */}
      <div style={{ 
        marginTop: '60px', 
        paddingTop: '30px', 
        borderTop: '2px solid #e9ecef' 
      }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#495057' }}>
          답변 달기
        </h4>
        <textarea 
          value={answerContent} 
          onChange={(e) => setAnswerContent(e.target.value)} 
          style={{ 
            width: '100%', 
            height: '120px', 
            padding: '15px', 
            boxSizing: 'border-box',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '1rem',
            resize: 'vertical'
          }} 
          placeholder="새로운 답변을 작성하십시오. (마크다운 및 수식 적용 가능)" 
        />
        <div style={{ textAlign: 'right', marginTop: '15px' }}>
          <button 
            onClick={handleCreateAnswer} 
            style={{ 
              padding: '12px 30px', 
              backgroundColor: '#0d6efd', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.05rem'
            }}
          >
            답변 등록
          </button>
        </div>
      </div>

    </div>
  );
};

export default PostDetail;
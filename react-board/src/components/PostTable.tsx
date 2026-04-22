import React from 'react';
import './PostTable.css';

export interface Post {
  id: number;
  subject: string;
  author_name: string;
  create_date: string;
  voter_count: number;
}

interface PostTableProps {
  posts: Post[];
  onPostClick: (id: number) => void;
}

const PostTable: React.FC<PostTableProps> = ({ posts, onPostClick }) => {
  return (
    <table className="post-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #343a40', backgroundColor: '#f8f9fa' }}>
          <th style={{ padding: '10px' }}>번호</th>
          <th>제목</th>
          <th>글쓴이</th>
          <th>작성일</th>
          <th>추천수</th>
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ padding: '30px' }}>게시글이 없습니다.</td>
          </tr>
        ) : (
          posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '10px' }}>{post.id}</td>
              <td 
                style={{ textAlign: 'left', cursor: 'pointer', color: '#007bff' }}
                onClick={() => onPostClick(post.id)}
              >
                {post.subject}
              </td>
              <td>{post.author_name}</td>
              <td>{new Date(post.create_date).toLocaleDateString()}</td>
              <td>{post.voter_count}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default PostTable;
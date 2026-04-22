import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // 전체 페이지 수만큼 배열을 생성한다. (예: 5페이지면 [1, 2, 3, 4, 5])
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages === 0) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
      >
        이전
      </button>

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          style={{
            padding: '5px 10px',
            cursor: 'pointer',
            fontWeight: currentPage === number ? 'bold' : 'normal',
            backgroundColor: currentPage === number ? '#343a40' : 'white',
            color: currentPage === number ? 'white' : 'black',
            border: '1px solid #dee2e6'
          }}
        >
          {number}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
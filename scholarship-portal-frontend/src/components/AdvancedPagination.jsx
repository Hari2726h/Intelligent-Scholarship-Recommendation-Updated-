import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

/**
 * Reusable advanced pagination component
 */
const AdvancedPagination = ({ currentPage, totalPages, onPageChange, maxButtons = 5 }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(0, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <BSPagination className="justify-content-center mt-4">
      <BSPagination.First 
        onClick={() => onPageChange(0)} 
        disabled={currentPage === 0}
      />
      <BSPagination.Prev 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 0}
      />
      
      {pageNumbers[0] > 0 && (
        <>
          <BSPagination.Item onClick={() => onPageChange(0)}>1</BSPagination.Item>
          {pageNumbers[0] > 1 && <BSPagination.Ellipsis disabled />}
        </>
      )}

      {pageNumbers.map(page => (
        <BSPagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </BSPagination.Item>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && <BSPagination.Ellipsis disabled />}
          <BSPagination.Item onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </BSPagination.Item>
        </>
      )}

      <BSPagination.Next 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages - 1}
      />
      <BSPagination.Last 
        onClick={() => onPageChange(totalPages - 1)} 
        disabled={currentPage === totalPages - 1}
      />
    </BSPagination>
  );
};

export default AdvancedPagination;

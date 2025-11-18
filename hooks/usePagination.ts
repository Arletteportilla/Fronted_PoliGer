// Pagination hook - extracted from germinaciones.tsx
import { useState, useCallback } from 'react';

export const usePagination = (initialPageSize: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [usePagination, setUsePagination] = useState(false);

  const handleNextPage = useCallback(() => {
    if (hasNext && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      return currentPage + 1;
    }
    return currentPage;
  }, [hasNext, currentPage, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (hasPrevious && currentPage > 1) {
      setCurrentPage(currentPage - 1);
      return currentPage - 1;
    }
    return currentPage;
  }, [hasPrevious, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      return page;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  const togglePagination = useCallback(() => {
    setUsePagination(!usePagination);
    setCurrentPage(1); // Reset a la primera página
  }, [usePagination]);

  const updatePaginationInfo = useCallback((info: {
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
  }) => {
    setTotalPages(info.totalPages);
    setTotalCount(info.totalCount);
    setHasNext(info.hasNext);
    setHasPrevious(info.hasPrevious);
    setCurrentPage(info.currentPage);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
    setHasNext(false);
    setHasPrevious(false);
  }, []);

  return {
    currentPage,
    totalPages,
    totalCount,
    hasNext,
    hasPrevious,
    pageSize,
    usePagination,
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
    togglePagination,
    updatePaginationInfo,
    resetPagination,
    setPageSize,
  };
};
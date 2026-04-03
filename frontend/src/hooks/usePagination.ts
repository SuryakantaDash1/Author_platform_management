import { useState } from 'react';

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;
  reset: () => void;
}

export const usePagination = (
  initialPage: number = 1,
  initialLimit: number = 10
): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToNextPage = () => setPage((prev) => prev + 1);
  const goToPreviousPage = () => setPage((prev) => Math.max(1, prev - 1));
  const goToFirstPage = () => setPage(1);
  const goToLastPage = (totalPages: number) => setPage(totalPages);
  const reset = () => {
    setPage(initialPage);
    setLimit(initialLimit);
  };

  return {
    page,
    limit,
    setPage,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    reset,
  };
};

import { useState, useCallback, useMemo } from 'react';

export function usePaginationState(itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginate = useCallback(<T>(items: T[]): T[] => {
    return items.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [currentPage, itemsPerPage]);

  const totalPages = useCallback((totalItems: number): number => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [itemsPerPage]);

  const goToPage = useCallback((page: number, total: number) => {
    setCurrentPage(Math.min(Math.max(1, page), Math.ceil(total / itemsPerPage)));
  }, [itemsPerPage]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  return { currentPage, setCurrentPage, paginate, totalPages, goToPage, resetPage };
}
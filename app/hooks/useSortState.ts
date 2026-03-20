import { useState, useCallback, useMemo } from 'react';

export function useSortState<T>(defaultKey: keyof T, defaultOrder: 'asc' | 'desc' = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultOrder);

  const handleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey]);

  const sort = useCallback(<U extends T>(items: U[]): U[] => {
    return [...items].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortKey, sortOrder]);

  return { sortKey, sortOrder, handleSort, sort };
}
/**
 * usePagination — Custom hook for table pagination state.
 */
import { useState, useMemo } from 'react';

const usePagination = (data = [], pageSize = 20) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goToNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const goToPrev = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return { page, totalPages, paginatedData, goToNext, goToPrev, goToPage, pageSize };
};

export default usePagination;

import { useState } from 'react';
export function usePagination(totalItems, itemsPerPage = 20) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return { page, totalPages, setPage, nextPage: () => setPage(p => Math.min(p+1, totalPages)), prevPage: () => setPage(p => Math.max(p-1, 1)) };
}

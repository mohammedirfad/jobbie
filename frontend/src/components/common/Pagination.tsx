import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  limit?: number;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, total, limit }: Props) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const from = total && limit ? (currentPage - 1) * limit + 1 : null;
  const to = total && limit ? Math.min(currentPage * limit, total) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
      {total != null && (
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
          <span className="font-medium text-slate-700">{total}</span> results
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-slate-400 text-sm">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                page === currentPage
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

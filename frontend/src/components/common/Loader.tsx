import { cn } from '../../utils';

export const Spinner = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div className={cn(
      'rounded-full border-slate-200 border-t-brand-600 animate-spin',
      sizes[size], className
    )} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow animate-pulse-slow">
        <span className="text-white text-2xl font-black">JS</span>
      </div>
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm font-medium">Loading HireNest…</p>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl shimmer-bg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded-lg shimmer-bg w-3/4" />
        <div className="h-3 rounded-lg shimmer-bg w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 rounded-lg shimmer-bg" />
      <div className="h-3 rounded-lg shimmer-bg w-5/6" />
    </div>
    <div className="flex gap-2 pt-1">
      <div className="h-6 w-20 rounded-full shimmer-bg" />
      <div className="h-6 w-20 rounded-full shimmer-bg" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 rounded shimmer-bg" />
      </td>
    ))}
  </tr>
);

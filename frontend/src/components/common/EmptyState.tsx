import { ReactNode } from 'react';
import { cn } from '../../utils';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: Props) => (
  <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
    {icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>}
    {action}
  </div>
);

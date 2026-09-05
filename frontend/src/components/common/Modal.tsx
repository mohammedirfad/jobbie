import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-4xl',
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md', showClose = true }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl w-full animate-scale-in overflow-hidden',
        sizes[size]
      )}>
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false,
}: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; confirmText?: string; danger?: boolean; loading?: boolean;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="p-6">
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={danger ? 'btn-danger' : 'btn-primary'}
        >
          {loading ? 'Processing…' : confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

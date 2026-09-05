import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeToast } from '../../features/toast/toastSlice';
import { cn } from '../../utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error:   <AlertCircle className="w-5 h-5 text-red-500" />,
  info:    <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const styles = {
  success: 'border-l-4 border-green-500 bg-white',
  error:   'border-l-4 border-red-500 bg-white',
  info:    'border-l-4 border-blue-500 bg-white',
  warning: 'border-l-4 border-amber-500 bg-white',
};

const ToastItem = ({ id, type, message }: { id: string; type: keyof typeof icons; message: string }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(id)), 4000);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl shadow-lg min-w-[300px] max-w-sm animate-slide-up',
      styles[type]
    )}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <p className="flex-1 text-sm text-slate-700 font-medium">{message}</p>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useAppSelector(s => s.toast);
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} {...t} />)}
    </div>
  );
};

export const useToast = () => {
  const dispatch = useAppDispatch();
  return {
    success: (message: string) => dispatch({ type: 'toast/addToast', payload: { type: 'success', message } }),
    error:   (message: string) => dispatch({ type: 'toast/addToast', payload: { type: 'error',   message } }),
    info:    (message: string) => dispatch({ type: 'toast/addToast', payload: { type: 'info',    message } }),
    warning: (message: string) => dispatch({ type: 'toast/addToast', payload: { type: 'warning', message } }),
  };
};

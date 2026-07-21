import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; bar: string }> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-400',
    icon: 'text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-400',
    icon: 'text-red-500',
    bar: 'bg-red-500',
  },
  info: {
    bg: 'bg-white',
    border: 'border-mcn-blue',
    icon: 'text-mcn-blue',
    bar: 'bg-mcn-blue',
  },
};

const DURATION = 4000;

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast.id, onDismiss]);

  const colors = COLORS[toast.type];
  const Icon = ICONS[toast.type];

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} rounded-lg shadow-xl p-4 flex items-start gap-3 min-w-[320px] max-w-[420px] transition-all duration-300 ${
        exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
      }`}
      style={{ animation: exiting ? undefined : 'slideInRight 0.3s ease-out' }}
    >
      <Icon className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />
      <p className="text-sm font-medium text-mcn-charcoal flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="text-mcn-gray-400 hover:text-mcn-charcoal transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mcn-gray-200 rounded-b-lg overflow-hidden">
        <div
          className={`h-full ${colors.bar} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(2rem); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {toasts.map((toast) => (
        <div key={toast.id} className="relative">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

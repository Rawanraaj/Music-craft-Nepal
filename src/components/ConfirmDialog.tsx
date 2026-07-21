import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const buttonColor =
    type === 'danger'
      ? 'bg-mcn-red hover:bg-red-700 text-white'
      : type === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-mcn-blue hover:bg-mcn-blue-dark text-white';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-mcn-gray-200 relative animate-scaleUp">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-mcn-gray-400 hover:text-mcn-charcoal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-mcn-charcoal">{title}</h3>
        </div>
        <p className="text-sm text-mcn-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-mcn-gray-600 bg-mcn-gray-100 hover:bg-mcn-gray-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

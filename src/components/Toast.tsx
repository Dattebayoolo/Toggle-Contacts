import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  onUndo?: () => void;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast = ({ toasts, onDismiss }: ToastProps) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => {
      const d = t.duration || (t.onUndo ? 7000 : 4000);
      return setTimeout(() => {
        onDismiss(t.id);
      }, d);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-notification-area">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          {toast.type === 'error' ? (
            <AlertCircle size={18} style={{ color: '#EF4444' }} />
          ) : (
            <CheckCircle2 size={18} style={{ color: '#34D399' }} />
          )}

          <span style={{ flex: 1 }}>{toast.message}</span>

          {toast.onUndo && (
            <button
              className="toast-undo-btn"
              onClick={() => {
                toast.onUndo?.();
                onDismiss(toast.id);
              }}
            >
              Undo
            </button>
          )}

          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

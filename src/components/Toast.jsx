import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }
        .toast-item {
          pointer-events: auto;
          min-width: 320px;
          max-width: 480px;
          background: #fff;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          gap: 14px;
          animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        .toast-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: var(--oxford);
        }
        .toast-item.success::before { background: #10b981; }
        .toast-item.error::before { background: #ef4444; }
        .toast-item.warning::before { background: #f59e0b; }
        .toast-item.info::before { background: #3b82f6; }

        .toast-item.success { background: #f0fdf4; border-color: #bbf7d0; }
        .toast-item.error { background: #fef2f2; border-color: #fecaca; }
        .toast-item.warning { background: #fffbeb; border-color: #fef3c7; }
        .toast-item.info { background: #eff6ff; border-color: #bfdbfe; }

        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-exit {
          animation: toastSlideOut 0.3s ease-in forwards;
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
        
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(0,0,0,0.1);
          width: 100%;
        }
        .toast-progress-bar {
          height: 100%;
          background: rgba(0,0,0,0.1);
          animation: progress linear forwards;
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ message, type, duration, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle style={{ color: '#10b981' }} size={22} />,
    error: <AlertCircle style={{ color: '#ef4444' }} size={22} />,
    warning: <AlertTriangle style={{ color: '#f59e0b' }} size={22} />,
    info: <Info style={{ color: '#3b82f6' }} size={22} />,
  };

  return (
    <div className={`toast-item ${type} ${exiting ? 'toast-exit' : ''}`}>
      <div style={{ flexShrink: 0 }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{message}</p>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          padding: 6,
          cursor: 'pointer',
          color: '#9ca3af',
          borderRadius: '50%',
          display: 'flex',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <X size={16} />
      </button>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms` }} />
      </div>
    </div>
  );
};

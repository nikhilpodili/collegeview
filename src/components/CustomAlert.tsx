import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface CustomAlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  glass?: boolean;
  className?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ 
  type = 'info', 
  title, 
  children, 
  onClose, 
  glass = false,
  className = ''
}) => {
  const variants = {
    success: {
      icon: <CheckCircle size={20} />,
      color: '#10b981',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#15803d',
    },
    error: {
      icon: <AlertCircle size={20} />,
      color: '#ef4444',
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#b91c1c',
    },
    warning: {
      icon: <AlertTriangle size={20} />,
      color: '#f59e0b',
      bg: '#fffbeb',
      border: '#fef3c7',
      text: '#b45309',
    },
    info: {
      icon: <Info size={20} />,
      color: '#3b82f6',
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1d4ed8',
    }
  };

  const style = variants[type] || variants.info;

  return (
    <div 
      className={`custom-alert ${type} ${className}`}
      style={{
        display: 'flex',
        gap: '14px',
        padding: '16px 20px',
        borderRadius: '12px',
        border: `1px solid ${style.border}`,
        backgroundColor: glass ? 'rgba(255, 255, 255, 0.7)' : style.bg,
        backdropFilter: glass ? 'blur(10px)' : 'none',
        color: style.text,
        boxShadow: glass ? '0 8px 32px 0 rgba(31, 38, 135, 0.07)' : 'none',
        position: 'relative',
        transition: 'all 0.2s ease',
        animation: 'alertIn 0.3s ease-out'
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px', color: style.color }}>
        {style.icon}
      </div>
      
      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '15px', 
            fontWeight: 700, 
            color: style.text 
          }}>
            {title}
          </h4>
        )}
        <div style={{ fontSize: '14px', lineHeight: 1.5, fontWeight: 500 }}>
          {children}
        </div>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: style.text,
            opacity: 0.6,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.05)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
        >
          <X size={16} />
        </button>
      )}

      <style>{`
        @keyframes alertIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export { CustomAlert };
export default CustomAlert;

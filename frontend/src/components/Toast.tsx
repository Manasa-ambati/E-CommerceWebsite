import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default Toast;

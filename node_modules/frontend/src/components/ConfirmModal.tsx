import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  type = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'info': return 'btn-info';
      default: return 'btn-danger';
    }
  };

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className={`confirm-modal-header ${type}`}>
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-confirm ${getButtonClass()}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

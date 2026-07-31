/**
 * Modal Component
 * Accessible dialog modal overlay.
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@components/ui/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
  width = 520,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`modal-wrapper ${isOpen ? 'open' : ''}`}>
        <div className="modal" style={{ width }}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;

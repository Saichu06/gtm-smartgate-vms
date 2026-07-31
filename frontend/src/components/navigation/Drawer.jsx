/**
 * Drawer Component
 * Enterprise slide-over panel for quick forms and details inspection.
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@components/ui/Button';

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveText = 'Save Changes',
  cancelText = 'Cancel',
  loading = false,
  width = 480,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`} style={{ width }}>
        <div className="drawer-header">
          <h3 className="drawer-title">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-footer">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          {onSave && (
            <Button variant="primary" onClick={onSave} loading={loading}>
              {saveText}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;

/**
 * Dropdown Component
 * Simple dropdown menu wrapper for table actions and filters.
 */
import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ trigger, items = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '4px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 'var(--z-dropdown)',
            minWidth: '140px',
            padding: '4px 0',
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              style={{
                width: '100%',
                padding: '6px 12px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                fontSize: 'var(--text-xs)',
                color: item.danger ? 'var(--color-danger)' : 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

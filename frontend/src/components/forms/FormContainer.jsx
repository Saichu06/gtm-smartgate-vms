/**
 * FormContainer Component
 * Wraps a form section with consistent header and action bar layout.
 */
import React from 'react';

const FormContainer = ({ title, description, children, footer }) => {
  return (
    <div className="card">
      {(title || description) && (
        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          {title && <h2 className="card-title">{title}</h2>}
          {description && <p className="text-muted text-sm">{description}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer flex-end gap-2">
          {footer}
        </div>
      )}
    </div>
  );
};

export default FormContainer;

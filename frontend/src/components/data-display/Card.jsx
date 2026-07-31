/**
 * Card Component
 * Container card primitive with header, body, and footer slots.
 */
import React from 'react';

const Card = ({ title, actions, children, footer, className = '', style = {} }) => {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;

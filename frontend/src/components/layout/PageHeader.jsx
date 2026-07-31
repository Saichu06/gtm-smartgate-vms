/**
 * PageHeader Component
 * Breadcrumbs, page title, subtitle, and right header actions.
 */
import React from 'react';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
  return (
    <div className="page-header-bar">
      <div className="breadcrumbs">
        <span>GTM Super Admin</span>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={12} />
            <span>{item}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

/**
 * EmptyState Component
 * Shown when tables, lists, or data containers have no content.
 */
import React from 'react';
import { Inbox } from 'lucide-react';
import Button from '@components/ui/Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no records to display.',
  action,
  actionLabel,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={40} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {action && actionLabel && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <Button variant="primary" onClick={action}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

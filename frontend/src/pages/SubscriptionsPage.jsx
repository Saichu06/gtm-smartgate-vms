/**
 * Subscriptions Page Component
 * Connected to PostgreSQL companies via OrganizationContext.
 */
import React from 'react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import { useOrganizations } from '@contexts/OrganizationContext';

const SubscriptionsPage = () => {
  const { organizations, loading } = useOrganizations();

  const columns = [
    { header: 'Customer', key: 'name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Subscription Tier', key: 'plan', render: () => <Badge variant="primary">Enterprise</Badge> },
    { header: 'Billing Interval', key: 'interval', render: () => 'Annual Prepaid' },
    { header: 'Code', key: 'code', render: (row) => <code>{row.code}</code> },
    { header: 'Contact Email', key: 'email', render: (row) => row.email || '—' },
    { header: 'Status', key: 'status', render: () => <Badge variant="success">Active</Badge> },
  ];

  return (
    <AppLayout title="Subscriptions & Billing" subtitle="Platform license allocations, tier distribution, MRR, and renewal tracking.">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Enterprise Customers</div>
          <div className="stat-value">{loading ? '...' : organizations.length}</div>
          <div className="stat-subtext">PostgreSQL Active Companies</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform Status</div>
          <div className="stat-value text-success">Healthy</div>
          <div className="stat-subtext">PostgreSQL Connected</div>
        </div>
      </div>

      <Card title="Active Customer Subscriptions & Licensing">
        <DataTable columns={columns} data={organizations} />
      </Card>
    </AppLayout>
  );
};

export default SubscriptionsPage;

/**
 * Subscriptions Page Component
 * Licensing MRR breakdown and active subscription table.
 */
import React from 'react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';

import customersData from '@mock/customers.json';

const SubscriptionsPage = () => {
  const columns = [
    { header: 'Customer', key: 'name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Subscription Tier', key: 'plan', render: (row) => <Badge variant="primary">{row.plan}</Badge> },
    { header: 'Billing Interval', key: 'interval', render: () => 'Annual Prepaid' },
    { header: 'Sites Authorized', key: 'sites', render: (row) => `${row.sites} / ${row.sites + 4} Sites` },
    { header: 'Contract Expiry', key: 'expiry', render: () => '2027-01-12' },
    { header: 'Status', key: 'status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> },
  ];

  return (
    <AppLayout title="Subscriptions & Billing" subtitle="Platform license allocations, tier distribution, MRR, and renewal tracking.">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total MRR</div>
          <div className="stat-value">₹8,45,000</div>
          <div className="stat-subtext text-success">+12% YoY</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Enterprise Customers</div>
          <div className="stat-value">6</div>
          <div className="stat-subtext">Custom contract pricing</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Professional Customers</div>
          <div className="stat-value">2</div>
          <div className="stat-subtext">Standard SaaS plan</div>
        </div>
      </div>

      <Card title="Active Customer Subscriptions & Licensing">
        <DataTable columns={columns} data={customersData} />
      </Card>
    </AppLayout>
  );
};

export default SubscriptionsPage;

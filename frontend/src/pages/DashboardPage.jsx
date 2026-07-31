/**
 * Dashboard Page Component
 * Platform statistics, system infrastructure health, recent customers, and audit stream.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, CheckCircle, RefreshCw } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';

import dashboardData from '@mock/dashboard.json';
import customersData from '@mock/customers.json';
import auditLogsData from '@mock/auditlogs.json';

const DashboardPage = () => {
  const navigate = useNavigate();

  const customerColumns = [
    {
      header: 'Customer Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{row.code}</div>
        </div>
      ),
    },
    { header: 'Plan Tier', key: 'plan', render: (row) => <Badge variant="neutral">{row.plan}</Badge> },
    { header: 'Sites', key: 'sites', render: (row) => `${row.sites} Sites` },
    { header: 'Visitors Today', key: 'visitorsToday', render: (row) => <strong>{row.visitorsToday.toLocaleString()}</strong> },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Trial' ? 'warning' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <AppLayout title="Platform Dashboard" subtitle="Real-time operational status, system health, and customer metrics across GTM SaaS infrastructure.">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{dashboardData.totalCustomers}</div>
          <div className="stat-subtext text-success"><TrendingUp size={12} /> +2 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Tenants</div>
          <div className="stat-value text-success">{dashboardData.activeTenants}</div>
          <div className="stat-subtext">75% active enterprise licenses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Trial Tenants</div>
          <div className="stat-value text-warning">{dashboardData.trialTenants}</div>
          <div className="stat-subtext">HCL Technologies (14 days left)</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Visitors Recorded Today</div>
          <div className="stat-value">{dashboardData.visitorsToday.toLocaleString()}</div>
          <div className="stat-subtext text-success"><Activity size={12} /> Peak flow across 96 gates</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Storage Consumed</div>
          <div className="stat-value">{dashboardData.storageConsumed}</div>
          <div className="stat-subtext">AWS S3 AP-South-1 (42% quota)</div>
        </div>
      </div>

      <Card
        title="Infrastructure & Service Health"
        actions={<Button variant="secondary" size="sm" onClick={() => window.location.reload()}><RefreshCw size={12} /> Refresh Status</Button>}
      >
        <div className="health-grid">
          <div className="health-item">
            <div>
              <div className="health-title">API Gateway Cluster</div>
              <div className="health-sub">Latency: {dashboardData.systemHealth.apiGateway.latency} • {dashboardData.systemHealth.apiGateway.uptime} uptime</div>
            </div>
            <Badge variant="success"><CheckCircle size={10} /> Operational</Badge>
          </div>
          <div className="health-item">
            <div>
              <div className="health-title">PostgreSQL Primary DB</div>
              <div className="health-sub">Conn: {dashboardData.systemHealth.postgresDB.connections} • CPU: {dashboardData.systemHealth.postgresDB.cpu}</div>
            </div>
            <Badge variant="success"><CheckCircle size={10} /> Healthy</Badge>
          </div>
          <div className="health-item">
            <div>
              <div className="health-title">SMTP Mail Gateway</div>
              <div className="health-sub">Queue: {dashboardData.systemHealth.smtpGateway.queue} pending • SendGrid</div>
            </div>
            <Badge variant="success"><CheckCircle size={10} /> Operational</Badge>
          </div>
          <div className="health-item">
            <div>
              <div className="health-title">Twilio OTP Service</div>
              <div className="health-sub">Delivery Rate: {dashboardData.systemHealth.twilioOTP.deliveryRate}</div>
            </div>
            <Badge variant="success"><CheckCircle size={10} /> Operational</Badge>
          </div>
        </div>
      </Card>

      <div className="grid-cols-2-1">
        <div>
          <Card
            title="Recent Customers"
            actions={<Button variant="secondary" size="sm" onClick={() => navigate('/customers')}>View All</Button>}
          >
            <DataTable
              columns={customerColumns}
              data={customersData.slice(0, 5)}
              onRowClick={(row) => navigate(`/customers/${row.id}`)}
            />
          </Card>
        </div>

        <div>
          <Card title="Platform Audit Stream">
            {auditLogsData.map((log) => (
              <div key={log.id} style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px dashed var(--color-border)' }}>
                <div className="flex-between">
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{log.action}</span>
                  <span className="text-muted text-xs">{log.timestamp.split(' ')[1]}</span>
                </div>
                <div className="text-muted text-xs" style={{ marginTop: '2px' }}>
                  By <strong>{log.actor}</strong> for <span className="text-primary">{log.target}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;

/**
 * Customer Details Page Component
 * Overview deep-dive for a single customer tenant with 7 operational tabs.
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Tabs from '@components/navigation/Tabs';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';

import customersData from '@mock/customers.json';

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const customer = customersData.find((c) => c.id === parseInt(id, 10)) || customersData[0];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'admins', label: 'Corporate Admins' },
    { id: 'sites', label: 'Sites & Gate Kiosks' },
    { id: 'branding', label: 'Branding & Logo' },
    { id: 'subscription', label: 'Subscription & License' },
    { id: 'usage', label: 'Platform Usage' },
    { id: 'logs', label: 'Customer Audit Logs' },
  ];

  return (
    <AppLayout
      title="Customer Deep-Dive"
      subtitle="Comprehensive configuration, admins, sites, subscription, and activity overview."
      breadcrumbs={['Customers', customer.name]}
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate('/customers')}>
            <ArrowLeft size={14} /> Back to Customers
          </Button>
          <Button variant="primary" onClick={() => setIsEditOpen(true)}>
            <Edit size={14} /> Edit Customer
          </Button>
        </>
      }
    >
      <Card className="mb-5">
        <div className="flex-between">
          <div className="flex-center gap-3">
            <Avatar name={customer.name} size="lg" />
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{customer.name}</h2>
              <div className="text-muted text-sm">
                Tenant ID: <code>{customer.code}</code> • Portal: <a href={`https://${customer.subdomain}`} target="_blank" rel="noreferrer">https://{customer.subdomain}</a>
              </div>
            </div>
          </div>
          <div className="flex-center gap-2">
            <Badge variant={customer.status === 'Active' ? 'success' : 'danger'} style={{ fontSize: '12px', padding: '4px 10px' }}>
              {customer.status}
            </Badge>
            <Badge variant="primary" style={{ fontSize: '12px', padding: '4px 10px' }}>
              {customer.plan} Tier
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: 'var(--space-5)' }}>
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Active Sites</div>
                <div className="stat-value">{customer.sites}</div>
                <div className="stat-subtext">Plants & HQ Gateways</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Corporate Admins</div>
                <div className="stat-value">{customer.admins}</div>
                <div className="stat-subtext">Tenant Managers</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Visitors Today</div>
                <div className="stat-value text-success">{customer.visitorsToday.toLocaleString()}</div>
                <div className="stat-subtext">Passes Issued</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Storage Allocated</div>
                <div className="stat-value">180 GB</div>
                <div className="stat-subtext">ID Badge Scans</div>
              </div>
            </div>

            <div className="grid-2">
              <Card title="Tenant Account Info">
                <p><strong>Primary Admin Contact:</strong> {customer.email}</p>
                <p className="mt-auto" style={{ marginTop: '8px' }}><strong>Creation Date:</strong> {customer.created}</p>
                <p style={{ marginTop: '8px' }}><strong>Contract Renewal:</strong> 2027-01-12 (Annual)</p>
                <p style={{ marginTop: '8px' }}>
                  <strong>Gate API Endpoint:</strong> <code>api.gtm.com/v1/tenants/{customer.code.toLowerCase()}</code>
                </p>
              </Card>

              <Card title="Security & Policy Controls">
                <p>✔ Multi-Factor Auth Required for Corporate Admins</p>
                <p style={{ marginTop: '8px' }}>✔ Vehicle OCR Scanning Enabled</p>
                <p style={{ marginTop: '8px' }}>✔ Daily Visitor Data Auto-Archiving (S3)</p>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'admins' && (
          <DataTable
            columns={[
              { header: 'Full Name', key: 'name' },
              { header: 'Work Email', key: 'email' },
              { header: 'Assigned Site Scope', key: 'scope' },
              { header: 'Status', key: 'status', render: () => <Badge variant="success">Active</Badge> },
              { header: 'Last Login', key: 'login' },
            ]}
            data={[
              { name: 'Siddharth N.', email: 'siddharth@apollotyres.com', scope: 'All Sites (HQ)', login: '10 mins ago' },
              { name: 'Kavita Rao', email: 'k.rao@apollotyres.com', scope: 'Chennai Plant 1', login: '2 hours ago' },
            ]}
          />
        )}

        {activeTab === 'sites' && (
          <DataTable
            columns={[
              { header: 'Site Name', key: 'name' },
              { header: 'Location', key: 'location' },
              { header: 'Active Gate Kiosks', key: 'kiosks' },
              { header: 'Security Desk Lead', key: 'lead' },
              { header: 'Status', key: 'status', render: () => <Badge variant="success">Online</Badge> },
            ]}
            data={[
              { name: 'Limda Plant 1', location: 'Vadodara, Gujarat', kiosks: '6 Kiosks (OCR + Thermal)', lead: 'Mahesh Patel' },
              { name: 'Perambra Unit', location: 'Thrissur, Kerala', kiosks: '4 Kiosks', lead: 'Venkatesh K.' },
            ]}
          />
        )}

        {!['overview', 'admins', 'sites'].includes(activeTab) && (
          <Card>
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <h3>Tab Overview: {activeTab.toUpperCase()}</h3>
              <p className="text-muted text-sm" style={{ marginTop: '8px' }}>
                Enterprise tenant configuration module for {customer.name}.
              </p>
            </div>
          </Card>
        )}
      </div>

      <Drawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${customer.name}`}
        onSave={() => {
          alert('Customer saved!');
          setIsEditOpen(false);
        }}
      >
        <Input label="Company Name" defaultValue={customer.name} />
        <Input label="Admin Email" defaultValue={customer.email} />
      </Drawer>
    </AppLayout>
  );
};

export default CustomerDetailsPage;

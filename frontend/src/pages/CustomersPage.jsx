/**
 * Customers Page Component
 * Customer accounts management table with search, filters, pagination, export, and row click.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Download, RefreshCw, Search } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';

import customersData from '@mock/customers.json';

const CustomersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customersData.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesPlan = planFilter ? c.plan === planFilter : true;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const columns = [
    {
      header: 'Customer Name',
      key: 'name',
      render: (row) => (
        <div>
          <Link to={`/customers/${row.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {row.name}
          </Link>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
            {row.code} • {row.subdomain}
          </div>
        </div>
      ),
    },
    { header: 'Admin Email', key: 'email' },
    { header: 'Plan Tier', key: 'plan', render: (row) => <Badge variant="primary">{row.plan}</Badge> },
    { header: 'Sites', key: 'sites', render: (row) => `${row.sites} Sites` },
    { header: 'Admins', key: 'admins', render: (row) => `${row.admins} Admins` },
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
    { header: 'Created Date', key: 'created' },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
          <Button variant="secondary" size="xs" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${row.id}`); }}>
            Overview
          </Button>
          <Button variant="secondary" size="xs" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(row); setIsEditDrawerOpen(true); }}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      title="Customers"
      subtitle="Manage enterprise tenant accounts, subdomains, subscriptions, and corporate gate settings."
      actions={
        <Button variant="primary" onClick={() => navigate('/customers/create')}>
          <Plus size={14} /> Add Customer
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={filteredCustomers}
        toolbar={
          <>
            <div className="toolbar-left">
              <div className="global-search" style={{ width: '260px' }}>
                <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Filter customer name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                placeholder="All Statuses"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Trial', value: 'Trial' },
                  { label: 'Suspended', value: 'Suspended' },
                ]}
                style={{ width: '130px', margin: 0 }}
              />
              <Select
                placeholder="All Plans"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                options={[
                  { label: 'Enterprise', value: 'Enterprise' },
                  { label: 'Professional', value: 'Professional' },
                ]}
                style={{ width: '130px', margin: 0 }}
              />
            </div>
            <div className="toolbar-right">
              <Button variant="secondary" size="sm" onClick={() => alert('Exporting customers list CSV...')}>
                <Download size={12} /> Export
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw size={12} />
              </Button>
            </div>
          </>
        }
        pagination={
          <>
            <div>Showing {filteredCustomers.length} of {customersData.length} Customer Accounts</div>
            <div className="gap-2">
              <Button variant="secondary" size="xs" disabled>Previous</Button>
              <Button variant="secondary" size="xs" disabled>Next</Button>
            </div>
          </>
        }
      />

      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={`Edit Customer: ${selectedCustomer?.name || ''}`}
        onSave={() => {
          alert('Customer details updated successfully!');
          setIsEditDrawerOpen(false);
        }}
      >
        {selectedCustomer && (
          <>
            <Input label="Company Name" defaultValue={selectedCustomer.name} />
            <Input label="Customer Code" defaultValue={selectedCustomer.code} disabled />
            <Select
              label="Subscription Tier"
              defaultValue={selectedCustomer.plan}
              options={[
                { label: 'Enterprise', value: 'Enterprise' },
                { label: 'Professional', value: 'Professional' },
              ]}
            />
            <Select
              label="Account Status"
              defaultValue={selectedCustomer.status}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Trial', value: 'Trial' },
                { label: 'Suspended', value: 'Suspended' },
              ]}
            />
          </>
        )}
      </Drawer>
    </AppLayout>
  );
};

export default CustomersPage;

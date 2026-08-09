/**
 * Platform Users Page Component
 * Internal GTM Super Admin staff user table and invitation drawer.
 */
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';

const INITIAL_PLATFORM_USERS = [
  { id: 'usr_1', name: 'Super Admin', email: 'admin@gtmsmartgate.com', role: 'Super Admin', status: 'Active', lastActive: 'Just now' },
  { id: 'usr_2', name: 'Support Engineer', email: 'support@gtmsmartgate.com', role: 'Support Lead', status: 'Active', lastActive: '2 hours ago' },
];

const PlatformUsersPage = () => {
  const [users, setUsers] = useState(INITIAL_PLATFORM_USERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Super Admin' });

  const handleInvite = () => {
    if (!form.name.trim()) return;
    const newUser = {
      id: `usr_${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      status: 'Active',
      lastActive: 'Just now',
    };
    setUsers([newUser, ...users]);
    setIsInviteOpen(false);
    setForm({ name: '', email: '', role: 'Super Admin' });
  };

  const columns = [
    { header: 'Full Name', key: 'name', render: (row) => <strong>{row.name}</strong> },
    { header: 'GTM Email', key: 'email' },
    { header: 'Platform Role', key: 'role', render: (row) => <Badge variant="neutral">{row.role}</Badge> },
    { header: 'Status', key: 'status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>{row.status}</Badge> },
    { header: 'Last Active', key: 'lastActive' },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
          <Button variant="secondary" size="xs" onClick={() => alert(`Reset email sent to ${row.email}`)}>
            Reset Pass
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      title="GTM Platform Users"
      subtitle="Internal GTM Super Admins, Support Engineers, and System Auditors management."
      actions={
        <Button variant="primary" onClick={() => setIsInviteOpen(true)}>
          <UserPlus size={14} /> Invite Platform User
        </Button>
      }
    >
      <DataTable columns={columns} data={users} />

      <Drawer
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Platform User"
        onSave={handleInvite}
      >
        <Input label="Full Name" required placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Work Email" required type="email" placeholder="ramesh.k@gtm.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Select
          label="Platform Role Assignment"
          required
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          options={[
            { label: 'Super Admin', value: 'Super Admin' },
            { label: 'Support Lead', value: 'Support Lead' },
            { label: 'Security Auditor', value: 'Security Auditor' },
            { label: 'Billing Manager', value: 'Billing Manager' },
          ]}
        />
      </Drawer>
    </AppLayout>
  );
};

export default PlatformUsersPage;

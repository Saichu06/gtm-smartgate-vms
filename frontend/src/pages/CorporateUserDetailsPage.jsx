/**
 * CorporateUserDetailsPage — Screen 6: User Details Workspace
 * Tabs: Overview | Profile | Roles | Site Access | Activity | Audit Logs | Security
 * Route: /org/users/:id
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Key, PauseCircle, PlayCircle, Trash2, ShieldCheck, MapPin, Users, Clock, CheckCircle2 } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Tabs from '@components/navigation/Tabs';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Toast from '@components/feedback/Toast';
import usersData from '@mock/corporate_users.json';

const CorporateUserDetailsPage = () => {
  const { id, orgId } = useParams();
  const navigate = useNavigate();
  const navId = orgId || 1;
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const user = usersData.find(u => u.id === parseInt(id, 10)) || usersData[0];

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'profile', label: 'Profile' },
    { id: 'roles', label: 'Roles & Permissions' },
    { id: 'site-access', label: 'Site Access' },
    { id: 'activity', label: 'Activity Feed' },
    { id: 'audit-logs', label: 'Audit Logs' },
    { id: 'security', label: 'Security & Auth' },
  ];

  return (
    <OrganizationLayout
      title={user.name}
      subtitle={`User Workspace & Gate Authorization Profile (${user.employeeId})`}
      breadcrumbs={['Users', user.name]}
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate(`/org/${navId}/users`)}>
            <ArrowLeft size={14} /> Back
          </Button>
          <Button variant="primary" onClick={() => setIsEditOpen(true)}>
            <Edit size={14} /> Edit User Profile
          </Button>
        </>
      }
    >
      <Card className="mb-4">
        <div className="flex-between flex-wrap gap-3">
          <div className="flex-center gap-3">
            <Avatar name={user.name} size="lg" />
            <div>
              <div className="flex-center gap-2">
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>{user.name}</h2>
                <Badge variant={user.role === 'Corporate Admin' ? 'primary' : 'info'}>{user.role}</Badge>
                <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge>
              </div>
              <div className="text-muted text-sm mt-1">
                EMP ID: <code>{user.employeeId}</code> • Email: <strong>{user.email}</strong> • Site: {user.site}
              </div>
            </div>
          </div>

          <div className="flex-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => showToast(`Password reset link sent to ${user.email}`, 'info')}>
              <Key size={14} /> Reset Password
            </Button>
            <Button variant="secondary" size="sm" onClick={() => showToast(`User status toggled`, 'warning')}>
              <PauseCircle size={14} /> Deactivate User
            </Button>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="grid-cols-2-1 gap-4">
            <Card title="User Profile Information">
              <div className="d-flex flex-column gap-2 text-sm">
                <div><strong>Full Name:</strong> {user.name}</div>
                <div><strong>Email Address:</strong> {user.email}</div>
                <div><strong>Contact Phone:</strong> {user.phone}</div>
                <div><strong>Employee ID:</strong> {user.employeeId}</div>
                <div><strong>Designation:</strong> {user.designation}</div>
                <div><strong>Department:</strong> {user.department}</div>
                <div><strong>Assigned Primary Site:</strong> {user.site}</div>
                <div><strong>System Role:</strong> <Badge variant="primary">{user.role}</Badge></div>
              </div>
            </Card>

            <Card title="Security & Authentication Status">
              <div className="d-flex flex-column gap-2 text-sm">
                <div><strong>Last Login:</strong> {user.lastLogin}</div>
                <div><strong>Password Status:</strong> <span className="text-success fw-semibold">{user.passwordStatus}</span></div>
                <div><strong>MFA Protection:</strong> {user.mfaEnabled ? <span className="text-success fw-semibold">✔ Enforced</span> : <span className="text-warning">Disabled</span>}</div>
                <div><strong>Account Created:</strong> {user.created}</div>
              </div>
            </Card>
          </div>
        )}

        {activeTab !== 'overview' && (
          <Card title={`${activeTab.replace('-', ' ').toUpperCase()} Tab`}>
            <div className="text-center p-4 text-secondary">
              Management panel for <strong>{user.name}</strong> ({activeTab}).
            </div>
          </Card>
        )}
      </div>

      <Drawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${user.name}`}
        onSave={() => {
          showToast('User updated successfully!');
          setIsEditOpen(false);
        }}
      >
        <Input label="Full Name" defaultValue={user.name} />
        <Input label="Work Email" defaultValue={user.email} />
        <Input label="Phone" defaultValue={user.phone} />
        <Input label="Designation" defaultValue={user.designation} />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateUserDetailsPage;

/**
 * CustomerDetailsPage — Screen 3: Organization Details
 * Primary workspace for an organization with 9 tabs, header actions, stat cards, overview, & slide-over drawer editing.
 * Routes to: /customers/:id
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, PauseCircle, PlayCircle, PlusCircle, RefreshCw, MoreHorizontal,
  Building2, Key, Users, MapPin, UserCheck, HardDrive, ShieldCheck, Clock, Globe, Phone, Mail
} from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import StatusBadge from '@modules/organizations/components/StatusBadge';
import SubscriptionBadge from '@modules/organizations/components/SubscriptionBadge';
import OrganizationTabs from '@modules/organizations/components/OrganizationTabs';
import StatisticsCard from '@modules/organizations/components/StatisticsCard';
import InfoCard from '@modules/organizations/components/InfoCard';
import Timeline from '@modules/organizations/components/Timeline';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations, updateOrganizationStatus, updateOrganizationBranding } = useOrganizations();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const org = organizations.find((c) => c.id === parseInt(id, 10) || c.id === id) || organizations[0];

  const [editPrimaryColor, setEditPrimaryColor] = useState(org.primaryColor || '#1565C0');
  const [editDisplayName, setEditDisplayName] = useState(org.displayName || org.name);
  const [editLogo, setEditLogo] = useState(org.logo || null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleSuspend = () => {
    const newStatus = org.status === 'Suspended' ? 'Active' : 'Suspended';
    updateOrganizationStatus(org.id, newStatus);
    showToast(`Organization ${newStatus === 'Active' ? 'Activated' : 'Suspended'}`, newStatus === 'Active' ? 'success' : 'warning');
  };

  return (
    <AppLayout
      title={org.name}
      subtitle={`Organization Management & System Configuration Workspace (${org.code})`}
      breadcrumbs={['Organizations', org.name]}
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate('/customers')}>
            <ArrowLeft size={14} /> Back
          </Button>
          <Button variant="primary" onClick={() => setIsEditOpen(true)}>
            <Edit size={14} /> Edit Organization
          </Button>
        </>
      }
    >
      {/* ── Header Card ────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="flex-between flex-wrap gap-3">
          <div className="flex-center gap-3">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-lg)',
                background: `${org.primaryColor}15`,
                border: `1px solid ${org.primaryColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                color: org.primaryColor,
              }}
            >
              {org.displayName?.charAt(0) || org.name.charAt(0)}
            </div>
            <div>
              <div className="flex-center gap-2">
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>{org.name}</h2>
                <StatusBadge lifecycle={org.lifecycle} />
                <SubscriptionBadge plan={org.plan} />
              </div>
              <div className="text-muted text-sm mt-1">
                Code: <code>{org.code}</code> • Portal:{' '}
                <a href={`/org/${org.id}/login`} target="_blank" rel="noreferrer">
                  /org/{org.id}/login
                </a>
                <span className="text-muted" style={{ fontSize: '11px' }}> (prod: {org.portalUrl})</span>
              </div>
            </div>
          </div>

          <div className="flex-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/customers/${org.id}/create-admin`)}>
              <PlusCircle size={14} /> Create Corporate Admin
            </Button>
            <Button variant="secondary" size="sm" onClick={() => showToast('Subscription renewal link sent to admin', 'info')}>
              <RefreshCw size={14} /> Renew Subscription
            </Button>
            <Button 
              variant={org.status === 'Suspended' ? 'primary' : 'secondary'} 
              size="sm" 
              onClick={handleToggleSuspend}
            >
              {org.status === 'Suspended' ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
              {org.status === 'Suspended' ? 'Activate' : 'Suspend'}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── KPI Stat Cards ────────────────────────────────────── */}
      <div className="stats-grid mb-4">
        <StatisticsCard
          icon={Building2}
          label="Organization Status"
          value={org.status}
          subtext={`Lifecycle: ${org.lifecycle}`}
          iconColor="var(--color-primary)"
        />
        <StatisticsCard
          icon={Key}
          label="Active Subscription"
          value={org.plan}
          subtext={`Expires: ${org.subscriptionExpiry}`}
          iconColor="var(--color-success)"
        />
        <StatisticsCard
          icon={Users}
          label="License Usage"
          value={`${org.licenseUsed} / ${org.licenseCount}`}
          subtext="Gate Terminal Licenses"
          iconColor="var(--color-info)"
        />
        <StatisticsCard
          icon={HardDrive}
          label="Storage Usage"
          value={`${org.storageUsed} / ${org.storageLimit}`}
          subtext="ID & Pass Image Archives"
          iconColor="var(--color-warning)"
        />
        <StatisticsCard
          icon={MapPin}
          label="Configured Sites"
          value={org.sites}
          subtext="Deployed Campuses"
        />
        <StatisticsCard
          icon={Users}
          label="Registered Employees"
          value={org.employees.toLocaleString()}
          subtext="Active Directory Synced"
        />
        <StatisticsCard
          icon={UserCheck}
          label="System Users"
          value={org.users}
          subtext="Gate Operators & Admins"
        />
        <StatisticsCard
          icon={Clock}
          label="Visitors Today"
          value={org.visitorsToday.toLocaleString()}
          subtext="Passes Scanned"
          trend="+12%"
          trendUp={true}
        />
      </div>

      {/* ── 9-Tab Navigation System ──────────────────────────── */}
      <OrganizationTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Tab Content ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid-cols-2-1 gap-4">
          <div className="d-flex flex-column gap-4">
            <InfoCard 
              title="Organization Information"
              rows={[
                { label: 'Full Corporate Name', value: org.name },
                { label: 'Short Display Name', value: org.displayName },
                { label: 'Organization Code', value: org.code },
                { label: 'Industry Sector', value: org.industry },
                { label: 'Description', value: org.description },
                { label: 'Website', value: org.website },
                { label: 'GST / Tax ID', value: org.gstNumber },
                { label: 'Support Contact', value: `${org.supportEmail} • ${org.supportPhone}` },
                { label: 'HQ Address', value: `${org.address}, ${org.city}, ${org.state}, ${org.country} (${org.postalCode})` },
                { label: 'Timezone & Currency', value: `${org.timezone} • ${org.currency}` }
              ]}
            />

            <InfoCard
              title="Subscription & Capacity Limits"
              rows={[
                { label: 'Subscription Plan', element: <SubscriptionBadge plan={org.plan} /> },
                { label: 'License Terminals', value: `${org.licenseUsed} Used / ${org.licenseCount} Allocated` },
                { label: 'Storage Quota', value: `${org.storageUsed} Used / ${org.storageLimit} Max Limit` },
                { label: 'Visitor Capacity', value: `${org.visitorCapacity.toLocaleString()} visitors / month` },
                { label: 'SMS & Email Credits', value: `${org.smsCredits.toLocaleString()} SMS • ${org.emailCredits.toLocaleString()} Email` },
                { label: 'Validity Period', value: `${org.subscriptionStart} to ${org.subscriptionExpiry}` }
              ]}
            />
          </div>

          <div className="d-flex flex-column gap-4">
            <InfoCard
              title="Corporate Admin Status"
              rows={[
                { label: 'Assigned Admin', value: org.corporateAdmin },
                { label: 'Work Email', value: org.corporateAdminEmail },
                { label: 'Contact Phone', value: org.corporateAdminPhone },
                { label: 'Account Status', element: <Badge variant={org.corporateAdminStatus === 'Active' ? 'success' : 'warning'}>{org.corporateAdminStatus}</Badge> }
              ]}
            />

            <Card title="Recent Activity Timeline">
              <Timeline events={org.recentActivity} />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'corporate-admin' && (
        <Card title="Corporate Administrators" actions={<Button size="sm" onClick={() => navigate(`/customers/${org.id}/create-admin`)}><PlusCircle size={14} /> Add Admin</Button>}>
          <DataTable
            columns={[
              { header: 'Administrator Name', key: 'name', render: () => <strong>{org.corporateAdmin}</strong> },
              { header: 'Work Email', key: 'email', render: () => org.corporateAdminEmail },
              { header: 'Phone', key: 'phone', render: () => org.corporateAdminPhone },
              { header: 'Role', key: 'role', render: () => <Badge variant="primary">Corporate Administrator</Badge> },
              { header: 'Status', key: 'status', render: () => <Badge variant={org.corporateAdminStatus === 'Active' ? 'success' : 'warning'}>{org.corporateAdminStatus}</Badge> },
            ]}
            data={[{ id: 1 }]}
          />
        </Card>
      )}

      {activeTab === 'sites' && (
        <Card title="Configured Sites & Gate Terminals">
          <DataTable
            columns={[
              { header: 'Site Name', key: 'name' },
              { header: 'Location', key: 'location' },
              { header: 'Gate Kiosks', key: 'kiosks' },
              { header: 'Security Officer', key: 'lead' },
              { header: 'Status', key: 'status', render: () => <Badge variant="success">Online</Badge> },
            ]}
            data={[
              { id: 1, name: 'Limda Main Campus', location: `${org.city}, ${org.state}`, kiosks: '6 Kiosks (OCR + ANPR)', lead: 'Ramesh Patel' },
              { id: 2, name: 'North Gate Logistics Park', location: `${org.city}, ${org.state}`, kiosks: '4 Kiosks', lead: 'Suresh Kumar' }
            ]}
          />
        </Card>
      )}

      {!['overview', 'corporate-admin', 'sites'].includes(activeTab) && (
        <Card title={`${activeTab.replace('-', ' ').toUpperCase()} Module`}>
          <div className="text-center p-4 text-secondary">
            Operational settings and details panel for <strong>{org.name}</strong> ({activeTab}).
          </div>
        </Card>
      )}

      {/* ── Slide-over Drawer for Editing ────────────────────── */}
      <Drawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${org.name}`}
        onSave={() => {
          updateOrganizationBranding(org.id, {
            primaryColor: editPrimaryColor,
            displayName: editDisplayName,
            logo: editLogo,
          });
          showToast('Organization branding & details updated successfully!');
          setIsEditOpen(false);
        }}
      >
        <Input label="Organization Name" defaultValue={org.name} />
        <Input label="Short Display Name" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
        <div className="mb-3">
          <label className="form-label small fw-semibold">Primary Brand Color</label>
          <div className="d-flex align-items-center gap-2">
            <input 
              type="color" 
              value={editPrimaryColor} 
              onChange={(e) => setEditPrimaryColor(e.target.value)} 
              style={{ width: 44, height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} 
            />
            <Input value={editPrimaryColor} onChange={(e) => setEditPrimaryColor(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Organization Logo</label>
          <input 
            type="file" 
            accept="image/*" 
            className="form-control form-control-sm" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setEditLogo(reader.result);
                reader.readAsDataURL(file);
              }
            }} 
          />
          {editLogo && <img src={editLogo} alt="Logo" className="mt-2" style={{ maxHeight: 40, objectFit: 'contain' }} />}
        </div>
        <Select 
          label="Industry Sector" 
          defaultValue={org.industry}
          options={[
            { label: 'Manufacturing', value: 'Manufacturing' },
            { label: 'Automotive', value: 'Automotive' },
            { label: 'Information Technology', value: 'Information Technology' },
          ]}
        />
        <Input label="Support Email" defaultValue={org.supportEmail} />
        <Input label="Support Phone" defaultValue={org.supportPhone} />
        <Select
          label="Account Status"
          defaultValue={org.status}
          options={[
            { label: 'Active', value: 'Active' },
            { label: 'Trial', value: 'Trial' },
            { label: 'Suspended', value: 'Suspended' },
          ]}
        />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
};

export default CustomerDetailsPage;

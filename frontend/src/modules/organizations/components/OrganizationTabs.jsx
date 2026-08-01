/**
 * OrganizationTabs — 9-tab navigation system for the Organization Details page.
 * Tabs: Overview · Corporate Admin · Sites · Users · Employees · Subscription · Branding · Settings · Audit Logs
 */
import React from 'react';
import {
  LayoutDashboard, UserCheck, MapPin, Users, Briefcase,
  CreditCard, Palette, Settings, FileText,
} from 'lucide-react';

const TABS = [
  { id: 'overview',      label: 'Overview',        Icon: LayoutDashboard },
  { id: 'corporate-admin', label: 'Corporate Admin', Icon: UserCheck },
  { id: 'sites',         label: 'Sites',            Icon: MapPin },
  { id: 'users',         label: 'Users',            Icon: Users },
  { id: 'employees',     label: 'Employees',        Icon: Briefcase },
  { id: 'subscription',  label: 'Subscription',     Icon: CreditCard },
  { id: 'branding',      label: 'Branding',         Icon: Palette },
  { id: 'settings',      label: 'Settings',         Icon: Settings },
  { id: 'audit-logs',    label: 'Audit Logs',       Icon: FileText },
];

const OrganizationTabs = ({ activeTab, onChange }) => {
  return (
    <div
      className="org-tabs-wrapper"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '0 var(--space-4)',
        marginBottom: 'var(--space-5)',
        overflowX: 'auto',
      }}
    >
      <div className="tabs" style={{ borderBottom: 'none', flexWrap: 'nowrap', minWidth: 'max-content' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => onChange(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              padding: '14px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrganizationTabs;

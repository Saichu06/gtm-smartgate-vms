/**
 * TopNavbar Component
 * Sticky top navigation header with Organization Tenant Switcher dropdown, global search, system status & notifications.
 * Org switcher navigates to the correct company portal or Super Admin detail page based on current location.
 */
import React, { useState } from 'react';
import { Search, Bell, Sun, Info, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@components/navigation/Drawer';
import { useOrganizations } from '@contexts/OrganizationContext';

const TopNavbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { organizations, activeOrg, switchOrganization } = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();

  const isOrgPortal = location.pathname.startsWith('/org/');

  const handleOrgSwitch = (e) => {
    const orgId = e.target.value;
    switchOrganization(orgId);
    if (isOrgPortal) {
      // Navigate to the selected org's dashboard in the org portal
      navigate(`/org/${orgId}/dashboard`);
    } else {
      // Navigate to selected org's detail page in Super Admin portal
      navigate(`/customers/${orgId}`);
    }
  };

  return (
    <>
      <header className="top-navbar">
        <div className="d-flex align-items-center gap-3">
          {/* Tenant Switcher Dropdown */}
          <div className="d-flex align-items-center gap-2 bg-light border rounded-3 px-2 py-1">
            <Building2 size={15} style={{ color: activeOrg?.primaryColor || 'var(--color-primary)' }} />
            <select
              value={activeOrg?.id}
              onChange={handleOrgSwitch}
              className="border-0 bg-transparent fw-semibold text-dark small outline-none cursor-pointer"
              style={{ paddingRight: '4px', maxWidth: '200px' }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.displayName || org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          <div className="global-search" style={{ width: 280 }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input type="text" placeholder="Search visitors, users, sites, audit logs..." />
          </div>
        </div>

        <div className="navbar-right">
          <div className="platform-status" title="Last Checked 15 sec ago">
            <span className="status-dot"></span>
            <span>{activeOrg?.code || 'GTM'} Portal Operational</span>
          </div>

          <button className="icon-btn" title="Notifications" onClick={() => setIsNotifOpen(true)}>
            <Bell size={16} />
            <span className="notification-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'white', background: '#D32F2F', borderRadius: '50%', width: '14px', height: '14px', top: '3px', right: '3px' }}>
              3
            </span>
          </button>

          <button className="icon-btn" title="Toggle Theme" onClick={() => alert('Dark theme toggle placeholder')}>
            <Sun size={16} />
          </button>
        </div>
      </header>

      {/* Right-Side Notification Drawer */}
      <Drawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        title="Notifications"
        cancelText="Close"
      >
        <div className="d-flex flex-column gap-3">
          <div className="p-3 bg-info-subtle border border-info-subtle rounded-3">
            <div className="d-flex align-items-center gap-2 fw-semibold text-info-emphasis small">
              <Info size={15} /> Active Tenant
            </div>
            <div className="small text-secondary mt-1">
              Currently managing <strong>{activeOrg?.name}</strong>.
              <br />
              Local portal: <code>localhost:3000/org/{activeOrg?.id}/dashboard</code>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default TopNavbar;

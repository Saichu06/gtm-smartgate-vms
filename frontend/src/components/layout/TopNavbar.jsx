/**
 * TopNavbar Component
 * Sticky top navigation header with Organization Tenant Switcher dropdown, global search, system status & notifications.
 * Org switcher navigates to the correct company portal or Super Admin detail page based on current location.
 */
import React, { useState } from 'react';
import { Search, Bell, Sun, Info, Building2, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@components/navigation/Drawer';
import { useOrganizations } from '@contexts/OrganizationContext';

const TopNavbar = ({ onToggleMobileSidebar }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { organizations, activeOrg, switchOrganization } = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();

  const isOrgPortal = location.pathname.startsWith('/org/');

  const handleOrgSwitch = (e) => {
    const orgId = e.target.value;
    switchOrganization(orgId);
    if (isOrgPortal) {
      navigate(`/org/${orgId}/dashboard`);
    } else {
      navigate(`/customers/${orgId}`);
    }
  };

  return (
    <>
      <header className="top-navbar">
        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Mobile Hamburger Toggle Button (< 992px) */}
          <button 
            className="icon-btn d-lg-none border-0 bg-transparent text-dark p-1" 
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Tenant Switcher Dropdown */}
          <div className="d-flex align-items-center gap-2 bg-light border rounded-3 px-2 py-1">
            <Building2 size={15} style={{ color: activeOrg?.primaryColor || 'var(--color-primary)' }} />
            <select
              value={activeOrg?.id}
              onChange={handleOrgSwitch}
              className="border-0 bg-transparent fw-semibold text-dark small outline-none cursor-pointer"
              style={{ paddingRight: '4px', maxWidth: '140px' }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.displayName || org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Search */}
          <div className="global-search d-none d-md-flex" style={{ width: 260 }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input type="text" placeholder="Search visitors, users, sites..." />
          </div>

          {/* Mobile Search Icon Button */}
          <button 
            className="icon-btn d-md-none border-0 bg-transparent text-secondary"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle Mobile Search"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Expandable Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white d-flex align-items-center px-3 gap-2" style={{ zIndex: 10 }}>
            <Search size={16} className="text-secondary" />
            <input 
              type="text" 
              className="form-control border-0 bg-transparent outline-none flex-grow-1" 
              placeholder="Search visitors, users, sites..." 
              autoFocus 
            />
            <button className="icon-btn border-0 bg-transparent" onClick={() => setIsMobileSearchOpen(false)}>
              <X size={18} />
            </button>
          </div>
        )}

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

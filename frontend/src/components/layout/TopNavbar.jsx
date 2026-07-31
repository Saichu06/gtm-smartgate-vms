/**
 * TopNavbar Component
 * Top sticky header with global search, system health status, notifications, and theme toggle.
 */
import React from 'react';
import { Search, Bell, Sun } from 'lucide-react';

const TopNavbar = () => {
  return (
    <header className="top-navbar">
      <div className="global-search">
        <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
        <input type="text" placeholder="Search organizations, users, sites, visitors, audit logs..." />
      </div>

      <div className="navbar-right">
        <div className="platform-status" title="Last Checked 15 sec ago">
          <span className="status-dot"></span>
          <span>Platform Operational</span>
          <span style={{ opacity: 0.75, fontWeight: 400, marginLeft: '4px' }}>| 99.99% Availability</span>
        </div>

        <button className="icon-btn" title="Notifications" onClick={() => alert('5 New Platform Notifications')}>
          <Bell size={16} />
          <span className="notification-dot" style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '9px', fontWeight: 700, color: 'white', background: '#D32F2F', borderRadius: '50%', width: '14px', height: '14px', top: '3px', right: '3px' }}>5</span>
        </button>

        <button className="icon-btn" title="Toggle Theme" onClick={() => alert('Dark theme toggle placeholder')}>
          <Sun size={16} />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;

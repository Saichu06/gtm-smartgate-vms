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
        <input type="text" placeholder="Global search customers, licenses, audit logs..." />
      </div>

      <div className="navbar-right">
        <div className="platform-status">
          <span className="status-dot"></span>
          Platform Operational
        </div>

        <button className="icon-btn" title="Notifications" onClick={() => alert('No unread notifications.')}>
          <Bell size={16} />
          <span className="notification-dot"></span>
        </button>

        <button className="icon-btn" title="Toggle Theme" onClick={() => alert('Dark theme toggle placeholder')}>
          <Sun size={16} />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;

/**
 * Sidebar Component
 * Left navigation sidebar with company brand header and grouped navigation links.
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, Users, ShieldCheck, FileText, Settings, HelpCircle, LogOut, User, Sliders, Bell
} from 'lucide-react';
import Avatar from '@components/ui/Avatar';

import logoImg from '../../assets/icons/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoImg} alt="GTM Logo" />
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-tag">Super Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">Core</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} className="nav-icon" /> Dashboard
        </NavLink>

        <div className="nav-group-label">Organization Management</div>
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Building2 size={16} className="nav-icon" /> Organizations
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={16} className="nav-icon" /> Subscriptions
        </NavLink>

        <div className="nav-group-label">Platform</div>
        <NavLink to="/platform-users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={16} className="nav-icon" /> Platform Users
        </NavLink>
        <NavLink to="/roles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={16} className="nav-icon" /> Roles & Permissions
        </NavLink>
        <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={16} className="nav-icon" /> Audit Logs
        </NavLink>

        <div className="nav-group-label">System</div>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={16} className="nav-icon" /> System Settings
        </NavLink>
        <button className="nav-item" onClick={() => alert('GTM Support Desk: support@gtm.com')}>
          <HelpCircle size={16} className="nav-icon" /> Support & Docs
        </button>
      </nav>

      <div className="sidebar-footer position-relative">
        {showProfileMenu && (
          <div className="position-absolute bottom-100 start-0 w-100 mb-2 p-2 bg-white border rounded-3 shadow-lg z-3">
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => alert('Opening Profile Details')}>
              <User size={14} /> Profile
            </button>
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => navigate('/settings')}>
              <Sliders size={14} /> Preferences
            </button>
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => alert('Opening Notification Settings')}>
              <Bell size={14} /> Notifications
            </button>
            <div className="dropdown-divider my-1"></div>
            <button className="btn btn-sm btn-light text-danger w-100 text-start d-flex align-items-center gap-2" onClick={() => navigate('/login')}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
        <div className="user-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <Avatar name="Vikram Malhotra" size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">Vikram Malhotra</div>
            <div className="user-role" style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 600 }}>Super Administrator</div>
            <div className="user-email" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>superadmin@gtm.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

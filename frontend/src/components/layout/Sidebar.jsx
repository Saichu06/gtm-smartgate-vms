/**
 * Sidebar Component — Super Admin Navigation
 * Supports custom profile image upload (base64) for Super Admin profile.
 */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, Users, ShieldCheck, FileText, Settings, HelpCircle, LogOut, User, Sliders, Upload, Image as ImageIcon, X
} from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';

import logoImg from '../../assets/icons/logo.png';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Drawers state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Profile Form State (persisted in localStorage)
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gtm_superadmin_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Vikram Malhotra',
        email: 'superadmin@gtm.com',
        phone: '+91 98100 99999',
        designation: 'Lead Platform Architect & Super Admin',
        avatar: null,
      };
    } catch {
      return {
        name: 'Vikram Malhotra',
        email: 'superadmin@gtm.com',
        phone: '+91 98100 99999',
        designation: 'Lead Platform Architect & Super Admin',
        avatar: null,
      };
    }
  });

  // Handle Profile Avatar Image Upload (Base64)
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Preferences Form State (persisted in localStorage)
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('gtm_superadmin_preferences');
      return saved ? JSON.parse(saved) : {
        theme: 'light',
        emailAlerts: true,
        sessionTimeout: '60',
        tableRowsPerPage: '10',
      };
    } catch {
      return {
        theme: 'light',
        emailAlerts: true,
        sessionTimeout: '60',
        tableRowsPerPage: '10',
      };
    }
  });

  // Save to localStorage
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('gtm_superadmin_profile', JSON.stringify(adminProfile));
    } catch (e) { console.warn(e); }
    alert('Super Admin profile updated successfully!');
    setIsProfileOpen(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('gtm_superadmin_preferences', JSON.stringify(preferences));
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.style.backgroundColor = '#1e1e2d';
        document.body.style.color = '#ffffff';
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      }
    } catch (e) { console.warn(e); }
    alert('Super Admin preferences saved and applied!');
    setIsPreferencesOpen(false);
  };

  // Helper to handle link click on mobile
  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <img src={logoImg} alt="GTM Logo" style={{ maxHeight: 'var(--logo-max-height-mobile, 48px)' }} />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-tag">Super Admin</span>
          </div>
        </div>
        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button className="icon-btn d-lg-none border-0 bg-transparent text-secondary" onClick={onCloseMobile} aria-label="Close mobile menu">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">Core</div>
        <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} className="nav-icon" /> Dashboard
        </NavLink>

        <div className="nav-group-label">Organization Management</div>
        <NavLink to="/customers" onClick={handleNavClick} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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

      {/* Super Admin User Footer */}
      <div className="sidebar-footer position-relative">
        {showProfileMenu && (
          <div className="position-absolute bottom-100 start-0 w-100 mb-2 p-2 bg-white border rounded-3 shadow-lg z-3">
            <button 
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" 
              onClick={() => { setShowProfileMenu(false); setIsProfileOpen(true); }}
            >
              <User size={14} /> Profile Details
            </button>
            <button 
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" 
              onClick={() => { setShowProfileMenu(false); setIsPreferencesOpen(true); }}
            >
              <Sliders size={14} /> Admin Preferences
            </button>
            <button 
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" 
              onClick={() => navigate('/settings')}
            >
              <Settings size={14} /> System Settings
            </button>
            <div className="dropdown-divider my-1"></div>
            <button className="btn btn-sm btn-light text-danger w-100 text-start d-flex align-items-center gap-2" onClick={() => navigate('/login')}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
        <div className="user-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <Avatar name={adminProfile.name} src={adminProfile.avatar} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{adminProfile.name}</div>
            <div className="user-role" style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 600 }}>Super Administrator</div>
            <div className="user-email" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminProfile.email}</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Drawer */}
      <Drawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Edit Super Admin Profile"
        onSave={handleSaveProfile}
      >
        {/* Profile Avatar Upload */}
        <div className="mb-4 text-center">
          <div className="d-flex align-items-center justify-content-center gap-3">
            <Avatar name={adminProfile.name} src={adminProfile.avatar} size="xl" />
            <div className="d-flex flex-column gap-2 text-start">
              <label className="btn btn-sm btn-primary mb-0 cursor-pointer">
                <Upload size={13} /> Change Profile Photo
                <input type="file" accept="image/*" className="d-none" onChange={handleAvatarUpload} />
              </label>
              {adminProfile.avatar && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setAdminProfile((prev) => ({ ...prev, avatar: null }))}
                >
                  Remove Photo
                </button>
              )}
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>PNG, JPG or WEBP • Max 2MB</div>
            </div>
          </div>
        </div>

        <Input 
          label="Full Name" 
          value={adminProfile.name} 
          onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })} 
        />
        <Input 
          label="Super Admin Email" 
          type="email" 
          value={adminProfile.email} 
          onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })} 
        />
        <Input 
          label="Contact Phone" 
          value={adminProfile.phone} 
          onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })} 
        />
        <Input 
          label="Platform Designation" 
          value={adminProfile.designation} 
          onChange={(e) => setAdminProfile({ ...adminProfile, designation: e.target.value })} 
        />
      </Drawer>

      {/* Admin Preferences Drawer */}
      <Drawer
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        title="Super Admin Preferences"
        onSave={handleSavePreferences}
      >
        <Select
          label="System Interface Theme"
          value={preferences.theme}
          onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
          options={[
            { label: 'Light Mode (Default)', value: 'light' },
            { label: 'Dark Mode', value: 'dark' },
            { label: 'System Default', value: 'system' },
          ]}
        />
        <Select
          label="Global Data Table Rows Per Page"
          value={preferences.tableRowsPerPage}
          onChange={(e) => setPreferences({ ...preferences, tableRowsPerPage: e.target.value })}
          options={[
            { label: '10 rows per page', value: '10' },
            { label: '25 rows per page', value: '25' },
            { label: '50 rows per page', value: '50' },
          ]}
        />
        <Select
          label="Admin Idle Session Timeout"
          value={preferences.sessionTimeout}
          onChange={(e) => setPreferences({ ...preferences, sessionTimeout: e.target.value })}
          options={[
            { label: '30 Minutes', value: '30' },
            { label: '60 Minutes (Default)', value: '60' },
            { label: '120 Minutes', value: '120' },
          ]}
        />
        <div className="form-check mt-3">
          <input 
            type="checkbox" 
            className="form-check-input" 
            id="emailAlertsCheck" 
            checked={preferences.emailAlerts} 
            onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })} 
          />
          <label className="form-check-label small text-dark fw-medium" htmlFor="emailAlertsCheck">
            Receive Instant Email Notifications on Customer Onboarding & System Incidents
          </label>
        </div>
      </Drawer>
    </aside>
  );
};

export default Sidebar;

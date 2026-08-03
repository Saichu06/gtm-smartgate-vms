/**
 * CorporateSidebar Component
 * Left navigation sidebar for Organization Portal (Corporate Admin & Staff).
 * Displays uploaded logo or primary color avatar badge.
 */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, Users, Briefcase, MapPin,
  Tag, CheckSquare, BarChart3, Settings, LogOut, User, Sliders, Bell, X,
} from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import { useOrganizations } from '@contexts/OrganizationContext';

const CorporateSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { activeOrg, updateOrganizationAdmin } = useOrganizations();

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

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const orgId = activeOrg?.id || 1;
  const orgName = activeOrg?.displayName || activeOrg?.name || 'Organization Portal';
  const primaryColor = activeOrg?.primaryColor || '#004B87';
  const logo = activeOrg?.logo;
  const adminName = activeOrg?.corporateAdmin || 'Admin User';
  const adminEmail = activeOrg?.corporateAdminEmail || 'admin@smartgate.gtm.com';
  const adminPhone = activeOrg?.corporateAdminPhone || '+91 98400 00000';

  const [editAdminName, setEditAdminName] = useState(adminName);
  const [editAdminEmail, setEditAdminEmail] = useState(adminEmail);
  const [editAdminPhone, setEditAdminPhone] = useState(adminPhone);

  React.useEffect(() => {
    setEditAdminName(adminName);
    setEditAdminEmail(adminEmail);
    setEditAdminPhone(adminPhone);
  }, [adminName, adminEmail, adminPhone]);

  // Helper to build org-scoped nav paths
  const path = (page) => `/org/${orgId}/${page}`;

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Dynamic Org Brand Header */}
      <div className="sidebar-brand d-flex align-items-center justify-content-between py-3 px-3">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: logo ? '#FFFFFF' : primaryColor,
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
              overflow: 'hidden',
              border: logo ? `1.5px solid ${primaryColor}40` : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: logo ? 3 : 0,
            }}
          >
            {logo ? (
              <img src={logo} alt={orgName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              orgName.charAt(0)
            )}
          </div>
          <div className="sidebar-brand-text" style={{ minWidth: 0 }}>
            <div className="sidebar-brand-name" style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {orgName}
            </div>
            <span className="sidebar-brand-tag" style={{ background: `${primaryColor}15`, color: primaryColor, fontSize: '10px' }}>
              Smart Gate Portal
            </span>
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
        <div className="nav-group-label">Main</div>
        <NavLink to={path('dashboard')} onClick={handleNavClick} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} className="nav-icon" /> Dashboard
        </NavLink>

        <div className="nav-group-label">Gate Operations</div>
        <NavLink to={path('visitors')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserCheck size={16} className="nav-icon" /> Visitor Management
        </NavLink>
        <NavLink to={path('approvals')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={16} className="nav-icon" /> Approvals
        </NavLink>

        <div className="nav-group-label">Access Control</div>
        <NavLink to={path('users')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={16} className="nav-icon" /> Users
        </NavLink>
        <NavLink to={path('employees')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Briefcase size={16} className="nav-icon" /> Employees
        </NavLink>
        <NavLink to={path('sites')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MapPin size={16} className="nav-icon" /> Sites & Gates
        </NavLink>
        <NavLink to={path('visitor-types')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Tag size={16} className="nav-icon" /> Visitor Types
        </NavLink>

        <div className="nav-group-label">Analytics & System</div>
        <NavLink to={path('reports')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={16} className="nav-icon" /> Reports
        </NavLink>
        <NavLink to={path('settings')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={16} className="nav-icon" /> Portal Settings
        </NavLink>
      </nav>

      {/* Corporate Admin User Footer */}
      <div className="sidebar-footer position-relative">
        {showProfileMenu && (
          <div className="position-absolute bottom-100 start-0 w-100 mb-2 p-2 bg-white border rounded-3 shadow-lg z-3">
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => { setShowProfileMenu(false); setIsProfileOpen(true); }}>
              <User size={14} /> My Profile & Preferences
            </button>
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => { setShowProfileMenu(false); navigate(path('settings')); }}>
              <Sliders size={14} /> Portal Settings
            </button>
            <div className="dropdown-divider my-1"></div>
            <button className="btn btn-sm btn-light text-danger w-100 text-start d-flex align-items-center gap-2" onClick={() => navigate(path('login'))}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
        <div className="user-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <Avatar name={adminName} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{adminName}</div>
            <div className="user-role" style={{ fontSize: '10px', color: primaryColor, fontWeight: 600 }}>Corporate Admin</div>
            <div className="user-email" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail}</div>
          </div>
        </div>
      </div>

      {/* Corporate Admin Profile Drawer */}
      <Drawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Edit Corporate Admin Profile"
        onSave={() => {
          updateOrganizationAdmin(orgId, {
            firstName: editAdminName.split(' ')[0] || editAdminName,
            lastName: editAdminName.split(' ').slice(1).join(' ') || '',
            email: editAdminEmail,
            phone: editAdminPhone,
          });
          alert('Admin profile updated successfully!');
          setIsProfileOpen(false);
        }}
      >
        <Input label="Full Name" value={editAdminName} onChange={(e) => setEditAdminName(e.target.value)} />
        <Input label="Work Email Address" value={editAdminEmail} onChange={(e) => setEditAdminEmail(e.target.value)} />
        <Input label="Contact Phone Number" value={editAdminPhone} onChange={(e) => setEditAdminPhone(e.target.value)} />
        <Input label="Role / Designation" value="Corporate Administrator" disabled />
        <div className="p-2 bg-light rounded-3 text-secondary small mt-2">
          Updating profile details will persist your admin identity across the organization portal workspace.
        </div>
      </Drawer>
    </aside>
  );
};

export default CorporateSidebar;

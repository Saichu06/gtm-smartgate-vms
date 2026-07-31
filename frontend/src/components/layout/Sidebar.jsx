/**
 * Sidebar Component
 * Left navigation sidebar with company brand header and grouped navigation links.
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, Users, ShieldCheck, FileText, Settings, HelpCircle, LogOut
} from 'lucide-react';
import Avatar from '@components/ui/Avatar';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/assets/image.png" alt="GTM Logo" onError={(e) => { e.target.src = 'https://via.placeholder.com/100x30?text=GTM'; }} />
        <div className="sidebar-brand-text">
          {/* <div className="sidebar-brand-name">GTM Smart Gate</div> */}
          <span className="sidebar-brand-tag">Super Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">Core</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} className="nav-icon" /> Dashboard
        </NavLink>

        <div className="nav-group-label">Customer Management</div>
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Building2 size={16} className="nav-icon" /> Customers
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

      <div className="sidebar-footer">
        <div className="user-menu" onClick={() => navigate('/login')}>
          <Avatar name="Vikram Malhotra" size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">Vikram Malhotra</div>
            <div className="user-email">superadmin@gtm.com</div>
          </div>
          <button className="icon-btn" title="Sign Out" onClick={() => navigate('/login')}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

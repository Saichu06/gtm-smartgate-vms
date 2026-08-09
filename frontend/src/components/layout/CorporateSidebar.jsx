/**
 * CorporateSidebar Component
 * Left navigation sidebar for Organization Portal (Corporate Admin & Staff).
 */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, Users, Briefcase, MapPin,
  Tag, CheckSquare, BarChart3, Settings, LogOut, User, Sliders, X, Tablet,
} from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import { useOrganizations } from '@contexts/OrganizationContext';
import { visitorApi } from '@services/vmsApi';

const CorporateSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { activeOrg, updateOrganizationAdmin } = useOrganizations();
  const [pendingCount, setPendingCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);

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

  useEffect(() => {
    setEditAdminName(adminName);
    setEditAdminEmail(adminEmail);
    setEditAdminPhone(adminPhone);
  }, [adminName, adminEmail, adminPhone]);

  useEffect(() => {
    const refreshCounts = async () => {
      if (!orgId) return;
      try {
        const res = await visitorApi.getVisitors(orgId);
        if (res.success && Array.isArray(res.data)) {
          setPendingCount(res.data.filter(v => v.status === 'Awaiting Approval').length);
          setVisitorCount(res.data.filter(v => v.status === 'Checked In').length);
        }
      } catch {}
    };
    refreshCounts();
    const interval = setInterval(refreshCounts, 30000);
    return () => clearInterval(interval);
  }, [orgId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) onCloseMobile();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const path = (page) => `/org/${orgId}/${page}`;

  const navItems = [
    { group: 'Main', items: [
      { to: path('dashboard'), icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { group: 'Gate Operations', items: [
      { to: path('visitors'), icon: UserCheck, label: 'Visitor Management', badge: visitorCount > 0 ? visitorCount : null },
      { to: path('approvals'), icon: CheckSquare, label: 'Approvals', badge: pendingCount > 0 ? pendingCount : null, badgeVariant: 'warning' },
    ]},
    { group: 'Access Control', items: [
      { to: path('users'), icon: Users, label: 'Users' },
      { to: path('employees'), icon: Briefcase, label: 'Employees' },
      { to: path('sites'), icon: MapPin, label: 'Sites & Gates' },
      { to: path('visitor-types'), icon: Tag, label: 'Visitor Types' },
    ]},
    { group: 'Analytics & System', items: [
      { to: path('reports'), icon: BarChart3, label: 'Reports' },
      { to: path('settings'), icon: Settings, label: 'Portal Settings' },
    ]},
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand d-flex align-items-center justify-content-between py-3 px-3">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: logo ? '#FFFFFF' : primaryColor, color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, flexShrink: 0, overflow: 'hidden',
              border: logo ? `1.5px solid ${primaryColor}40` : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: logo ? 3 : 0,
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
        {onCloseMobile && (
          <button className="icon-btn d-lg-none border-0 bg-transparent text-secondary" onClick={onCloseMobile} aria-label="Close mobile menu">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Kiosk quick-launch strip */}
      <div className="px-3 pb-2">
        <a
          href={`/kiosk/${orgId}`}
          target="_blank"
          rel="noreferrer"
          onClick={handleNavClick}
          className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none"
          style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}30`, fontSize: 12, fontWeight: 600, color: primaryColor }}
        >
          <Tablet size={14} /> Open Self-Service Kiosk
        </a>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <React.Fragment key={section.group}>
            <div className="nav-group-label">{section.group}</div>
            {section.items.map(({ to, icon: Icon, label, badge, badgeVariant }) => (
              <NavLink
                key={to}
                to={to}
                onClick={handleNavClick}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} className="nav-icon" />
                <span style={{ flex: 1 }}>{label}</span>
                {badge != null && badge > 0 && (
                  <span style={{
                    background: badgeVariant === 'warning' ? '#F57C00' : primaryColor,
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    borderRadius: 999, padding: '1px 7px', minWidth: 18, textAlign: 'center',
                  }}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer position-relative">
        {showProfileMenu && (
          <div className="position-absolute bottom-100 start-0 w-100 mb-2 p-2 bg-white border rounded-3 shadow-lg z-3">
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => { setShowProfileMenu(false); setIsProfileOpen(true); }}>
              <User size={14} /> My Profile & Preferences
            </button>
            <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => { setShowProfileMenu(false); navigate(path('settings')); handleNavClick(); }}>
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
          setIsProfileOpen(false);
        }}
      >
        <Input label="Full Name" value={editAdminName} onChange={(e) => setEditAdminName(e.target.value)} />
        <Input label="Work Email Address" value={editAdminEmail} onChange={(e) => setEditAdminEmail(e.target.value)} />
        <Input label="Contact Phone Number" value={editAdminPhone} onChange={(e) => setEditAdminPhone(e.target.value)} />
        <Input label="Role / Designation" value="Corporate Administrator" disabled />
      </Drawer>
    </aside>
  );
};

export default CorporateSidebar;

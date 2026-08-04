/**
 * OrgPortalHeader — Top header bar exclusively for the Organization Portal.
 *
 * COMPLETELY DIFFERENT from TopNavbar (Super Admin portal):
 * - Shows the org's logo / initials with their brand color
 * - Shows the org name + plan badge — NO company switcher dropdown
 * - Left accent border uses the org's primary color
 * - Notifications, user avatar, and quick links are org-specific
 * - The portal is isolated — each org's user only sees THEIR data
 */
import React, { useState } from 'react';
import { Search, Bell, Sun, Info, Settings, LogOut, User, Shield, Menu } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Drawer from '@components/navigation/Drawer';
import Avatar from '@components/ui/Avatar';
import { useOrganizations } from '@contexts/OrganizationContext';

const OrgPortalHeader = ({ onToggleMobileSidebar }) => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const id = orgId || activeOrg?.id || 1;
  const primary       = activeOrg?.primaryColor   || '#1565C0';
  const orgName       = activeOrg?.displayName    || activeOrg?.name    || 'Organization';
  const orgCode       = activeOrg?.code           || 'ORG';
  const adminName     = activeOrg?.corporateAdmin || 'Admin';
  const adminEmail    = activeOrg?.corporateAdminEmail || '';
  const plan          = activeOrg?.plan           || 'Enterprise';
  const logo          = activeOrg?.logo;           // data-URL if uploaded, null otherwise

  const planColors = {
    Enterprise: { bg: '#EDE7F6', text: '#4A148C' },
    Professional: { bg: '#E3F2FD', text: '#0D47A1' },
    Trial: { bg: '#FFF3E0', text: '#E65100' },
  };
  const planStyle = planColors[plan] || planColors.Enterprise;

  const [imgError, setImgError] = useState(false);

  return (
    <>
      <header
        className="top-navbar"
        style={{
          borderBottom: `1px solid ${primary}30`,
          borderTop: `3px solid ${primary}`,
        }}
      >
        {/* Left: Mobile Toggle & Org Identity Block */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Mobile Hamburger Menu Toggle Button (< 992px) */}
          <button 
            className="icon-btn d-lg-none border-0 bg-transparent text-dark p-1" 
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Org Logo or Initials Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: logo && !imgError ? '#FFFFFF' : primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
              overflow: 'hidden',
              border: logo && !imgError ? `1.5px solid ${primary}40` : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: logo && !imgError ? 3 : 0,
            }}
          >
            {logo && !imgError
              ? <img src={logo} alt={orgName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setImgError(true)} />
              : orgName.charAt(0).toUpperCase()
            }
          </div>

          {/* Org Name + Plan Badge */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              <span 
                style={{ 
                  fontWeight: 700, 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '90px'
                }}
              >
                {orgName}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: planStyle.bg,
                  color: planStyle.text,
                  letterSpacing: '0.3px',
                  flexShrink: 0
                }}
              >
                {plan}
              </span>
            </div>
            <div className="d-none d-sm-block" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              <code style={{ fontSize: 10, background: `${primary}12`, color: primary, padding: '1px 5px', borderRadius: 3 }}>
                {orgCode}
              </code>
              {' '}Smart Gate Portal
            </div>
          </div>

          {/* Search */}
          <div className="global-search d-none d-md-flex" style={{ width: 220, marginLeft: 8 }}>
            <Search size={13} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
            <input type="text" placeholder={`Search in ${orgName}...`} />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="navbar-right">
          {/* Status Pill */}
          <div
            className="platform-status d-none d-md-flex"
            title="Gate systems operational"
            style={{ borderColor: `${primary}30`, background: `${primary}08` }}
          >
            <span className="status-dot" style={{ background: 'var(--color-success)' }}></span>
            <span style={{ color: primary, fontWeight: 600 }}>{orgCode} Portal Live</span>
          </div>

          {/* Notifications */}
          <button className="icon-btn" title="Notifications" onClick={() => setIsNotifOpen(true)}>
            <Bell size={16} />
            <span
              className="notification-dot"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 700, color: 'white',
                background: '#D32F2F', borderRadius: '50%',
                width: '14px', height: '14px', top: '3px', right: '3px',
              }}
            >
              3
            </span>
          </button>

          {/* User Avatar Menu */}
          <div style={{ position: 'relative' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => setShowUserMenu(p => !p)}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: primary, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                }}
              >
                {adminName.charAt(0)}
              </div>
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute', right: 0, top: '110%', minWidth: 220,
                  background: '#fff', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000, padding: 8,
                }}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                {/* User Info */}
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--color-border)', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{adminName}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{adminEmail}</div>
                  <div style={{ fontSize: 10, color: primary, fontWeight: 600, marginTop: 2 }}>Corporate Administrator</div>
                </div>

                <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => { setShowUserMenu(false); alert('Profile Details'); }}>
                  <User size={13} /> My Profile
                </button>
                <button className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1" onClick={() => { setShowUserMenu(false); navigate(`/org/${id}/settings`); }}>
                  <Settings size={13} /> Portal Settings
                </button>
                <div className="dropdown-divider my-1" />
                <button className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 text-danger" style={{ background: 'none', border: 'none' }} onClick={() => navigate(`/org/${id}/login`)}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <Drawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} title="Notifications" cancelText="Close">
        <div className="d-flex flex-column gap-3">
          <div className="p-3 bg-warning-subtle border border-warning-subtle rounded-3">
            <div className="d-flex align-items-center gap-2 fw-semibold text-warning-emphasis small">
              <Shield size={15} /> Security Alert
            </div>
            <div className="small text-secondary mt-1">Gate Kiosk K-05 at Plant 2 went offline 15 mins ago.</div>
          </div>
          <div className="p-3 bg-success-subtle border border-success-subtle rounded-3">
            <div className="d-flex align-items-center gap-2 fw-semibold text-success-emphasis small">
              <Bell size={15} /> Approval Request
            </div>
            <div className="small text-secondary mt-1"><strong>Lavanya Reddy (PwC)</strong> is waiting for your approval — Scheduled 3:30 PM.</div>
          </div>
          <div className="p-3 bg-info-subtle border border-info-subtle rounded-3">
            <div className="d-flex align-items-center gap-2 fw-semibold text-info-emphasis small">
              <Info size={15} /> Portal Info
            </div>
            <div className="small text-secondary mt-1">
              Logged in as <strong>{adminName}</strong> for <strong>{orgName}</strong>.
              <br />
              <span style={{ color: primary, fontSize: 10, fontFamily: 'monospace' }}>
                localhost:3001/org/{id}/dashboard
              </span>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default OrgPortalHeader;

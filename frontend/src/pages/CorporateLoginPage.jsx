/**
 * CorporateLoginPage — Screen 1: Corporate Admin & Staff Login
 * Dynamic branded login screen for customer organization portal.
 * Fixes: Loads targetOrg logo, colors, name, and checks isFirstLoginDone state.
 * Route: /org/:orgId/login
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, LogIn, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useOrganizations } from '@contexts/OrganizationContext';

const CorporateLoginPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { organizations, activeOrg } = useOrganizations();

  // Find org strictly based on URL param or activeOrg
  const targetOrg = organizations.find((o) => o.id === parseInt(orgId, 10)) || activeOrg || organizations[0];
  const id = targetOrg.id;

  const primaryColor = targetOrg.primaryColor || '#1565C0';
  const orgName = targetOrg.displayName || targetOrg.name;
  const tagline = targetOrg.loginTagline || 'Secure. Smart. Seamless.';
  const logo = targetOrg.logo;

  const [email, setEmail] = useState(targetOrg.corporateAdminEmail || `admin@${targetOrg.subdomain || 'org'}.com`);
  const [password, setPassword] = useState('TempPassword@2026');
  const [showPassword, setShowPassword] = useState(false);
  
  // Default simulate check to true if password hasn't been set up yet for this org
  const [isFirstLogin, setIsFirstLogin] = useState(!targetOrg.isFirstLoginDone);

  // Sync isFirstLogin state whenever targetOrg changes
  useEffect(() => {
    setIsFirstLogin(!targetOrg.isFirstLoginDone);
    setEmail(targetOrg.corporateAdminEmail || `admin@${targetOrg.subdomain || 'org'}.com`);
  }, [targetOrg.id, targetOrg.isFirstLoginDone, targetOrg.corporateAdminEmail]);

  // Set page title dynamically
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Login — ${orgName} Smart Gate Portal`;
    return () => { document.title = prevTitle; };
  }, [orgName]);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (isFirstLogin) {
      navigate(`/org/${id}/first-login`);
    } else {
      navigate(`/org/${id}/dashboard`);
    }
  };

  return (
    <div className="login-shell" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Branding Panel */}
      <div 
        className="login-branding-panel flex-grow-1 d-none d-lg-flex flex-column justify-content-between p-5 position-relative" 
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}15 0%, #F8FAFC 100%)`,
          borderRight: '1px solid #E2E8F0',
          width: '55%'
        }}
      >
        {/* Top Org Brand */}
        <div className="d-flex flex-column align-items-start gap-1">
          {logo ? (
            <img 
              src={logo} 
              alt={orgName} 
              style={{ 
                maxHeight: 80, 
                maxWidth: 280, 
                objectFit: 'contain' 
              }} 
            />
          ) : (
            <div className="d-flex align-items-center gap-3">
              <div 
                style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 'var(--radius-lg)', 
                  background: primaryColor, 
                  color: '#FFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: 26,
                  boxShadow: `0 6px 18px ${primaryColor}30`,
                }}
              >
                {orgName.charAt(0).toUpperCase()}
              </div>
              <h3 className="fw-bold mb-0 text-dark">{orgName}</h3>
            </div>
          )}
          <div className="small fw-semibold mt-1" style={{ color: primaryColor, letterSpacing: '0.3px' }}>
            Organization Visitor Portal
          </div>
        </div>

        {/* Central Dynamic Hero Text & Features */}
        <div className="my-auto py-5" style={{ maxWidth: 500 }}>
          <span 
            className="badge mb-3 px-3 py-2 rounded-pill fw-semibold" 
            style={{ background: `${primaryColor}18`, color: primaryColor, fontSize: '12px' }}
          >
            GTM Smart Gate Multi-Tenant Portal
          </span>
          <h1 className="fw-bold text-dark display-6 mb-3" style={{ lineHeight: 1.2 }}>
            {tagline}
          </h1>
          <p className="text-secondary mb-4">
            Welcome to <strong>{orgName}</strong>'s enterprise visitor control system. Manage visitor passes, gate approvals, and site access.
          </p>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-2 text-dark small fw-medium">
              <CheckCircle2 size={16} style={{ color: primaryColor }} /> Real-time Gate Terminal Check-in & Pass Verification
            </div>
            <div className="d-flex align-items-center gap-2 text-dark small fw-medium">
              <CheckCircle2 size={16} style={{ color: primaryColor }} /> Active Directory & Employee Host Directory Sync
            </div>
            <div className="d-flex align-items-center gap-2 text-dark small fw-medium">
              <CheckCircle2 size={16} style={{ color: primaryColor }} /> Instant SMS & Email Host Approval Workflow
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between text-secondary small border-top pt-3">
          <span>Powered by <strong>GTM Smart Gate v2.4</strong></span>
          <span>Security Verified SLA 99.9%</span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 p-4 bg-white" style={{ minWidth: 360 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile Brand Logo */}
          <div className="d-lg-none text-center mb-4">
            {logo ? (
              <img src={logo} alt={orgName} style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain', marginBottom: 8 }} />
            ) : (
              <div 
                className="mx-auto mb-2"
                style={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: 'var(--radius-md)', 
                  background: primaryColor, 
                  color: '#FFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: 22,
                }}
              >
                {orgName.charAt(0)}
              </div>
            )}
            <h5 className="fw-bold text-dark">{orgName}</h5>
          </div>

          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Sign In to Portal</h3>
            <p className="text-secondary small">Enter your corporate credentials for <strong>{orgName}</strong>.</p>
          </div>

          <form onSubmit={handleSignIn} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label small fw-semibold text-dark">Corporate Email</label>
              <div className="position-relative">
                <input 
                  type="email" 
                  className="form-control ps-5 py-2" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                <Mail size={16} className="position-absolute text-secondary" style={{ left: 14, top: 12 }} />
              </div>
            </div>

            <div>
              <div className="d-between mb-1">
                <label className="form-label small fw-semibold text-dark mb-0">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Reset link sent to administrator'); }} className="small text-decoration-none" style={{ color: primaryColor }}>
                  Forgot?
                </a>
              </div>
              <div className="position-relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control ps-5 pe-5 py-2" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <Lock size={16} className="position-absolute text-secondary" style={{ left: 14, top: 12 }} />
                <button 
                  type="button" 
                  className="btn btn-link position-absolute text-secondary p-0" 
                  style={{ right: 14, top: 10 }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-check my-1">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="firstLoginCheck" 
                checked={isFirstLogin} 
                onChange={(e) => setIsFirstLogin(e.target.checked)} 
              />
              <label className="form-check-label small text-secondary" htmlFor="firstLoginCheck">
                Simulate First-Time Login (Password Setup Flow)
              </label>
            </div>

            <button 
              type="submit" 
              className="btn text-white w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              style={{ background: primaryColor, border: 'none' }}
            >
              <LogIn size={16} /> Sign In to {targetOrg.code || 'Portal'}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top text-secondary small">
            Need access? Contact <strong>{targetOrg.corporateAdmin}</strong> or system administrator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateLoginPage;

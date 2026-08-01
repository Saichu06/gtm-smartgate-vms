/**
 * FirstLoginPasswordPage — Screen 2: First-Time Login Password Change & Setup
 * Forced password update, MFA verification toggle, policy acceptance for new admins/staff.
 * Updates isFirstLoginDone: true in OrganizationContext so subsequent logins do not ask again.
 * Route: /org/:orgId/first-login
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Key, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '@components/ui/Button';
import { useOrganizations } from '@contexts/OrganizationContext';

const FirstLoginPasswordPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { organizations, activeOrg, updateOrganizationBranding } = useOrganizations();

  const targetOrg = organizations.find((o) => o.id === parseInt(orgId, 10)) || activeOrg || organizations[0];
  const id = targetOrg.id;
  const primaryColor = targetOrg.primaryColor || '#1565C0';
  const orgName = targetOrg.displayName || targetOrg.name;
  const logo = targetOrg.logo;

  const [currentPassword, setCurrentPassword] = useState('TempPassword@2026');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enableMFA, setEnableMFA] = useState(true);
  const [acceptPolicy, setAcceptPolicy] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (!acceptPolicy) {
      setError('You must accept the Organization Security Policy.');
      return;
    }

    // Save first login completion in context & localStorage
    updateOrganizationBranding(id, { isFirstLoginDone: true });

    // Navigate to operational dashboard
    navigate(`/org/${id}/dashboard`);
  };

  return (
    <div className="login-shell justify-content-center align-items-center bg-light p-4" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-xl)' }}>
        <div className="text-center mb-4">
          <div 
            className="mx-auto mb-3"
            style={{ 
              width: 52, 
              height: 52, 
              borderRadius: 'var(--radius-lg)', 
              background: logo ? 'transparent' : `${primaryColor}15`, 
              color: primaryColor,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800, 
              fontSize: 22,
              overflow: 'hidden',
              border: logo ? `1px solid ${primaryColor}30` : `1px solid ${primaryColor}40`
            }}
          >
            {logo ? <img src={logo} alt={orgName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : orgName.charAt(0)}
          </div>
          <h4 className="fw-bold text-dark mb-1">{orgName} First-Time Setup</h4>
          <p className="text-secondary small">Please set a permanent secure password before accessing the portal.</p>
        </div>

        {error && (
          <div className="alert alert-danger p-2 small mb-3 text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-semibold text-dark">Current Temporary Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="form-label small fw-semibold text-dark">New Permanent Password</label>
            <div className="position-relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control pe-5" 
                value={newPassword} 
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }} 
                placeholder="At least 8 characters"
                required 
              />
              <button 
                type="button" 
                className="btn btn-link position-absolute text-secondary p-0" 
                style={{ right: 12, top: 8 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="form-label small fw-semibold text-dark">Confirm New Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              className="form-control" 
              value={confirmPassword} 
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} 
              required 
            />
          </div>

          <div className="p-3 bg-light rounded-3 border">
            <div className="form-check mb-2">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="mfaCheck" 
                checked={enableMFA} 
                onChange={(e) => setEnableMFA(e.target.checked)} 
              />
              <label className="form-check-label small fw-semibold text-dark" htmlFor="mfaCheck">
                Enable Two-Factor Authentication (2FA) via Authenticator App
              </label>
            </div>
            <div className="form-check">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="policyCheck" 
                checked={acceptPolicy} 
                onChange={(e) => setAcceptPolicy(e.target.checked)} 
              />
              <label className="form-check-label small text-secondary" htmlFor="policyCheck">
                I accept the <strong>{orgName} Security & Compliance Policy</strong>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn text-white w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            style={{ background: primaryColor, border: 'none' }}
          >
            Complete Setup & Access Dashboard <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstLoginPasswordPage;

/**
 * CreateCorporateAdminPage — Screen 4: Create Corporate Administrator
 * Final step of onboarding workflow to assign the Corporate Admin.
 * Routes to: /customers/:id/create-admin
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, UserPlus, ArrowLeft, Mail, Key, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import FormContainer from '@components/forms/FormContainer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { useOrganizations } from '@contexts/OrganizationContext';

const CreateCorporateAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations, activeOrg, updateOrganizationAdmin } = useOrganizations();
  
  const org = organizations.find(
    (o) => String(o.id) === String(id) || String(o.internalId) === String(id)
  ) || activeOrg || organizations[0];

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [adminForm, setAdminForm] = useState({
    firstName: 'Siddharth',
    lastName: 'Narayanan',
    email: org?.corporateAdminEmail || `admin@${org?.subdomain || 'org'}.com`,
    phone: '+91 98400 11223',
    employeeId: 'EMP-9042',
    designation: 'Chief Security Officer & VP Infra',
    tempPassword: 'GtmSmartGate@2026',
    confirmPassword: 'GtmSmartGate@2026',
    enable2FA: true,
    sendWelcomeEmail: true,
    sendCredentials: true,
  });

  const hasExistingAdmin = org?.corporateAdmin && org.corporateAdmin !== 'Pending Assignment';

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (updateOrganizationAdmin) {
        await updateOrganizationAdmin(org.id, adminForm);
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to provision administrator account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AppLayout
        title="Corporate Administrator Provisioned"
        subtitle="Initial administrator account created and invitation sent."
      >
        <div className="card text-center p-5 mx-auto" style={{ maxWidth: '640px', marginTop: 'var(--space-6)' }}>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--color-success-bg)', 
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Corporate Administrator Created
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            Account provisioned for <strong>{adminForm.firstName} {adminForm.lastName}</strong> ({adminForm.email})
          </p>

          <div className="p-3 bg-light border rounded-3 text-start mb-4" style={{ fontSize: 'var(--text-sm)' }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-success fw-semibold">
              <Mail size={16} /> Invitation Email Sent
            </div>
            <div className="text-secondary mb-2">
              An activation email containing password setup instructions and portal login links was sent to <code>{adminForm.email}</code>.
            </div>
            <div className="d-flex align-items-center gap-2 text-primary fw-semibold">
              <ShieldCheck size={16} /> Two-Factor Authentication Enforced
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Button variant="primary" onClick={() => navigate(`/customers/${org.id}`)}>
              <LayoutDashboard size={14} /> Go to Organization Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate('/customers')}>
              Return to Organizations
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Create Corporate Administrator"
      subtitle={`The Corporate Administrator will manage ${org.name}'s Smart Gate platform.`}
      actions={
        <Button variant="secondary" onClick={() => navigate(`/customers/${org.id}`)}>
          <ArrowLeft size={14} /> Back to Details
        </Button>
      }
    >
      <FormContainer
        title={`Corporate Administrator Setup — ${org?.name}`}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="secondary" onClick={() => navigate(`/customers/${org.id}`)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              <UserPlus size={14} /> {submitting ? 'Provisioning…' : 'Create Administrator'}
            </Button>
          </div>
        }
      >
        {hasExistingAdmin && (
          <div className="alert alert-warning py-2 mb-4" style={{ fontSize: 13, borderRadius: 8 }}>
            ⚠️ <strong>Existing Corporate Admin:</strong> {org.corporateAdmin} ({org.corporateAdminEmail}). Updating this form will reassign the primary Corporate Admin role for this organization.
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2 mb-4" style={{ fontSize: 13, borderRadius: 8 }}>
            ⚠️ {error}
          </div>
        )}
        <div className="form-row">
          <Input 
            label="First Name" 
            required 
            value={adminForm.firstName}
            onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
          />
          <Input 
            label="Last Name" 
            required 
            value={adminForm.lastName}
            onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
          />
        </div>

        <div className="form-row">
          <Input 
            label="Work Email Address" 
            type="email" 
            required 
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            helper="Primary login username & notification recipient"
          />
          <Input 
            label="Phone Number" 
            value={adminForm.phone}
            onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
          />
        </div>

        <div className="form-row">
          <Input 
            label="Employee ID (Optional)" 
            value={adminForm.employeeId}
            onChange={(e) => setAdminForm({ ...adminForm, employeeId: e.target.value })}
          />
          <Input 
            label="Designation / Title" 
            value={adminForm.designation}
            onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Temporary Password <span className="required">*</span></label>
            <div className="position-relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                value={adminForm.tempPassword}
                onChange={(e) => setAdminForm({ ...adminForm, tempPassword: e.target.value })}
              />
              <button 
                type="button"
                className="position-absolute end-0 top-50 translate-middle-y btn btn-sm btn-link text-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <Input 
            label="Confirm Password" 
            type={showPassword ? 'text' : 'password'}
            required 
            value={adminForm.confirmPassword}
            onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">System Security Role</label>
          <Input 
            value="Corporate Administrator (Full System Scope)" 
            disabled 
            helper="Pre-configured role with top-level tenant management privileges"
          />
        </div>

        <div className="card p-3 bg-light border mt-4">
          <div className="fw-semibold text-dark mb-2">Notification & Security Controls</div>
          <div className="d-flex flex-column gap-2">
            <label className="d-flex align-items-center gap-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={adminForm.enable2FA}
                onChange={(e) => setAdminForm({ ...adminForm, enable2FA: e.target.checked })}
              />
              <span>Enable Two-Factor Authentication (Mandatory on First Login)</span>
            </label>
            <label className="d-flex align-items-center gap-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={adminForm.sendWelcomeEmail}
                onChange={(e) => setAdminForm({ ...adminForm, sendWelcomeEmail: e.target.checked })}
              />
              <span>Send Welcome Email with Portal Instructions</span>
            </label>
            <label className="d-flex align-items-center gap-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={adminForm.sendCredentials}
                onChange={(e) => setAdminForm({ ...adminForm, sendCredentials: e.target.checked })}
              />
              <span>Send One-Time Login Credentials via Encrypted Email</span>
            </label>
          </div>
        </div>
      </FormContainer>
    </AppLayout>
  );
};

export default CreateCorporateAdminPage;

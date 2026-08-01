/**
 * CreateUserWizardPage — Screen 5: Create User Wizard
 * 5 Steps: Personal Information -> Role Selection -> Site Assignment -> Permissions -> Review -> Success
 * Route: /org/users/new
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, ArrowRight, Save, CheckCircle2, ShieldCheck, MapPin, Check } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import FormContainer from '@components/forms/FormContainer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';

const WIZARD_STEPS = [
  { id: 1, label: 'Personal Information' },
  { id: 2, label: 'Role Selection' },
  { id: 3, label: 'Site Assignment' },
  { id: 4, label: 'Permissions Preview' },
  { id: 5, label: 'Review & Confirm' },
];

const ROLES = [
  { name: 'Corporate Admin', desc: 'Full organizational & portal configuration access' },
  { name: 'Site Admin', desc: 'Administrative control over assigned campus gates & staff' },
  { name: 'HR Manager', desc: 'Employee import, host approvals & VIP visitor registration' },
  { name: 'Receptionist', desc: 'Front desk visitor check-in, pass printing & badge issuing' },
  { name: 'Security Manager', desc: 'SOC gate monitoring, incident logs & blacklist management' },
  { name: 'Gate Operator', desc: 'Kiosk entry/exit scanning & vehicle ANPR verification' },
];

const CreateUserWizardPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const id = orgId || 1;
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    email: 'ananya.deshmukh@apollotyres.com',
    phone: '+91 98400 99887',
    employeeId: 'EMP-940',
    designation: 'Senior Front Desk Officer',
    department: 'Administration',
    role: 'Receptionist',
    defaultSite: 'Head Office Chennai',
    additionalSites: ['Limda Plant 1'],
    sendWelcomeEmail: true,
    generatePassword: true,
  });

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <OrganizationLayout
        title="User Account Provisioned"
        subtitle="The portal user has been created and permissions allocated."
      >
        <div className="card text-center p-5 mx-auto" style={{ maxWidth: '640px', marginTop: 'var(--space-6)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            User Account Created Successfully
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            Account provisioned for <strong>{form.firstName} {form.lastName}</strong> ({form.email}) with role <Badge variant="primary">{form.role}</Badge>
          </p>

          <div className="p-3 bg-light border rounded-3 text-start mb-4" style={{ fontSize: 'var(--text-sm)' }}>
            <div className="fw-semibold text-primary mb-1">Welcome Email Sent</div>
            <div className="text-secondary mb-2">Login instructions and single-use temporary password emailed to <code>{form.email}</code>.</div>
            <div className="fw-semibold text-dark">Default Gate Scope: <strong>{form.defaultSite}</strong></div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" onClick={() => navigate(`/org/${id}/users`)}>
              Return to Users List
            </Button>
            <Button variant="secondary" onClick={() => { setIsSuccess(false); setStep(1); }}>
              Create Another User
            </Button>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout
      title="Create User Wizard"
      subtitle="Multi-step wizard to register a new user and assign site permissions."
      actions={<Button variant="ghost" onClick={() => navigate(`/org/${id}/users`)}>Cancel</Button>}
    >
      {/* Wizard Progress Navigation */}
      <div className="card p-3 mb-4 flex-between">
        <span className="fw-semibold text-primary">Step {step} of 5: {WIZARD_STEPS[step - 1].label}</span>
        <div className="d-flex gap-2">
          {WIZARD_STEPS.map(s => (
            <span key={s.id} className={`badge ${s.id === step ? 'badge-primary' : s.id < step ? 'badge-success' : 'badge-neutral'}`}>
              {s.id < step ? '✓' : s.id}
            </span>
          ))}
        </div>
      </div>

      <FormContainer
        title={`Step ${step}: ${WIZARD_STEPS[step - 1].label}`}
        footer={
          <div className="flex-between w-100">
            {step > 1 ? <Button variant="secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</Button> : <div />}
            <Button variant="primary" onClick={handleNext}>
              {step === 5 ? 'Create User' : 'Continue'} <ArrowRight size={14} />
            </Button>
          </div>
        }
      >
        {step === 1 && (
          <>
            <div className="form-row">
              <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="form-row">
              <Input label="Work Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-row-3">
              <Input label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
              <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} options={[
                { label: 'Administration', value: 'Administration' },
                { label: 'Security & Operations', value: 'Security' },
                { label: 'HR & People Ops', value: 'HR' },
                { label: 'Manufacturing', value: 'Manufacturing' }
              ]} />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="row g-3">
            {ROLES.map(r => (
              <div key={r.name} className="col-12 col-md-6">
                <div onClick={() => setForm({ ...form, role: r.name })} className={`card p-3 cursor-pointer border ${form.role === r.name ? 'border-primary bg-primary-subtle' : ''}`}>
                  <div className="fw-bold text-dark mb-1">{r.name}</div>
                  <div className="text-secondary small">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <>
            <Select label="Default Primary Site Gate" value={form.defaultSite} onChange={(e) => setForm({ ...form, defaultSite: e.target.value })} options={[
              { label: 'Head Office Chennai', value: 'Head Office Chennai' },
              { label: 'Limda Plant 1', value: 'Limda Plant 1' },
              { label: 'Limda Plant 2', value: 'Limda Plant 2' },
              { label: 'Perambra Unit', value: 'Perambra Unit' }
            ]} />
            <div className="form-group mt-3">
              <label className="form-label">Additional Campus Access</label>
              <div className="d-flex flex-column gap-2">
                {['Limda Plant 1', 'Limda Plant 2', 'Perambra Unit'].map(s => (
                  <label key={s} className="d-flex align-items-center gap-2 cursor-pointer small">
                    <input type="checkbox" checked={form.additionalSites.includes(s)} onChange={(e) => {
                      const list = e.target.checked ? [...form.additionalSites, s] : form.additionalSites.filter(x => x !== s);
                      setForm({ ...form, additionalSites: list });
                    }} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="card p-3 bg-light border">
            <div className="fw-bold text-dark mb-2">Role Permissions Summary: {form.role}</div>
            <ul className="small text-secondary ps-3">
              <li>Check-in and check-out visitors at front desk kiosks</li>
              <li>Print visitor ID badges and send SMS OTP pass links</li>
              <li>View expected visitor schedule for {form.defaultSite}</li>
              <li>Pre-approve guest visitors on behalf of host employees</li>
            </ul>
          </div>
        )}

        {step === 5 && (
          <div className="d-flex flex-column gap-3 text-sm">
            <div className="card p-3 bg-light border">
              <div><strong>Name:</strong> {form.firstName} {form.lastName} ({form.email})</div>
              <div><strong>Role:</strong> <Badge variant="primary">{form.role}</Badge></div>
              <div><strong>Default Site:</strong> {form.defaultSite}</div>
            </div>
          </div>
        )}
      </FormContainer>
    </OrganizationLayout>
  );
};

export default CreateUserWizardPage;

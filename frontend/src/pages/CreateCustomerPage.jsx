/**
 * CreateOrganizationWizard — Screen 2: Multi-step Onboarding Wizard
 * 5 Steps: Information -> Location -> Branding -> Subscription -> Review -> Success
 * Route: /customers/new
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Palette, CreditCard, ShieldCheck, CheckCircle2,
  ArrowLeft, ArrowRight, Save, UserPlus, ExternalLink, Globe, Phone, Mail, FileText
} from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import FormContainer from '@components/forms/FormContainer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import WizardNavigation from '@modules/organizations/components/WizardNavigation';
import { useOrganizations } from '@contexts/OrganizationContext';

const WIZARD_STEPS = [
  { id: 1, label: 'Organization Information' },
  { id: 2, label: 'Location Details' },
  { id: 3, label: 'Branding & Subdomain' },
  { id: 4, label: 'Subscription Plan' },
  { id: 5, label: 'Review & Confirm' },
];

const CreateOrganizationWizard = () => {
  const navigate = useNavigate();
  const { addOrganization } = useOrganizations();
  const [step, setStep] = useState(1);
  const [createdOrg, setCreatedOrg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    name: 'Bharat Electronics Limited',
    displayName: 'BEL Aerospace',
    code: 'BEL-HQ',
    industry: 'Defense & Aerospace',
    description: 'Premier defense electronics company under the Ministry of Defence, Government of India.',
    website: 'https://www.bel-india.in',
    gstNumber: '29AAACB0123Q1ZP',
    supportEmail: 'gate.support@bel.co.in',
    supportPhone: '+91 80 2503 9300',
    // Step 2
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    address: 'Outer Ring Road, Nagavara, Bengaluru',
    postalCode: '560045',
    timezone: 'Asia/Kolkata (UTC+05:30)',
    currency: 'INR (₹)',
    // Step 3
    logo: null,
    primaryColor: '#004B87',
    secondaryColor: '#FFB800',
    subdomain: 'bel',
    // Step 4
    plan: 'Enterprise',
    licenseCount: '250',
    storageLimit: '500 GB',
    visitorCapacity: '50000',
    smsCredits: '10000',
    emailCredits: '25000',
    startDate: '2026-08-01',
    expiryDate: '2027-08-01',
    enableTrial: false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const newOrg = await addOrganization(formData);
        if (newOrg && newOrg.id) {
          setCreatedOrg(newOrg);
        } else {
          setSubmitError('Organization was created but could not retrieve its ID. Please check the Organizations list.');
        }
      } catch (err) {
        setSubmitError(err?.error?.message || err?.message || 'Failed to create organization. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (createdOrg) {
    return (
      <AppLayout
        title="Organization Created Successfully"
        subtitle="The organization has been provisioned and added to the GTM Smart Gate SaaS platform."
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
            {createdOrg.name} is Ready!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            Organization Code: <code>{createdOrg.code}</code> • Subdomain: <a href={`https://${createdOrg.portalUrl}`} target="_blank" rel="noreferrer">{createdOrg.portalUrl}</a>
          </p>

          <div 
            className="p-3 bg-light border rounded-3 text-start mb-4" 
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <div className="fw-semibold text-primary mb-1">Next Step: Assign Corporate Admin</div>
            <div className="text-secondary">
              To complete the onboarding workflow, create the initial Corporate Administrator account who will manage this organization's sites and settings.
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Button variant="primary" onClick={() => navigate(`/customers/${createdOrg.id}/create-admin`)}>
              <UserPlus size={14} /> Create Corporate Admin
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/customers/${createdOrg.id}`)}>
              Go to Organization Details
            </Button>
            <Button variant="ghost" onClick={() => navigate('/customers')}>
              Return to Organizations
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Create Organization Wizard"
      subtitle="Complete multi-step onboarding workflow to provision a new customer into GTM Smart Gate."
      actions={
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          Cancel & Exit
        </Button>
      }
    >
      <WizardNavigation steps={WIZARD_STEPS} currentStep={step} />

      <FormContainer
        title={
          step === 1 ? 'Step 1: Organization Information' :
          step === 2 ? 'Step 2: Location & Region Configuration' :
          step === 3 ? 'Step 3: Branding & Subdomain Allocation' :
          step === 4 ? 'Step 4: Subscription & Capacity Limits' :
          'Step 5: Final Review & Confirmation'
        }
        footer={
          <div style={{ width: '100%' }}>
            {submitError && (
              <div className="alert alert-danger py-2 mb-2" style={{ fontSize: 13 }}>
                ⚠️ {submitError}
              </div>
            )}
            <div className="d-flex align-items-center justify-content-between w-100">
              <div>
                {step > 1 && (
                  <Button variant="secondary" onClick={handleBack} disabled={submitting}>
                    <ArrowLeft size={14} /> Back
                  </Button>
                )}
              </div>
              <div className="d-flex gap-2">
                <Button variant="secondary" onClick={() => alert('Draft saved successfully!')} disabled={submitting}>
                  <Save size={14} /> Save Draft
                </Button>
                <Button variant="primary" onClick={handleNext} disabled={submitting}>
                  {submitting ? '⏳ Creating…' : step === 5 ? 'Create Organization' : 'Continue'} {!submitting && <ArrowRight size={14} />}
                </Button>
              </div>
            </div>
          </div>
        }
      >
        {/* STEP 1: General Info */}
        {step === 1 && (
          <>
            <div className="form-row">
              <Input 
                label="Organization Name" 
                required 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. Apollo Tyres Ltd"
              />
              <Input 
                label="Organization Code" 
                required 
                value={formData.code} 
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())} 
                helper="Unique uppercase tag used in gate logs (e.g. APOLLO)"
              />
            </div>
            <div className="form-row">
              <Select 
                label="Industry Sector" 
                required
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                options={[
                  { label: 'Defense & Aerospace', value: 'Defense & Aerospace' },
                  { label: 'Manufacturing & Industrial', value: 'Manufacturing & Industrial' },
                  { label: 'Automotive & Mobility', value: 'Automotive & Mobility' },
                  { label: 'Information Technology', value: 'Information Technology' },
                  { label: 'Education & Research', value: 'Education & Research' },
                  { label: 'Healthcare & Pharmaceuticals', value: 'Healthcare & Pharmaceuticals' },
                ]}
              />
              <Input 
                label="Website URL" 
                value={formData.website} 
                onChange={(e) => handleChange('website', e.target.value)} 
                placeholder="https://www.example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Organization Description</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief summary of operations, sites, and employee base..."
              />
            </div>
            <div className="form-row-3">
              <Input 
                label="GST / Tax Identification Number" 
                value={formData.gstNumber} 
                onChange={(e) => handleChange('gstNumber', e.target.value)} 
                placeholder="e.g. 29AAACB0123Q1ZP"
              />
              <Input 
                label="Support Contact Email" 
                type="email"
                value={formData.supportEmail} 
                onChange={(e) => handleChange('supportEmail', e.target.value)} 
              />
              <Input 
                label="Support Contact Phone" 
                value={formData.supportPhone} 
                onChange={(e) => handleChange('supportPhone', e.target.value)} 
              />
            </div>
          </>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <>
            <div className="form-row">
              <Select 
                label="Country" 
                required
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                options={[
                  { label: 'India', value: 'India' },
                  { label: 'United States', value: 'United States' },
                  { label: 'Singapore', value: 'Singapore' },
                  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
                ]}
              />
              <Input 
                label="State / Province" 
                value={formData.state} 
                onChange={(e) => handleChange('state', e.target.value)} 
              />
            </div>
            <div className="form-row">
              <Input 
                label="City" 
                value={formData.city} 
                onChange={(e) => handleChange('city', e.target.value)} 
              />
              <Input 
                label="Postal / ZIP Code" 
                value={formData.postalCode} 
                onChange={(e) => handleChange('postalCode', e.target.value)} 
              />
            </div>
            <Input 
              label="Headquarters Address" 
              value={formData.address} 
              onChange={(e) => handleChange('address', e.target.value)} 
            />
            <div className="form-row">
              <Select 
                label="System Timezone" 
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                options={[
                  { label: 'Asia/Kolkata (IST - UTC+05:30)', value: 'Asia/Kolkata (UTC+05:30)' },
                  { label: 'America/New_York (EST - UTC-05:00)', value: 'America/New_York (UTC-05:00)' },
                  { label: 'Europe/London (GMT - UTC+00:00)', value: 'Europe/London (UTC+00:00)' },
                ]}
              />
              <Select 
                label="Billing Currency" 
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                options={[
                  { label: 'INR (₹) — Indian Rupee', value: 'INR (₹)' },
                  { label: 'USD ($) — US Dollar', value: 'USD ($)' },
                  { label: 'EUR (€) — Euro', value: 'EUR (€)' },
                ]}
              />
            </div>
          </>
        )}

        {/* STEP 3: Branding */}
        {step === 3 && (
          <>
            <div className="form-row">
              <Input 
                label="Display Short Name" 
                value={formData.displayName} 
                onChange={(e) => handleChange('displayName', e.target.value)} 
                helper="Appears on visitor badges and SMS passes"
              />
              <div className="form-group">
                <label className="form-label">Tenant Subdomain <span className="required">*</span></label>
                <div style={{ display: 'flex' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.subdomain} 
                    onChange={(e) => handleChange('subdomain', e.target.value.toLowerCase())} 
                    style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }} 
                  />
                  <span 
                    style={{ 
                      background: 'var(--color-bg-muted)', 
                      border: '1px solid var(--color-border)', 
                      borderLeft: 'none', 
                      padding: '8px 12px', 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-secondary)', 
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0' 
                    }}
                  >
                    .smartgate.gtm.com
                  </span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <Input 
                label="Primary Brand Color" 
                type="color" 
                value={formData.primaryColor} 
                onChange={(e) => handleChange('primaryColor', e.target.value)} 
                style={{ height: 42, padding: 2 }}
              />
              <Input 
                label="Secondary Accent Color" 
                type="color" 
                value={formData.secondaryColor} 
                onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                style={{ height: 42, padding: 2 }}
              />
            </div>

            <Input 
              label="Organization Logo Upload" 
              type="file" 
              helper="High resolution PNG/SVG with transparent background"
            />

            {/* Subdomain & Card Preview */}
            <div className="card p-3 mt-4 bg-light border">
              <div className="fw-semibold text-secondary small text-uppercase mb-2">Live Portal & Badge Preview</div>
              <div className="p-3 rounded-3 bg-white border shadow-sm flex-between">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 8, 
                      background: formData.primaryColor, 
                      color: '#FFF', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: 18
                    }}
                  >
                    {formData.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{formData.displayName}</div>
                    <div className="text-secondary small">https://{formData.subdomain}.smartgate.gtm.com</div>
                  </div>
                </div>
                <Badge variant="primary" style={{ background: `${formData.primaryColor}15`, color: formData.primaryColor, border: `1px solid ${formData.primaryColor}40` }}>
                  Custom Branded Tenant
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* STEP 4: Subscription */}
        {step === 4 && (
          <>
            <div className="form-group mb-4">
              <label className="form-label">Subscription Tier <span className="required">*</span></label>
              <div className="row g-3">
                {[
                  { name: 'Enterprise', desc: 'Custom capacity, 24/7 dedicated SOC support & unlimited sites', tag: 'Recommended' },
                  { name: 'Professional', desc: 'Up to 10 Sites, 10,000 monthly visitors & standard support', tag: 'Popular' },
                  { name: 'Trial', desc: '14-day evaluation environment with starter limits', tag: 'Evaluation' }
                ].map((p) => (
                  <div key={p.name} className="col-12 col-md-4">
                    <div 
                      onClick={() => handleChange('plan', p.name)}
                      className={`card p-3 cursor-pointer h-100 border ${formData.plan === p.name ? 'border-primary bg-primary-subtle' : ''}`}
                      style={{ transition: 'var(--transition-base)' }}
                    >
                      <div className="flex-between mb-2">
                        <span className="fw-bold text-dark">{p.name}</span>
                        <Badge variant={p.name === 'Enterprise' ? 'primary' : 'neutral'}>{p.tag}</Badge>
                      </div>
                      <p className="text-secondary small mb-0">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row-3">
              <Input 
                label="License Count (Gate Terminals)" 
                type="number" 
                value={formData.licenseCount} 
                onChange={(e) => handleChange('licenseCount', e.target.value)} 
              />
              <Input 
                label="Storage Quota" 
                value={formData.storageLimit} 
                onChange={(e) => handleChange('storageLimit', e.target.value)} 
              />
              <Input 
                label="Visitor Capacity Limit" 
                value={formData.visitorCapacity} 
                onChange={(e) => handleChange('visitorCapacity', e.target.value)} 
              />
            </div>

            <div className="form-row">
              <Input 
                label="SMS Gateway Credits" 
                value={formData.smsCredits} 
                onChange={(e) => handleChange('smsCredits', e.target.value)} 
              />
              <Input 
                label="Email Gateway Credits" 
                value={formData.emailCredits} 
                onChange={(e) => handleChange('emailCredits', e.target.value)} 
              />
            </div>

            <div className="form-row">
              <Input 
                label="Subscription Start Date" 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => handleChange('startDate', e.target.value)} 
              />
              <Input 
                label="Subscription Expiry Date" 
                type="date" 
                value={formData.expiryDate} 
                onChange={(e) => handleChange('expiryDate', e.target.value)} 
              />
            </div>
          </>
        )}

        {/* STEP 5: Review */}
        {step === 5 && (
          <div className="d-flex flex-column gap-4">
            <div className="card p-3 bg-light border">
              <div className="flex-between mb-3 border-bottom pb-2">
                <span className="fw-bold text-dark">1. Organization Details</span>
                <Button variant="ghost" size="xs" onClick={() => setStep(1)}>Edit</Button>
              </div>
              <div className="row g-2 text-sm">
                <div className="col-6"><strong>Name:</strong> {formData.name} ({formData.code})</div>
                <div className="col-6"><strong>Industry:</strong> {formData.industry}</div>
                <div className="col-6"><strong>GST No:</strong> {formData.gstNumber}</div>
                <div className="col-6"><strong>Support Email:</strong> {formData.supportEmail}</div>
              </div>
            </div>

            <div className="card p-3 bg-light border">
              <div className="flex-between mb-3 border-bottom pb-2">
                <span className="fw-bold text-dark">2. Location & Region</span>
                <Button variant="ghost" size="xs" onClick={() => setStep(2)}>Edit</Button>
              </div>
              <div className="row g-2 text-sm">
                <div className="col-6"><strong>HQ Location:</strong> {formData.city}, {formData.state}, {formData.country}</div>
                <div className="col-6"><strong>Timezone / Currency:</strong> {formData.timezone} • {formData.currency}</div>
              </div>
            </div>

            <div className="card p-3 bg-light border">
              <div className="flex-between mb-3 border-bottom pb-2">
                <span className="fw-bold text-dark">3. Branding & Subdomain</span>
                <Button variant="ghost" size="xs" onClick={() => setStep(3)}>Edit</Button>
              </div>
              <div className="row g-2 text-sm">
                <div className="col-6"><strong>Subdomain Portal:</strong> {formData.subdomain}.smartgate.gtm.com</div>
                <div className="col-6"><strong>Primary Accent Color:</strong> <span style={{ color: formData.primaryColor }}>■ {formData.primaryColor}</span></div>
              </div>
            </div>

            <div className="card p-3 bg-light border">
              <div className="flex-between mb-3 border-bottom pb-2">
                <span className="fw-bold text-dark">4. Subscription Plan</span>
                <Button variant="ghost" size="xs" onClick={() => setStep(4)}>Edit</Button>
              </div>
              <div className="row g-2 text-sm">
                <div className="col-6"><strong>Tier Plan:</strong> <Badge variant="primary">{formData.plan}</Badge></div>
                <div className="col-6"><strong>License Terminals:</strong> {formData.licenseCount} Terminals</div>
                <div className="col-6"><strong>Storage / Visitor Limits:</strong> {formData.storageLimit} • {formData.visitorCapacity}</div>
                <div className="col-6"><strong>Validity Period:</strong> {formData.startDate} to {formData.expiryDate}</div>
              </div>
            </div>
          </div>
        )}
      </FormContainer>
    </AppLayout>
  );
};

export default CreateOrganizationWizard;

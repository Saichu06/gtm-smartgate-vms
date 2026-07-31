/**
 * Create Customer Page Component
 * 4-Step Customer Onboarding Wizard (Details -> Branding -> Subscription -> Corporate Admin).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@layouts/AppLayout';
import FormContainer from '@components/forms/FormContainer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Button from '@components/ui/Button';

const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <AppLayout
      title="Create Customer Account"
      subtitle="4-step onboarding wizard to register a new tenant enterprise on GTM Smart Gate platform."
      breadcrumbs={['Customers', 'Create Customer']}
    >
      <div className="stepper">
        <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
          <span>Customer Details</span>
        </div>
        <div className="step-connector" />
        <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
          <span>Branding & Subdomain</span>
        </div>
        <div className="step-connector" />
        <div className={`step ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
          <span>Subscription Plan</span>
        </div>
        <div className="step-connector" />
        <div className={`step ${step === 4 ? 'active' : ''}`}>
          <div className="step-circle">4</div>
          <span>Corporate Admin</span>
        </div>
      </div>

      <FormContainer
        title={
          step === 1 ? 'Step 1: General Company Information' :
          step === 2 ? 'Step 2: Custom Branding & Tenant Subdomain' :
          step === 3 ? 'Step 3: SaaS License & Billing Allocation' :
          'Step 4: Initial Corporate Administrator Setup'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => step === 1 ? navigate('/customers') : setStep(step - 1)}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (step === 4) {
                  alert('Customer account created and portal provisioned successfully!');
                  navigate('/customers');
                } else {
                  setStep(step + 1);
                }
              }}
            >
              {step === 4 ? 'Complete & Provision Portal' : 'Next Step →'}
            </Button>
          </>
        }
      >
        {step === 1 && (
          <>
            <div className="form-row">
              <Input label="Company / Entity Name" required defaultValue="Bharat Electronics Ltd" />
              <Input label="Customer Code / Short ID" required defaultValue="BEL-HQ" helper="Unique uppercase prefix for system identification." />
            </div>
            <div className="form-row">
              <Select
                label="Industry Sector"
                defaultValue="Manufacturing"
                options={[
                  { label: 'Manufacturing & Industrial', value: 'Manufacturing' },
                  { label: 'IT & Software Services', value: 'IT' },
                  { label: 'Educational Campus', value: 'Education' },
                  { label: 'Healthcare & Pharma', value: 'Healthcare' },
                ]}
              />
              <Input label="Contact Phone Number" defaultValue="+91 80 2503 9300" />
            </div>
            <Input label="Headquarters Address" defaultValue="Outer Ring Road, Nagavara, Bengaluru, Karnataka 560045" />
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">Dedicated Smart Gate Subdomain <span className="required">*</span></label>
              <div style={{ display: 'flex' }}>
                <input type="text" className="form-control" defaultValue="bel" style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }} />
                <span style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderLeft: 'none', padding: '8px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                  .smartgate.gtm.com
                </span>
              </div>
              <p className="form-helper">This will be the customer's portal login URL.</p>
            </div>
            <div className="form-row">
              <Input label="Upload Company Logo" type="file" helper="PNG or SVG with transparent background (300x80px)." />
              <Input label="Primary Brand Accent Color" type="color" defaultValue="#1565C0" style={{ height: '38px', padding: '2px' }} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="form-group">
              <label className="form-label">Select Enterprise Subscription Tier <span className="required">*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: '8px' }}>
                <div style={{ border: '2px solid var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: 'var(--text-lg)' }}>Enterprise SaaS</h4>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-2xl)', margin: '8px 0' }}>Custom Pricing</div>
                  <p className="text-muted text-xs">Unlimited Sites • Dedicated SLA • 24/7 Support</p>
                </div>
                <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <h4>Professional Plan</h4>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-2xl)', margin: '8px 0' }}>₹45,000 / mo</div>
                  <p className="text-muted text-xs">Up to 10 Sites • 10,000 Visitors / mo</p>
                </div>
                <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <h4>Starter Plan</h4>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-2xl)', margin: '8px 0' }}>₹15,000 / mo</div>
                  <p className="text-muted text-xs">Up to 2 Sites • 2,000 Visitors / mo</p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="form-row">
              <Input label="Corporate Admin Full Name" required defaultValue="Rajesh K. Sharma" />
              <Input label="Work Email Address" required type="email" defaultValue="rajesh.sharma@bel.co.in" helper="Activation link will be emailed to set initial password." />
            </div>
            <div className="form-row">
              <Input label="Mobile Phone Number" defaultValue="+91 98400 11223" />
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                <input type="checkbox" id="welcome-mail" defaultChecked />
                <label htmlFor="welcome-mail" style={{ fontSize: 'var(--text-sm)' }}>Send welcome email with tenant portal activation instructions</label>
              </div>
            </div>
          </>
        )}
      </FormContainer>
    </AppLayout>
  );
};

export default CreateCustomerPage;

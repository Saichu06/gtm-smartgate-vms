/**
 * Settings Page Component
 * Tabbed global platform settings (Application, SMTP Email, S3 Storage).
 */
import React, { useState } from 'react';
import AppLayout from '@layouts/AppLayout';
import FormContainer from '@components/forms/FormContainer';
import Input from '@components/forms/Input';
import Button from '@components/ui/Button';

const SettingsPage = () => {
  const [saved, setSaved] = useState(false);

  return (
    <AppLayout
      title="System Settings"
      subtitle="Global platform configuration, mail gateways, storage endpoints, and security policies."
    >
      <FormContainer
        title="Global Platform Configuration"
        description="Core platform identity, SMTP email server settings, and cloud storage bucket credentials."
        footer={
          <Button variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
            {saved ? 'Saved!' : 'Save Platform Settings'}
          </Button>
        }
      >
        <div className="form-row">
          <Input label="Platform Title" defaultValue="GTM Smart Gate VMS Enterprise" />
          <Input label="Support Email" defaultValue="support@smartgate.gtm.com" />
        </div>

        <hr className="divider" />

        <h4 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-3)' }}>Email & SMTP Gateway Config</h4>
        <div className="form-row">
          <Input label="SMTP Host Server" defaultValue="smtp.sendgrid.net" />
          <Input label="SMTP Port" defaultValue="587" />
        </div>
        <div className="form-row">
          <Input label="Sender Name" defaultValue="GTM Smart Gate Security" />
          <Input label="Sender Email Address" defaultValue="noreply@smartgate.gtm.com" />
        </div>

        <hr className="divider" />

        <h4 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-3)' }}>Global Storage Bucket (AWS S3)</h4>
        <div className="form-row">
          <Input label="S3 Bucket Name" defaultValue="gtm-smartgate-production-uploads" />
          <Input label="AWS Region" defaultValue="ap-south-1" />
        </div>
      </FormContainer>
    </AppLayout>
  );
};

export default SettingsPage;

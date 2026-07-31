/**
 * Settings Page Component
 * Tabbed global platform settings (Application, SMTP Email, S3 Storage).
 */
import React from 'react';
import AppLayout from '@layouts/AppLayout';
import FormContainer from '@components/forms/FormContainer';
import Input from '@components/forms/Input';
import Button from '@components/ui/Button';

import settingsData from '@mock/settings.json';

const SettingsPage = () => {
  return (
    <AppLayout
      title="System Settings"
      subtitle="Global platform configuration, mail gateways, storage endpoints, and security policies."
    >
      <FormContainer
        title="Global Platform Configuration"
        description="Core platform identity, SMTP email server settings, and cloud storage bucket credentials."
        footer={
          <Button variant="primary" onClick={() => alert('Platform settings saved successfully!')}>
            Save Platform Settings
          </Button>
        }
      >
        <div className="form-row">
          <Input label="Platform Title" defaultValue={settingsData.application.title} />
          <Input label="Support Email" defaultValue={settingsData.application.supportEmail} />
        </div>

        <hr className="divider" />

        <h4 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-3)' }}>Email & SMTP Gateway Config</h4>
        <div className="form-row">
          <Input label="SMTP Host Server" defaultValue={settingsData.email.smtpHost} />
          <Input label="SMTP Port" defaultValue={settingsData.email.smtpPort} />
        </div>
        <div className="form-row">
          <Input label="Sender Name" defaultValue={settingsData.email.senderName} />
          <Input label="Sender Email Address" defaultValue={settingsData.email.senderEmail} />
        </div>

        <hr className="divider" />

        <h4 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-3)' }}>Global Storage Bucket (AWS S3)</h4>
        <div className="form-row">
          <Input label="S3 Bucket Name" defaultValue={settingsData.storage.s3Bucket} />
          <Input label="AWS Region" defaultValue={settingsData.storage.region} />
        </div>
      </FormContainer>
    </AppLayout>
  );
};

export default SettingsPage;

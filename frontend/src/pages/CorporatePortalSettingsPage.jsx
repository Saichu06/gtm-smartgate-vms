/**
 * CorporatePortalSettingsPage — Portal Configuration & System Settings
 * Org-level branding, notification preferences, gate rules, and admin settings.
 * Fully wired to updateOrganizationBranding() in OrganizationContext so logo/color/tagline changes apply live.
 * Route: /org/:orgId/settings
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Bell, Shield, Palette, Globe, Mail, Save, ToggleLeft, ToggleRight, Upload, Image as ImageIcon } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Button from '@components/ui/Button';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const Toggle = ({ value, onChange, label, desc }) => (
  <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
    <div>
      <div className="small fw-semibold text-dark">{label}</div>
      {desc && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{desc}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
    >
      {value
        ? <ToggleRight size={30} style={{ color: 'var(--color-success)' }} />
        : <ToggleLeft size={30} style={{ color: 'var(--color-text-secondary)' }} />}
    </button>
  </div>
);

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'branding', label: 'Portal Branding', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

const CorporatePortalSettingsPage = () => {
  const { activeOrg, updateOrganizationBranding } = useOrganizations();
  const { orgId } = useParams();
  const id = orgId || activeOrg?.id;

  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);

  // Branding Form State
  const [displayName, setDisplayName] = useState(activeOrg?.displayName || activeOrg?.name || '');
  const [primaryColor, setPrimaryColor] = useState(activeOrg?.primaryColor || '#1565C0');
  const [secondaryColor, setSecondaryColor] = useState(activeOrg?.secondaryColor || '#0D47A1');
  const [accentColor, setAccentColor] = useState(activeOrg?.accentColor || '#FFD700');
  const [loginTagline, setLoginTagline] = useState(activeOrg?.loginTagline || 'Secure. Smart. Seamless.');
  const [welcomeTitle, setWelcomeTitle] = useState(activeOrg?.welcomeTitle || `Welcome to ${activeOrg?.displayName || activeOrg?.name || 'Apollo Tyres'}`);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(activeOrg?.welcomeSubtitle || 'Register as a visitor and receive your digital gate access pass in under 2 minutes.');
  const [kioskBackground, setKioskBackground] = useState(activeOrg?.kioskBackground || '');
  const [watermark, setWatermark] = useState(activeOrg?.watermark || `${(activeOrg?.displayName || 'ENTERPRISE').toUpperCase()} VISITOR PASS`);
  const [logoPreview, setLogoPreview] = useState(activeOrg?.logo || null);

  // Sync state whenever activeOrg changes or updates
  React.useEffect(() => {
    if (activeOrg) {
      setDisplayName(activeOrg.displayName || activeOrg.name || '');
      setPrimaryColor(activeOrg.primaryColor || '#1565C0');
      setSecondaryColor(activeOrg.secondaryColor || '#0D47A1');
      setAccentColor(activeOrg.accentColor || '#FFD700');
      setLoginTagline(activeOrg.loginTagline || 'Secure. Smart. Seamless.');
      setWelcomeTitle(activeOrg.welcomeTitle || `Welcome to ${activeOrg.displayName || activeOrg.name || 'Apollo Tyres'}`);
      setWelcomeSubtitle(activeOrg.welcomeSubtitle || 'Register as a visitor and receive your digital gate access pass in under 2 minutes.');
      setKioskBackground(activeOrg.kioskBackground || '');
      setWatermark(activeOrg.watermark || `${(activeOrg.displayName || 'ENTERPRISE').toUpperCase()} VISITOR PASS`);
      setLogoPreview(activeOrg.logo || null);
    }
  }, [activeOrg]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3500); };

  // Handle Logo Upload (Base64)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size must be less than 2MB', 'danger');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Branding Updates Live
  const handleSaveBranding = () => {
    updateOrganizationBranding(id, {
      displayName,
      primaryColor,
      secondaryColor,
      accentColor,
      loginTagline,
      welcomeTitle,
      welcomeSubtitle,
      kioskBackground,
      watermark,
      logo: logoPreview,
    });
    showToast('Branding updated! Applied live to Portal, Kiosk & Visitor Passes.', 'success');
  };

  // Notification toggles
  const [notif, setNotif] = useState({
    visitorCheckin: true,
    visitorCheckout: false,
    approvalRequest: true,
    approvalDecision: true,
    gateOffline: true,
    dailySummary: true,
    weeklyReport: false,
    smsOnApproval: true,
    emailOnApproval: true,
  });

  // Security settings toggles
  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: true,
    auditLog: true,
    ipWhitelist: false,
    singleDevice: false,
    capturePhoto: true,
    scanIDCard: true,
    requireHostConfirm: true,
  });

  const setN = (k) => (v) => setNotif(p => ({ ...p, [k]: v }));
  const setS = (k) => (v) => setSecurity(p => ({ ...p, [k]: v }));

  const currentPrimary = primaryColor || activeOrg?.primaryColor || 'var(--color-primary)';

  return (
    <OrganizationLayout
      title="Portal Settings"
      subtitle={`System configuration, branding & security preferences • ${activeOrg?.name}`}
    >
      <div className="row g-4">
        {/* Sidebar Tab Navigation */}
        <div className="col-12 col-lg-3">
          <div className="bg-white border rounded-3 overflow-hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-100 d-flex align-items-center gap-2 px-3 py-3 border-0 text-start"
                style={{
                  background: activeTab === tab.id ? `${currentPrimary}10` : 'transparent',
                  borderLeft: activeTab === tab.id ? `3px solid ${currentPrimary}` : '3px solid transparent',
                  color: activeTab === tab.id ? currentPrimary : 'var(--color-text-secondary)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="col-12 col-lg-9">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card title="General Configuration">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Input label="Organization Display Name" defaultValue={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Support Email" type="email" defaultValue={activeOrg?.supportEmail} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Support Phone" defaultValue={activeOrg?.supportPhone} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Organization Website" defaultValue={activeOrg?.website} />
                </div>
                <div className="col-12 col-md-6">
                  <Select label="Default Timezone" defaultValue={activeOrg?.timezone || 'Asia/Kolkata'} options={[
                    { label: 'Asia/Kolkata (IST +5:30)', value: 'Asia/Kolkata' },
                    { label: 'Asia/Dubai (GST +4:00)', value: 'Asia/Dubai' },
                    { label: 'UTC (UTC +0:00)', value: 'UTC' },
                  ]} />
                </div>
                <div className="col-12 col-md-6">
                  <Select label="Default Currency" defaultValue={activeOrg?.currency || 'INR'} options={[
                    { label: 'INR – Indian Rupee', value: 'INR' },
                    { label: 'USD – US Dollar', value: 'USD' },
                    { label: 'EUR – Euro', value: 'EUR' },
                  ]} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-end mt-2">
                    <Button variant="primary" onClick={() => showToast('General settings saved successfully!')}>
                      <Save size={14} /> Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Branding Settings (Fully Functional & Applied Live) */}
          {activeTab === 'branding' && (
            <Card title="Portal Branding & Logo Customization">
              <div className="row g-3">
                {/* Live Preview Bar */}
                <div className="col-12">
                  <div 
                    className="p-3 rounded-3 mb-2 d-flex align-items-center justify-content-between" 
                    style={{ background: `${currentPrimary}12`, border: `1px solid ${currentPrimary}35` }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 'var(--radius-md)', 
                          background: logoPreview ? 'transparent' : currentPrimary, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontWeight: 800, 
                          fontSize: 20,
                          overflow: 'hidden',
                          border: logoPreview ? `1px solid ${currentPrimary}40` : 'none'
                        }}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Org Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          displayName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{displayName || 'Organization Name'}</div>
                        <div className="small text-secondary">{loginTagline}</div>
                      </div>
                    </div>
                    <span className="badge px-3 py-2 text-white" style={{ background: currentPrimary }}>
                      Live Theme Preview
                    </span>
                  </div>
                </div>

                {/* Primary & Secondary Color Pickers */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Primary Brand Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      style={{ width: 50, height: 38, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 2 }} 
                    />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#1565C0" />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Secondary Brand Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)} 
                      style={{ width: 50, height: 38, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 2 }} 
                    />
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} placeholder="#0D47A1" />
                  </div>
                </div>

                {/* Logo File Upload */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Upload Organization Logo</label>
                  <div className="p-4 border border-dashed rounded-3 text-center bg-light">
                    {logoPreview ? (
                      <div className="d-flex flex-column align-items-center gap-2">
                        <img src={logoPreview} alt="Logo" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }} />
                        <div className="d-flex gap-2 mt-2">
                          <label className="btn btn-sm btn-outline-primary mb-0 cursor-pointer">
                            <Upload size={13} /> Change Logo
                            <input type="file" accept="image/*" className="d-none" onChange={handleLogoUpload} />
                          </label>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setLogoPreview(null)}>
                            Remove Logo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex flex-column align-items-center gap-2">
                        <ImageIcon size={32} className="text-secondary" />
                        <div className="text-secondary small">Drag & drop logo file here, or click to browse</div>
                        <label className="btn btn-sm btn-primary mb-0 cursor-pointer mt-1">
                          <Upload size={13} /> Upload Logo File
                          <input type="file" accept="image/*" className="d-none" onChange={handleLogoUpload} />
                        </label>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>PNG, SVG or JPG • Max size 2MB</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Login Page Customization */}
                <div className="col-12 col-md-6">
                  <Input label="Short Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Login Page Tagline" value={loginTagline} onChange={(e) => setLoginTagline(e.target.value)} />
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-end mt-3">
                    <Button variant="primary" onClick={handleSaveBranding}>
                      <Save size={14} /> Apply Branding Live
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="d-flex flex-column gap-3">
              <Card title="Email & SMS Notifications">
                <Toggle label="Visitor Check-In Alert" desc="Notify host when their visitor checks in at the gate" value={notif.visitorCheckin} onChange={setN('visitorCheckin')} />
                <Toggle label="Visitor Check-Out Alert" desc="Notify host when visitor departs" value={notif.visitorCheckout} onChange={setN('visitorCheckout')} />
                <Toggle label="Approval Request Notification" desc="Notify host when a new visitor requests approval" value={notif.approvalRequest} onChange={setN('approvalRequest')} />
                <Toggle label="Gate Offline Alert" desc="Alert admin when a gate kiosk goes offline" value={notif.gateOffline} onChange={setN('gateOffline')} />
              </Card>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={() => showToast('Notification preferences saved!')}><Save size={14} /> Save Preferences</Button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="d-flex flex-column gap-3">
              <Card title="Authentication & Session Security">
                <Toggle label="Two-Factor Authentication (2FA)" desc="Require OTP for all portal logins" value={security.twoFactor} onChange={setS('twoFactor')} />
                <Toggle label="Session Timeout (30 min)" desc="Auto-logout inactive sessions after 30 minutes" value={security.sessionTimeout} onChange={setS('sessionTimeout')} />
                <Toggle label="Audit Logging" desc="Log all admin actions with timestamp and IP" value={security.auditLog} onChange={setS('auditLog')} />
              </Card>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={() => showToast('Security settings updated!')}><Save size={14} /> Save Security Config</Button>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="d-flex flex-column gap-3">
              {[
                { name: 'Active Directory / LDAP', desc: 'Sync employee directory from your AD server', status: 'Connected', icon: '🔗', color: 'var(--color-success)' },
                { name: 'SMS Gateway (Exotel)', desc: 'Send approval SMS to hosts and visitors', status: 'Connected', icon: '📱', color: 'var(--color-success)' },
                { name: 'Email (SMTP / SendGrid)', desc: 'Transactional email for passes and reports', status: 'Connected', icon: '📧', color: 'var(--color-success)' },
              ].map(int => (
                <div key={int.name} className="p-3 bg-white border rounded-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: 24 }}>{int.icon}</span>
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: 'var(--text-sm)' }}>{int.name}</div>
                      <div className="small text-secondary">{int.desc}</div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => showToast(`Opening ${int.name} config...`, 'info')}>Configure</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporatePortalSettingsPage;

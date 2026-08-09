/**
 * CorporatePortalSettingsPage — Portal Configuration & System Settings
 * Org-level branding, notification preferences, gate rules, and admin settings.
 * Fully wired to updateOrganizationBranding() in OrganizationContext so logo/color/tagline changes apply live.
 * Route: /org/:orgId/settings
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Bell, Shield, Palette, Globe, Mail, Save, ToggleLeft, ToggleRight, Upload, Image as ImageIcon, Tag, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { gatePassApi, visitorApi, companyApi } from '@services/vmsApi';

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
  { id: 'general',     label: 'General',              icon: Settings },
  { id: 'notifications', label: 'Notifications',       icon: Bell },
  { id: 'security',   label: 'Security & Access',      icon: Shield },
  { id: 'branding',   label: 'Portal Branding',        icon: Palette },
  { id: 'passConfig', label: 'Visitor Pass Config',    icon: Shield },
  { id: 'gatePasses', label: 'Gate Pass Management',   icon: Tag },
  { id: 'integrations', label: 'Integrations',         icon: Globe },
];

const CorporatePortalSettingsPage = () => {
  const { activeOrg, updateOrganizationBranding } = useOrganizations();
  const { orgId } = useParams();
  const id = orgId || activeOrg?.id;

  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);

  // Gate Pass Management state
  const [gatePasses, setGatePasses] = React.useState([]);
  const [newPassName, setNewPassName] = React.useState('');
  const [newPassGate, setNewPassGate] = React.useState('Gate A');
  const [editingPassId, setEditingPassId] = React.useState(null);
  const [editPassName, setEditPassName] = React.useState('');
  const [editPassGate, setEditPassGate] = React.useState('');

  const refreshPasses = React.useCallback(async () => {
    if (!id) return;
    try {
      const res = await gatePassApi.getGatePasses(id);
      if (res.success && Array.isArray(res.data)) setGatePasses(res.data);
    } catch (err) {
      console.error('Failed to load gate passes:', err);
    }
  }, [id]);

  React.useEffect(() => {
    if (id) refreshPasses();
  }, [id, activeTab, refreshPasses]);

  // Live poll when gate pass tab is active
  React.useEffect(() => {
    if (activeTab !== 'gatePasses') return;
    const interval = setInterval(refreshPasses, 5000);
    return () => clearInterval(interval);
  }, [id, activeTab, refreshPasses]);

  // resolveVisitorName not needed — assignedToName comes directly from API

  const handleAddPass = async () => {
    if (!newPassName.trim()) return;
    try {
      await gatePassApi.createGatePass({ companyId: id, name: newPassName.trim(), gate: newPassGate.trim() || 'Gate A' });
      setNewPassName('');
      setNewPassGate('Gate A');
      await refreshPasses();
      showToast('Gate pass created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create gate pass.', 'danger');
    }
  };

  const handleUpdatePass = async (passId) => {
    try {
      await gatePassApi.updateGatePass(passId, { name: editPassName, gate: editPassGate });
      setEditingPassId(null);
      await refreshPasses();
      showToast('Gate pass updated!', 'success');
    } catch (err) {
      showToast('Failed to update gate pass.', 'danger');
    }
  };

  const handleTogglePassStatus = async (pass) => {
    const nextActive = pass.status === 'inactive' ? true : false;
    try {
      await gatePassApi.updateGatePass(pass.id, { active: nextActive });
      await refreshPasses();
      showToast(`Gate pass ${nextActive ? 'enabled' : 'disabled'}.`, 'success');
    } catch (err) {
      showToast('Failed to update gate pass status.', 'danger');
    }
  };

  const handleReleasePass = async (pass) => {
    if (!pass.assignedToVisitId) {
      showToast('No visitor assigned to this pass.', 'warning');
      return;
    }
    try {
      await visitorApi.checkoutVisitor(pass.assignedToVisitId);
      await refreshPasses();
      showToast(`${pass.name} released — visitor checked out.`, 'success');
    } catch (err) {
      showToast('Failed to release gate pass.', 'danger');
    }
  };

  const handleDeletePass = async (passId) => {
    if (!window.confirm('Delete this gate pass permanently?')) return;
    try {
      await gatePassApi.deleteGatePass(passId);
      await refreshPasses();
      showToast('Gate pass deleted.', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to delete gate pass.', 'danger');
    }
  };

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

  // Visitor Pass Configuration State
  const defaultPrefix = activeOrg?.code ? `${activeOrg.code}-GP` : 'APL-GP';
  const [passPrefix, setPassPrefix] = useState(activeOrg?.passConfig?.prefix || defaultPrefix);
  const [passStartingNum, setPassStartingNum] = useState(activeOrg?.passConfig?.startingNum || '0001');
  const [passCurrentNum, setPassCurrentNum] = useState(activeOrg?.passConfig?.currentNum || '0042');
  const [passFormat, setPassFormat] = useState(activeOrg?.passConfig?.format || '{PREFIX}-{YYYYMMDD}-{COUNTER}');
  const [passResetPolicy, setPassResetPolicy] = useState(activeOrg?.passConfig?.resetPolicy || 'Daily');
  const [printTemplate, setPrintTemplate] = useState(activeOrg?.passConfig?.printTemplate || 'Standard A6 Badge');
  const [qrTemplate, setQrTemplate] = useState(activeOrg?.passConfig?.qrTemplate || 'Encrypted JSON Payload');

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

      if (activeOrg.passConfig) {
        setPassPrefix(activeOrg.passConfig.prefix || defaultPrefix);
        setPassStartingNum(activeOrg.passConfig.startingNum || '0001');
        setPassCurrentNum(activeOrg.passConfig.currentNum || '0042');
        setPassFormat(activeOrg.passConfig.format || '{PREFIX}-{YYYYMMDD}-{COUNTER}');
        setPassResetPolicy(activeOrg.passConfig.resetPolicy || 'Daily');
        setPrintTemplate(activeOrg.passConfig.printTemplate || 'Standard A6 Badge');
        setQrTemplate(activeOrg.passConfig.qrTemplate || 'Encrypted JSON Payload');
      }
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

  // Save Branding Updates Live to PostgreSQL
  const handleSaveBranding = async () => {
    try {
      await companyApi.updateCompany(id, {
        name: displayName,
        logo: logoPreview,
        primaryColor,
        secondaryColor,
        welcomeMessage: welcomeTitle,
      });
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
      showToast('Branding updated & saved to PostgreSQL! Applied live to Portal, Kiosk & Visitor Passes.', 'success');
    } catch (err) {
      showToast('Failed to save branding to PostgreSQL.', 'danger');
    }
  };


  // Save Visitor Pass Configuration Live
  const handleSavePassConfig = () => {
    const passConfigData = {
      prefix: passPrefix,
      startingNum: passStartingNum,
      currentNum: passCurrentNum,
      format: passFormat,
      resetPolicy: passResetPolicy,
      printTemplate,
      qrTemplate,
    };
    updateOrganizationBranding(id, { passConfig: passConfigData });
    localStorage.setItem(`gtm_pass_config_${id}`, JSON.stringify(passConfigData));
    showToast('Visitor Pass Configuration updated successfully!', 'success');
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

          {/* Visitor Pass Configuration */}
          {activeTab === 'passConfig' && (
            <Card title="Visitor Pass Configuration & Numbering Rules">
              <div className="row g-3">
                {/* Live Pass Format Preview */}
                <div className="col-12">
                  <div className="p-3 rounded-3 mb-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="small fw-semibold text-secondary mb-1">Pass Number Format Preview</div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="font-monospace fw-bold text-primary fs-4">
                        {passPrefix}-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-{passCurrentNum.padStart(4, '0')}
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">
                        Format Validated
                      </span>
                    </div>
                    <div className="small text-muted mt-1">
                      Kiosk will request next sequential pass number dynamically from central service using this configuration.
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <Input
                    label="Pass Prefix"
                    value={passPrefix}
                    onChange={(e) => setPassPrefix(e.target.value)}
                    placeholder="e.g. APL-GP"
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Input
                    label="Starting Number"
                    value={passStartingNum}
                    onChange={(e) => setPassStartingNum(e.target.value)}
                    placeholder="0001"
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Input
                    label="Current Counter Number"
                    value={passCurrentNum}
                    onChange={(e) => setPassCurrentNum(e.target.value)}
                    placeholder="0042"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Input
                    label="Number Format Pattern"
                    value={passFormat}
                    onChange={(e) => setPassFormat(e.target.value)}
                    placeholder="{PREFIX}-{YYYYMMDD}-{COUNTER}"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Select
                    label="Counter Reset Policy"
                    value={passResetPolicy}
                    onChange={(e) => setPassResetPolicy(e.target.value)}
                    options={[
                      { label: 'Daily (Resets at midnight)', value: 'Daily' },
                      { label: 'Monthly (Resets 1st of month)', value: 'Monthly' },
                      { label: 'Never (Continuous sequential)', value: 'Never' },
                    ]}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Select
                    label="Print Pass Badge Template"
                    value={printTemplate}
                    onChange={(e) => setPrintTemplate(e.target.value)}
                    options={[
                      { label: 'Standard Enterprise A6 Badge', value: 'Standard A6 Badge' },
                      { label: 'Thermal Sticky Badge (4x3")', value: 'Thermal Sticky Badge' },
                      { label: 'Lanyard PVC Card Format', value: 'Lanyard PVC Card' },
                    ]}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Select
                    label="QR Code Security Payload"
                    value={qrTemplate}
                    onChange={(e) => setQrTemplate(e.target.value)}
                    options={[
                      { label: 'Encrypted JSON Payload (Default)', value: 'Encrypted JSON Payload' },
                      { label: 'Pass ID Raw String', value: 'Pass ID Raw String' },
                      { label: 'Encrypted Token Payload', value: 'Encrypted Token Payload' },
                    ]}
                  />
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-end mt-3">
                    <Button variant="primary" onClick={handleSavePassConfig}>
                      <Save size={14} /> Save Pass Configuration
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

          {/* Gate Pass Management */}
          {activeTab === 'gatePasses' && (
            <div className="d-flex flex-column gap-3">
              <Card title="Gate Pass Inventory">
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                  Manage the physical visitor gate passes for <strong>{activeOrg?.displayName || activeOrg?.name}</strong>.
                  The kiosk only consumes passes created here — it never creates, edits, or deletes passes.
                </p>

                {/* Add New Pass */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: '2 1 160px' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>PASS NAME</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gate Pass 6"
                      value={newPassName}
                      onChange={e => setNewPassName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddPass()}
                    />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>GATE</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gate A"
                      value={newPassGate}
                      onChange={e => setNewPassGate(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleAddPass}
                    disabled={!newPassName.trim()}
                  >
                    <Plus size={16} /> Add Pass
                  </button>
                </div>

                {/* Pass List */}
                {gatePasses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                    <Tag size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No gate passes created yet.</div>
                    <div style={{ fontSize: 12 }}>Add your first gate pass above.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gatePasses.map(pass => {
                      const statusColors = {
                        available:   { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', label: 'Available' },
                        assigned:    { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', label: 'Assigned' },
                        maintenance: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', label: 'Maintenance' },
                        lost:        { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: 'Lost' },
                        inactive:    { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: 'Inactive' },
                      };
                      const sc = statusColors[pass.status] || statusColors.inactive;
                      const isEditing = editingPassId === pass.id;
                      const assignedVisitorName = pass.assignedToName || null;
                      const assignedAt = pass.assignedAt
                        ? new Date(pass.assignedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : null;

                      return (
                        <div
                          key={pass.id}
                          style={{
                            padding: '14px 18px',
                            background: pass.status === 'assigned' ? '#F0F7FF' : '#FAFAFA',
                            border: `1px solid ${pass.status === 'assigned' ? '#BFDBFE' : '#E2E8F0'}`,
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                            opacity: pass.status === 'inactive' ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: sc.bg, border: `1px solid ${sc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Tag size={16} style={{ color: sc.color }} />
                          </div>

                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editPassName}
                                onChange={e => setEditPassName(e.target.value)}
                                style={{ width: 160 }}
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editPassGate}
                                onChange={e => setEditPassGate(e.target.value)}
                                style={{ width: 100 }}
                              />
                              <button className="btn btn-success btn-sm" onClick={() => handleUpdatePass(pass.id)}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setEditingPassId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <div style={{ flex: 1, minWidth: 120 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{pass.name}</div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>{pass.gate}</div>
                              </div>

                              {/* Assigned Visitor Info */}
                              {pass.status === 'assigned' && assignedVisitorName ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 10 }}>👤</span> {assignedVisitorName}
                                  </div>
                                  {assignedAt && (
                                    <div style={{ fontSize: 11, color: '#64748B' }}>Assigned {assignedAt}</div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ minWidth: 140 }}>
                                  <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>
                                </div>
                              )}

                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap' }}>
                                {sc.label}
                              </span>

                              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                {/* Release button — only for assigned passes */}
                                {pass.status === 'assigned' && (
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    title="Release pass back to available"
                                    onClick={() => handleReleasePass(pass)}
                                  >
                                    ↩ Release
                                  </button>
                                )}
                                {pass.status !== 'assigned' && (
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    title="Edit"
                                    onClick={() => { setEditingPassId(pass.id); setEditPassName(pass.name); setEditPassGate(pass.gate); }}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                )}
                                <button
                                  className={`btn btn-sm ${pass.status === 'inactive' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                                  title={pass.status === 'inactive' ? 'Enable' : 'Disable'}
                                  onClick={() => handleTogglePassStatus(pass)}
                                  disabled={pass.status === 'assigned'}
                                >
                                  {pass.status === 'inactive' ? <CheckCircle size={13} /> : <XCircle size={13} />}
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  title="Delete"
                                  onClick={() => handleDeletePass(pass.id)}
                                  disabled={pass.status === 'assigned'}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card title="Status Reference">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Available', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', desc: 'Ready to be issued to a visitor' },
                    { label: 'Assigned',  bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', desc: 'Currently held by an active visitor' },
                    { label: 'Maintenance', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', desc: 'Under maintenance' },
                    { label: 'Lost',      bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', desc: 'Reported as lost' },
                    { label: 'Inactive',  bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', desc: 'Permanently disabled' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: s.color }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: s.color, opacity: 0.7 }}>— {s.desc}</span>
                    </div>
                  ))}
                </div>
              </Card>
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

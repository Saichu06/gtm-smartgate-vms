/**
 * CorporateSitesPage — Sites & Gate Terminals Module
 * Manage deployed sites, gate kiosks, and security configuration per location.
 * Self-created — reads/writes from localStorage.
 * Route: /org/:orgId/sites
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, PlusCircle, Edit, Settings, Wifi, WifiOff, Monitor, Users, Shield, Trash2, CheckCircle2, ExternalLink
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const SEED_SITES = [
  {
    id: 'SITE-001', name: 'Gate A — Main Entrance', code: 'GA-MAIN',
    location: `Headquarters`, type: 'Main Entrance',
    kiosks: 2, online: 2, officers: 1, visitorsToday: 0, status: 'Online',
    kioskUrl: '', lastSync: 'Just now'
  },
];

const statusColor = { Online: 'var(--color-success)', Partial: '#F57C00', Offline: 'var(--color-danger)' };
const statusVariant = { Online: 'success', Partial: 'warning', Offline: 'danger' };

const CorporateSitesPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;
  const primary = activeOrg?.primaryColor || '#1565C0';

  const [sites, setSites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`gtm_corp_sites_${currentOrgId}`) || '[]');
      return saved.length > 0 ? saved : SEED_SITES;
    } catch { return SEED_SITES; }
  });

  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '', type: 'Main Entrance', location: '', kiosks: '1', officers: '1'
  });

  useEffect(() => {
    // Sync visitor counts from localStorage
    const visitorData = JSON.parse(localStorage.getItem(`gtm_kiosk_visitors_${currentOrgId}`) || '[]');
    const updatedSites = sites.map(s => {
      const siteVisitors = visitorData.filter(v => (v.site || '').includes(s.name.split('—')[0].trim())).length;
      return { ...s, visitorsToday: siteVisitors };
    });
    setSites(updatedSites);
  }, [currentOrgId]);

  const saveSites = (updated) => {
    setSites(updated);
    try { localStorage.setItem(`gtm_corp_sites_${currentOrgId}`, JSON.stringify(updated)); } catch (e) {}
  };

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleAddSite = () => {
    if (!form.name.trim()) return;
    const newSite = {
      id: `SITE-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      code: form.code || form.name.toUpperCase().replace(/\s+/g, '-').slice(0, 10),
      location: form.location || activeOrg?.city || 'HQ',
      type: form.type,
      kiosks: parseInt(form.kiosks) || 1,
      online: parseInt(form.kiosks) || 1,
      officers: parseInt(form.officers) || 1,
      visitorsToday: 0,
      status: 'Online',
      kioskUrl: `/kiosk/${currentOrgId}`,
      lastSync: 'Just now'
    };
    saveSites([...sites, newSite]);
    setAddOpen(false);
    setForm({ name: '', code: '', type: 'Main Entrance', location: '', kiosks: '1', officers: '1' });
    showToast(`Site "${newSite.name}" configured and live!`, 'success');
  };

  const handleDeleteSite = (id, name) => {
    saveSites(sites.filter(s => s.id !== id));
    showToast(`Site "${name}" removed.`, 'warning');
  };

  const totalKiosks = sites.reduce((s, x) => s + x.kiosks, 0);
  const onlineKiosks = sites.reduce((s, x) => s + x.online, 0);
  const totalVisitors = sites.reduce((s, x) => s + (x.visitorsToday || 0), 0);

  return (
    <OrganizationLayout
      title="Sites & Gate Terminals"
      subtitle={`Gate infrastructure management across all deployed locations • ${activeOrg?.name}`}
    >
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Sites', value: sites.length, color: primary, sub: 'Deployed Locations' },
          { label: 'Gate Kiosks Online', value: `${onlineKiosks}/${totalKiosks}`, color: 'var(--color-success)', sub: 'Self-service terminals' },
          { label: 'Visitors Today', value: totalVisitors, color: 'var(--color-info)', sub: 'Across all gates' },
        ].map(k => (
          <div key={k.label} className="col-12 col-md-4">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="stat-label small fw-semibold text-secondary mb-1">{k.label}</div>
              <div className="stat-value h3 fw-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="small text-secondary">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="fw-semibold text-dark">Configured Gate Sites ({sites.length})</div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <PlusCircle size={14} /> Add New Site
        </Button>
      </div>

      {/* Site Cards Grid */}
      {sites.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded-3">
          <MapPin size={44} style={{ color: '#94A3B8', marginBottom: 12 }} />
          <div className="fw-semibold text-dark h5">No gate sites configured yet</div>
          <div className="text-secondary small mb-3">Add your first site above to start managing gate kiosks.</div>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <PlusCircle size={14} /> Add First Site
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {sites.map(site => (
            <div key={site.id} className="col-12 col-lg-6">
              <div className="p-4 bg-white border rounded-3 shadow-sm"
                style={{ borderLeft: `4px solid ${statusColor[site.status] || primary}` }}>
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <MapPin size={16} style={{ color: primary }} />
                      <span className="fw-semibold text-dark">{site.name}</span>
                      <Badge variant={statusVariant[site.status] || 'success'}>{site.status}</Badge>
                    </div>
                    <div className="text-secondary small">{site.location} · {site.type}</div>
                    <code style={{ fontSize: 10 }}>{site.code}</code>
                  </div>
                  <div className="d-flex gap-1">
                    {site.kioskUrl && (
                      <a
                        href={`/kiosk/${currentOrgId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-light"
                        title="Open Kiosk"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button className="btn btn-sm btn-light text-danger"
                      title="Delete Site"
                      onClick={() => handleDeleteSite(site.id, site.name)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="row g-2 mt-2">
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        {site.online === site.kiosks
                          ? <Wifi size={13} style={{ color: 'var(--color-success)' }} />
                          : <WifiOff size={13} style={{ color: 'var(--color-warning)' }} />}
                        <span className="small text-secondary">Kiosks</span>
                      </div>
                      <div className="fw-bold text-dark">{site.online}/{site.kiosks}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Online</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        <Users size={13} style={{ color: 'var(--color-info)' }} />
                        <span className="small text-secondary">Visitors</span>
                      </div>
                      <div className="fw-bold text-dark">{site.visitorsToday || 0}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Today</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        <Shield size={13} style={{ color: 'var(--color-warning)' }} />
                        <span className="small text-secondary">Officers</span>
                      </div>
                      <div className="fw-bold text-dark">{site.officers}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>On Duty</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 d-flex align-items-center justify-content-between">
                  <span className="text-secondary" style={{ fontSize: 11 }}>Last sync: {site.lastSync}</span>
                  <a
                    href={`/kiosk/${currentOrgId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: primary, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Launch Kiosk →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Drawer */}
      <Drawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Configure New Gate Site"
        onSave={handleAddSite}
      >
        <Input label="Site Name" placeholder="e.g., Gate B — East Entrance" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Site Code" placeholder="e.g., GB-EAST-01" value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value })} />
        <Select label="Site Type"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          options={[
            { label: 'Main Entrance', value: 'Main Entrance' },
            { label: 'Manufacturing Plant', value: 'Manufacturing Plant' },
            { label: 'Office Block', value: 'Office Block' },
            { label: 'Executive Zone', value: 'Executive Zone' },
            { label: 'Research Center', value: 'Research Center' },
            { label: 'Warehouse', value: 'Warehouse' },
            { label: 'Parking Gate', value: 'Parking Gate' },
          ]}
        />
        <Input label="City / Location" placeholder="e.g., Chennai, Tamil Nadu" value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })} />
        <Input label="Number of Kiosk Terminals" type="number" placeholder="e.g., 2" value={form.kiosks}
          onChange={e => setForm({ ...form, kiosks: e.target.value })} />
        <Input label="Security Officers on Duty" type="number" placeholder="e.g., 1" value={form.officers}
          onChange={e => setForm({ ...form, officers: e.target.value })} />
        <div className="p-3 rounded-3 small"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
          After saving, a self-service kiosk at <strong>/kiosk/{currentOrgId}</strong> will be linked to this site automatically.
        </div>
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateSitesPage;

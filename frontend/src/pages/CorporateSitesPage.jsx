/**
 * CorporateSitesPage — Sites & Gate Terminals Module
 * Manage deployed sites, gate kiosks, and security configuration per location.
 * Route: /org/:orgId/sites
 */
import React, { useState } from 'react';
import { MapPin, PlusCircle, Edit, Settings, Wifi, WifiOff, Monitor, Users, Shield } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const MOCK_SITES = [
  { id: 'SITE-001', name: 'Main Campus Gate', code: 'MCG-01', location: 'Chennai, Tamil Nadu', type: 'Manufacturing Plant', kiosks: 6, online: 6, officers: 3, visitorsToday: 420, status: 'Online', lastSync: '2 mins ago' },
  { id: 'SITE-002', name: 'North Wing Entrance', code: 'NWE-01', location: 'Chennai, Tamil Nadu', type: 'Office Block', kiosks: 4, online: 4, officers: 2, visitorsToday: 280, status: 'Online', lastSync: '5 mins ago' },
  { id: 'SITE-003', name: 'Plant 2 – Hosur Road', code: 'PL2-HOS', location: 'Hosur, Tamil Nadu', type: 'Manufacturing Plant', kiosks: 8, online: 7, officers: 4, visitorsToday: 580, status: 'Partial', lastSync: '15 mins ago' },
  { id: 'SITE-004', name: 'South Block Executive', code: 'SBE-01', location: 'Chennai, Tamil Nadu', type: 'Executive Zone', kiosks: 2, online: 2, officers: 2, visitorsToday: 64, status: 'Online', lastSync: '1 min ago' },
  { id: 'SITE-005', name: 'R&D Innovation Hub', code: 'RND-HUB', location: 'Bengaluru, Karnataka', type: 'Research Center', kiosks: 4, online: 0, officers: 0, visitorsToday: 0, status: 'Offline', lastSync: '4 hours ago' },
];

const statusColor = { Online: 'var(--color-success)', Partial: '#F57C00', Offline: 'var(--color-danger)' };
const statusVariant = { Online: 'success', Partial: 'warning', Offline: 'danger' };

const CorporateSitesPage = () => {
  const { activeOrg } = useOrganizations();
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const totalKiosks = MOCK_SITES.reduce((s, x) => s + x.kiosks, 0);
  const onlineKiosks = MOCK_SITES.reduce((s, x) => s + x.online, 0);
  const totalVisitors = MOCK_SITES.reduce((s, x) => s + x.visitorsToday, 0);
  const offlineSites = MOCK_SITES.filter(s => s.status === 'Offline').length;

  return (
    <OrganizationLayout
      title="Sites & Gate Terminals"
      subtitle={`Gate infrastructure management across all deployed locations • ${activeOrg?.name}`}
    >
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Sites', value: MOCK_SITES.length, color: 'var(--color-primary)', sub: 'Deployed Locations' },
          { label: 'Gate Kiosks Online', value: `${onlineKiosks}/${totalKiosks}`, color: 'var(--color-success)', sub: 'OCR + ANPR + Biometric' },
          { label: 'Visitors Today', value: totalVisitors.toLocaleString(), color: 'var(--color-info)', sub: 'Across all gates' },
          { label: 'Sites Offline', value: offlineSites, color: offlineSites > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)', sub: offlineSites > 0 ? 'Requires attention!' : 'All good' },
        ].map(k => (
          <div key={k.label} className="col-6 col-xl-3">
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
        <div className="fw-semibold text-dark">Configured Gate Sites ({MOCK_SITES.length})</div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <PlusCircle size={14} /> Add New Site
        </Button>
      </div>

      {/* Site Cards */}
      <div className="row g-3">
        {MOCK_SITES.map(site => (
          <div key={site.id} className="col-12 col-lg-6">
            <div className="p-4 bg-white border rounded-3 shadow-sm" style={{ borderLeft: `4px solid ${statusColor[site.status]}` }}>
              {/* Header */}
              <div className="flex-between mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <MapPin size={16} style={{ color: activeOrg?.primaryColor }} />
                    <span className="fw-semibold text-dark">{site.name}</span>
                    <Badge variant={statusVariant[site.status]}>{site.status}</Badge>
                  </div>
                  <div className="text-secondary small">{site.location} • {site.type}</div>
                  <code style={{ fontSize: 10 }}>{site.code}</code>
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-light" onClick={() => showToast(`Editing ${site.name}`)}><Edit size={13} /></button>
                  <button className="btn btn-sm btn-light" onClick={() => showToast(`${site.name} gate settings opened`, 'info')}><Settings size={13} /></button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="row g-2 mt-2">
                <div className="col-4">
                  <div className="p-2 bg-light rounded-3 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      {site.online === site.kiosks ? <Wifi size={13} style={{ color: 'var(--color-success)' }} /> : <WifiOff size={13} style={{ color: 'var(--color-warning)' }} />}
                      <span className="small text-secondary">Kiosks</span>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: 'var(--text-lg)' }}>{site.online}/{site.kiosks}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Online</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-light rounded-3 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <Users size={13} style={{ color: 'var(--color-info)' }} />
                      <span className="small text-secondary">Visitors</span>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: 'var(--text-lg)' }}>{site.visitorsToday}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Today</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-light rounded-3 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <Shield size={13} style={{ color: 'var(--color-warning)' }} />
                      <span className="small text-secondary">Officers</span>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: 'var(--text-lg)' }}>{site.officers}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>On Duty</div>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-secondary" style={{ fontSize: 11 }}>
                Last sync: {site.lastSync}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Site Drawer */}
      <Drawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Configure New Gate Site"
        onSave={() => { showToast('New site configured successfully!'); setAddOpen(false); }}
      >
        <Input label="Site Name" placeholder="e.g., East Gate – Perambra" />
        <Input label="Site Code" placeholder="e.g., EGP-01" />
        <Select label="Site Type" options={[
          { label: 'Manufacturing Plant', value: 'Manufacturing Plant' },
          { label: 'Office Block', value: 'Office Block' },
          { label: 'Warehouse', value: 'Warehouse' },
          { label: 'Executive Zone', value: 'Executive Zone' },
          { label: 'Research Center', value: 'Research Center' },
        ]} />
        <Input label="City / Location" placeholder="e.g., Perambra, Kerala" />
        <Input label="No. of Gate Kiosks" type="number" placeholder="e.g., 4" />
        <Input label="Security Officer In-Charge" placeholder="e.g., Suresh Kumar" />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateSitesPage;

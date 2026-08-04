/**
 * CorporateReportsPage — Analytics & Reporting Module
 * Visitor statistics derived from live org visitor data.
 * Route: /org/:orgId/reports
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Download, TrendingUp, TrendingDown, Users, UserCheck, MapPin, Clock } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Button from '@components/ui/Button';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';
import { getVisitors, formatHostName } from '@utils/orgStorage';

const CorporateReportsPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;
  const primary = activeOrg?.primaryColor || '#1565C0';

  const [period, setPeriod] = useState('30d');
  const [toast, setToast] = useState(null);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    const load = () => setVisitors(getVisitors(currentOrgId));
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [currentOrgId]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const stats = useMemo(() => {
    const total = visitors.length;
    const checkedIn = visitors.filter(v => v.status === 'Checked In').length;
    const checkedOut = visitors.filter(v => v.status === 'Checked Out').length;
    const pending = visitors.filter(v => v.status === 'Awaiting Approval').length;
    const rejected = visitors.filter(v => v.status === 'Rejected').length;

    const typeDist = {};
    visitors.forEach(v => {
      const t = v.type || 'Other';
      typeDist[t] = (typeDist[t] || 0) + 1;
    });

    const siteDist = {};
    visitors.forEach(v => {
      const s = v.site || 'Unknown Gate';
      siteDist[s] = (siteDist[s] || 0) + 1;
    });

    const hostDist = {};
    visitors.forEach(v => {
      const h = formatHostName(v.host);
      if (h !== '—') hostDist[h] = (hostDist[h] || 0) + 1;
    });

    const topSites = Object.entries(siteDist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

    const typeEntries = Object.entries(typeDist).sort((a, b) => b[1] - a[1]);
    const colors = ['#1565C0', '#2E7D32', '#F57C00', '#6A1B9A', '#C62828', '#212121', '#00838F'];

    return { total, checkedIn, checkedOut, pending, rejected, typeEntries, topSites, colors, hostDist };
  }, [visitors]);

  const exportCsv = () => {
    if (visitors.length === 0) { showToast('No visitor data to export', 'warning'); return; }
    const headers = ['Pass ID', 'Name', 'Company', 'Host', 'Site', 'Type', 'Status', 'Check-In'];
    const rows = visitors.map(v => [
      v.passId || v.id, v.name, v.company, formatHostName(v.host), v.site, v.type, v.status, v.checkin || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeOrg?.code || 'org'}-visitors-report.csv`;
    a.click();
    showToast('CSV report downloaded', 'success');
  };

  return (
    <OrganizationLayout
      title="Reports & Analytics"
      subtitle={`Visitor trends, gate activity, and compliance reports • ${activeOrg?.name}`}
    >
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex gap-2">
          {['1d', '7d', '30d', '3m', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="btn btn-sm"
              style={{
                background: period === p ? primary : 'var(--color-bg-muted)',
                color: period === p ? '#fff' : 'var(--color-text-primary)',
                border: `1px solid ${period === p ? primary : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 12,
              }}
            >
              {{ '1d': 'Today', '7d': '7 Days', '30d': '30 Days', '3m': '3 Months', '1y': '1 Year' }[p]}
            </button>
          ))}
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => showToast('PDF export coming soon', 'info')}>
            <Download size={14} /> Export PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Visitors', value: stats.total, icon: UserCheck, up: true },
          { label: 'Currently Inside', value: stats.checkedIn, icon: Users, up: stats.checkedIn > 0 },
          { label: 'Pending Approvals', value: stats.pending, icon: MapPin, up: false },
          { label: 'Rejected', value: stats.rejected, icon: Clock, up: false },
        ].map(k => (
          <div key={k.label} className="col-6 col-xl-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="stat-label small fw-semibold text-secondary">{k.label}</span>
                <k.icon size={16} style={{ color: primary }} />
              </div>
              <div className="stat-value h3 fw-bold text-dark mb-1">{k.value}</div>
              <div className={`small fw-medium ${k.up ? 'text-success' : 'text-secondary'}`}>
                {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} Live from kiosk data
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <Card title="Visitor Type Distribution">
            {stats.typeEntries.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <BarChart3 size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div>No visitor data yet. Register visitors via the kiosk to populate reports.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {stats.typeEntries.map(([type, count], i) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={type}>
                      <div className="d-flex justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: stats.colors[i % stats.colors.length] }} />
                          <span className="small text-dark">{type}</span>
                        </div>
                        <span className="small fw-semibold">{pct}% ({count})</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--color-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: stats.colors[i % stats.colors.length], borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="col-12 col-lg-5">
          <Card title="Top Host Employees">
            {Object.keys(stats.hostDist).length === 0 ? (
              <div className="text-center py-4 text-secondary small">Host activity will appear after kiosk registrations.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {Object.entries(stats.hostDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([host, count]) => (
                  <div key={host} className="d-flex justify-content-between p-2 bg-light rounded-3">
                    <span className="small fw-medium">{host}</span>
                    <span className="small fw-bold" style={{ color: primary }}>{count} visits</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <Card title="Gate / Site Traffic">
            {stats.topSites.length === 0 ? (
              <div className="text-center py-4 text-secondary small">No gate traffic data yet.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {stats.topSites.map((site, idx) => (
                  <div key={site.name}>
                    <div className="d-flex justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-secondary" style={{ fontSize: 11, width: 18 }}>#{idx + 1}</span>
                        <span className="small text-dark fw-medium">{site.name}</span>
                      </div>
                      <span className="small fw-semibold">{site.count} ({site.pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${site.pct}%`, background: primary, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="col-12 col-lg-5">
          <Card title="Generate Reports">
            <div className="d-flex flex-column gap-2">
              {[
                { label: 'Visitor Summary CSV', desc: 'All visitor records for this org', action: exportCsv },
                { label: 'Checked-In Report', desc: 'Visitors currently on premises', action: () => showToast(`${stats.checkedIn} visitors currently inside`, 'info') },
                { label: 'Approval Queue Report', desc: 'Pending host approvals', action: () => showToast(`${stats.pending} pending approvals`, 'info') },
              ].map(r => (
                <div key={r.label} className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3">
                  <div>
                    <div className="small fw-semibold text-dark">{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.desc}</div>
                  </div>
                  <button className="btn btn-sm btn-light d-flex align-items-center gap-1" onClick={r.action} style={{ fontSize: 12 }}>
                    <Download size={12} /> Run
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateReportsPage;

/**
 * CorporateReportsPage — Analytics & Reporting Module
 * Visitor statistics, gate activity trends, employee access logs, and exportable reports.
 * Route: /org/:orgId/reports
 */
import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, Users, UserCheck, MapPin, Clock } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const MONTHLY_DATA = [
  { month: 'Jan', visitors: 12400, checkins: 11800, pending: 600 },
  { month: 'Feb', visitors: 13200, checkins: 12600, pending: 600 },
  { month: 'Mar', visitors: 15800, checkins: 15100, pending: 700 },
  { month: 'Apr', visitors: 14200, checkins: 13500, pending: 700 },
  { month: 'May', visitors: 16400, checkins: 15900, pending: 500 },
  { month: 'Jun', visitors: 18200, checkins: 17600, pending: 600 },
  { month: 'Jul', visitors: 20100, checkins: 19400, pending: 700 },
];

const TOP_SITES = [
  { name: 'Main Campus Gate', visitors: 8420, pct: 42 },
  { name: 'North Wing Entrance', visitors: 4810, pct: 24 },
  { name: 'Plant 2 – Hosur Road', visitors: 3960, pct: 20 },
  { name: 'South Block Executive', visitors: 1840, pct: 9 },
  { name: 'R&D Innovation Hub', visitors: 1070, pct: 5 },
];

const VISITOR_TYPES_DIST = [
  { type: 'Business Visitor', count: 8200, pct: 41, color: '#1565C0' },
  { type: 'Vendor / Supplier', count: 4600, pct: 23, color: '#2E7D32' },
  { type: 'Contractor', count: 3200, pct: 16, color: '#F57C00' },
  { type: 'Job Candidate', count: 2400, pct: 12, color: '#6A1B9A' },
  { type: 'Auditor / Inspector', count: 1200, pct: 6, color: '#C62828' },
  { type: 'Government Official', count: 400, pct: 2, color: '#212121' },
];

const maxVisitors = Math.max(...MONTHLY_DATA.map(d => d.visitors));

const CorporateReportsPage = () => {
  const { activeOrg } = useOrganizations();
  const [period, setPeriod] = useState('30d');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const totalThisMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1].visitors;
  const totalLastMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2].visitors;
  const growth = (((totalThisMonth - totalLastMonth) / totalLastMonth) * 100).toFixed(1);

  return (
    <OrganizationLayout
      title="Reports & Analytics"
      subtitle={`Visitor trends, gate activity, and compliance reports • ${activeOrg?.name}`}
    >
      {/* Period Selector + Export */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex gap-2">
          {[
            { label: 'Today', value: '1d' },
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: '1 Year', value: '1y' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="btn btn-sm"
              style={{
                background: period === p.value ? activeOrg?.primaryColor || 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: period === p.value ? '#fff' : 'var(--color-text-primary)',
                border: `1px solid ${period === p.value ? activeOrg?.primaryColor || 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => showToast('Generating PDF report...', 'info')}>
            <Download size={14} /> Export PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => showToast('Exporting CSV data...', 'info')}>
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Visitors (Period)', value: '20,100', change: `+${growth}%`, up: true, icon: UserCheck },
          { label: 'Avg Daily Visitors', value: '670', change: '+8.2%', up: true, icon: Users },
          { label: 'Gate Uptime', value: '99.6%', change: '+0.2%', up: true, icon: MapPin },
          { label: 'Avg Wait Time', value: '2.4 min', change: '-18%', up: false, icon: Clock },
        ].map(k => (
          <div key={k.label} className="col-6 col-xl-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="stat-label small fw-semibold text-secondary">{k.label}</span>
                <k.icon size={16} style={{ color: activeOrg?.primaryColor || 'var(--color-primary)' }} />
              </div>
              <div className="stat-value h3 fw-bold text-dark mb-1">{k.value}</div>
              <div className={`small fw-medium ${k.up ? 'text-success' : 'text-danger'}`}>
                {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.change} vs last period
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Monthly Visitor Bar Chart */}
        <div className="col-12 col-lg-8">
          <Card title="Monthly Visitor Volume (2026)">
            <div style={{ height: 220 }}>
              <div className="d-flex align-items-end gap-2 h-100 px-2">
                {MONTHLY_DATA.map((d) => (
                  <div key={d.month} className="d-flex flex-column align-items-center gap-1" style={{ flex: 1 }}>
                    <div className="small fw-semibold text-dark" style={{ fontSize: 10 }}>
                      {(d.visitors / 1000).toFixed(1)}k
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                      <div
                        style={{
                          width: '100%',
                          background: activeOrg?.primaryColor || 'var(--color-primary)',
                          height: `${(d.visitors / maxVisitors) * 160}px`,
                          borderRadius: '4px 4px 0 0',
                          opacity: d.month === 'Jul' ? 1 : 0.5,
                          transition: 'height 0.3s ease',
                          minHeight: 8,
                        }}
                      />
                    </div>
                    <div className="text-secondary" style={{ fontSize: 10 }}>{d.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 mt-2 pt-2 border-top">
              <div className="d-flex align-items-center gap-1 small text-secondary">
                <span style={{ width: 10, height: 10, borderRadius: 2, background: activeOrg?.primaryColor, opacity: 1 }} />
                Current Month
              </div>
              <div className="d-flex align-items-center gap-1 small text-secondary">
                <span style={{ width: 10, height: 10, borderRadius: 2, background: activeOrg?.primaryColor, opacity: 0.5 }} />
                Previous Months
              </div>
            </div>
          </Card>
        </div>

        {/* Visitor Type Distribution */}
        <div className="col-12 col-lg-4">
          <Card title="Visitor Type Distribution">
            <div className="d-flex flex-column gap-3">
              {VISITOR_TYPES_DIST.map(v => (
                <div key={v.type}>
                  <div className="d-flex justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                      <span className="small text-dark" style={{ fontSize: 12 }}>{v.type}</span>
                    </div>
                    <span className="small fw-semibold">{v.pct}% ({v.count.toLocaleString()})</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${v.pct}%`, background: v.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Top Sites + Quick Report Links */}
      <div className="row g-3">
        {/* Top Sites by Traffic */}
        <div className="col-12 col-lg-7">
          <Card title="Top Sites by Visitor Traffic">
            <div className="d-flex flex-column gap-3">
              {TOP_SITES.map((site, idx) => (
                <div key={site.name}>
                  <div className="d-flex justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-secondary" style={{ fontSize: 11, width: 18 }}>#{idx + 1}</span>
                      <span className="small text-dark fw-medium">{site.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small fw-semibold">{site.visitors.toLocaleString()}</span>
                      <span className="small text-secondary">({site.pct}%)</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${site.pct}%`, background: activeOrg?.primaryColor || 'var(--color-primary)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Downloadable Report Types */}
        <div className="col-12 col-lg-5">
          <Card title="Generate Reports">
            <div className="d-flex flex-column gap-2">
              {[
                { label: 'Daily Visitor Summary', desc: 'All check-ins/outs for today', type: 'PDF' },
                { label: 'Monthly Compliance Report', desc: 'Full audit trail with timestamps', type: 'PDF' },
                { label: 'Employee Host Activity', desc: 'Who hosted how many visitors', type: 'CSV' },
                { label: 'Gate Uptime Report', desc: 'Kiosk availability & downtime log', type: 'CSV' },
                { label: 'Visitor Type Analytics', desc: 'Category-wise breakdown & trends', type: 'PDF' },
                { label: 'Security Incident Log', desc: 'Rejected passes & overrides', type: 'CSV' },
              ].map(r => (
                <div key={r.label} className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3">
                  <div>
                    <div className="small fw-semibold text-dark">{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.desc}</div>
                  </div>
                  <button
                    className="btn btn-sm btn-light d-flex align-items-center gap-1"
                    onClick={() => showToast(`${r.label} downloaded`, 'success')}
                    style={{ flexShrink: 0, fontSize: 12 }}
                  >
                    <Download size={12} /> {r.type}
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

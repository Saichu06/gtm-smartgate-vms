/**
 * CorporateDashboardPage — Screen 3: Operational Corporate Dashboard
 * Real-time operational overview for Organization's Visitor Management System.
 * Route: /org/dashboard
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserCheck, CheckCircle2, Users, MapPin, PlusCircle,
  UserPlus, FileCheck, AlertTriangle, Eye, Tablet
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import { useOrganizations } from '@contexts/OrganizationContext';
import { getVisitors, getEmployeeSeeds, storageKeys } from '@utils/orgStorage';

const CorporateDashboardPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { activeOrg } = useOrganizations();
  const id = orgId || activeOrg?.id || 1;
  const org = activeOrg;

  // All data driven from localStorage — no mock JSON imports
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);

  const loadData = () => {
    setVisitors(getVisitors(id));
    const savedEmps = JSON.parse(localStorage.getItem(storageKeys.employees(id)) || '[]');
    setEmployees(savedEmps.length > 0 ? savedEmps : getEmployeeSeeds(id));
    try { setSites(JSON.parse(localStorage.getItem(storageKeys.sites(id)) || '[]')); } catch { setSites([]); }
    try { setUsers(JSON.parse(localStorage.getItem(storageKeys.users(id)) || '[]')); } catch { setUsers([]); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    const onChanged = (e) => {
      if (String(e.detail?.orgId) === String(id)) loadData();
    };
    window.addEventListener('gtm-visitors-changed', onChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener('gtm-visitors-changed', onChanged);
    };
  }, [id]);

  const checkedIn = visitors.filter(v => v.status === 'Checked In').length;
  const checkedOut = visitors.filter(v => v.status === 'Checked Out').length;
  const pendingApprovals = visitors.filter(v => v.status === 'Awaiting Approval').length;
  const kioskCount = visitors.length;

  const kpis = {
    visitorsToday: kioskCount,
    checkedIn,
    checkedOut,
    pendingApprovals,
    totalEmployees: employees.length,
    totalSites: sites.length,
    totalUsers: users.length,
  };

  return (
    <OrganizationLayout
      title={`${org.displayName || org.name} Visitor Operations`}
      subtitle={`Live Visitor Management System control center • ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
    >
      {/* Quick Actions Strip */}
      <div className="bg-white border rounded-3 p-3 mb-4 shadow-sm flex-between flex-wrap gap-2">
        <div className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
          Operational Quick Actions ({org.code})
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate(`/org/${id}/visitors`)}>
            <PlusCircle size={14} /> Register Visitor
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/employees`)}>
            <UserPlus size={14} /> Add Employee
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/users/new`)}>
            <Users size={14} /> Create Portal User
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/sites`)}>
            <MapPin size={14} /> Manage Sites
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/approvals`)}
            style={kpis.pendingApprovals > 0 ? { background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80' } : {}}>
            <FileCheck size={14} /> Approve Visitors {kpis.pendingApprovals > 0 ? `(${kpis.pendingApprovals} pending)` : ''}
          </Button>
        </div>
      </div>

      {/* Today's KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Today\'s Visitors', value: kpis.visitorsToday, sub: 'Self-service kiosk check-ins', icon: <UserCheck size={16} color={org?.primaryColor || '#1565C0'} />, color: 'text-dark' },
          { label: 'Checked In', value: kpis.checkedIn, sub: 'Currently inside premises', icon: <CheckCircle2 size={16} className="text-success" />, color: 'text-success' },
          { label: 'Checked Out', value: kpis.checkedOut, sub: 'Exited today', icon: <Eye size={16} className="text-info" />, color: 'text-dark' },
          { label: 'Pending Approvals', value: kpis.pendingApprovals, sub: kpis.pendingApprovals > 0 ? 'Host action required' : 'Queue clear ✓', icon: <AlertTriangle size={16} className="text-warning" />, color: kpis.pendingApprovals > 0 ? 'text-warning' : 'text-dark' },
          { label: 'Employees', value: kpis.totalEmployees, sub: 'Added to directory', icon: <Users size={16} className="text-primary" />, color: 'text-dark' },
          { label: 'Active Sites', value: kpis.totalSites, sub: 'Gate locations deployed', icon: <MapPin size={16} className="text-success" />, color: 'text-dark' },
        ].map(k => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-2">
            <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
                <span className="stat-label small fw-semibold">{k.label}</span>
                {k.icon}
              </div>
              <div className={`stat-value h3 fw-bold ${k.color} mb-1`}>{k.value}</div>
              <div className="stat-subtext small text-secondary">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row (65% / 35% Split) */}
      <div className="row g-3 mb-4">
        {/* Visitor Traffic Trend Line Chart */}
        <div className="col-12 col-lg-8">
          <Card title={`Visitor Check-in Trends (${org.name} Gates)`}>
            <div className="d-flex flex-column justify-content-between p-1" style={{ height: '230px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small">Weekly Breakdown: <strong>7,380 Total Visitors</strong></span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Peak: Wednesday (1,480)</span>
              </div>
              <div className="w-100 flex-grow-1 position-relative" style={{ minHeight: '160px' }}>
                <svg className="w-100 h-100" viewBox="0 0 600 140" preserveAspectRatio="none" fill="none">
                  <path d="M0 110 Q 100 80, 200 40 T 400 30 T 600 120" stroke={org.primaryColor} strokeWidth="3" fill="none" />
                  <circle cx="100" cy="80" r="4" fill={org.primaryColor} />
                  <circle cx="200" cy="40" r="4" fill={org.primaryColor} />
                  <circle cx="300" cy="20" r="4" fill={org.primaryColor} />
                  <circle cx="400" cy="30" r="4" fill={org.primaryColor} />
                  <circle cx="500" cy="90" r="4" fill={org.primaryColor} />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Visitor Category Breakdown from real data */}
        <div className="col-12 col-lg-4">
          <Card title="Visitor Category Breakdown">
            <div style={{ padding: '8px 4px', minHeight: 200 }}>
              {(() => {
                const types = {};
                visitors.forEach(v => { const t = v.type || 'Other'; types[t] = (types[t] || 0) + 1; });
                const colors = ['#1565C0','#2E7D32','#E65100','#7B1FA2','#0277BD','#558B2F'];
                const entries = Object.entries(types);
                if (entries.length === 0) return <div className="text-center text-secondary py-4"><div style={{ fontSize: 32, marginBottom: 8 }}>📊</div><div>Visitor data will appear here after your first kiosk check-in</div></div>;
                return entries.map(([type, count], i) => {
                  const pct = visitors.length > 0 ? Math.round(count / visitors.length * 100) : 0;
                  return (
                    <div key={type} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length], display: 'inline-block' }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{type}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{pct}% ({count})</span>
                      </div>
                      <div style={{ background: '#F1F5F9', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ background: colors[i % colors.length], width: `${pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
        </div>
      </div>

      {/* Tables Grid Row */}
      <div className="row g-3">
        {/* Recent Visitors Table */}
        <div className="col-12 col-xl-8">
          <Card title={`Live Gate Feed (${org?.displayName || org?.name || 'Organization'})`} extra={
            kioskCount > 0 ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#F0FDF4', color: '#2E7D32', border: '1px solid #BBF7D0',
                borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700
              }}>
                <Tablet size={12} /> {kioskCount} Kiosk Check-in{kioskCount > 1 ? 's' : ''} Today
              </span>
            ) : null
          }>
            {visitors.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🪪</div>
                <div className="fw-semibold text-dark">No visitors yet today</div>
                <div className="text-secondary small mt-1">Visitors registered at the self-service kiosk will appear here in real time.</div>
                <a href={`/kiosk/${id}`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: org?.primaryColor || '#1565C0', fontWeight: 600 }}>
                  Open Kiosk Terminal →
                </a>
              </div>
            ) : (
              <DataTable
                columns={[
                  { header: 'Pass ID', key: 'id', render: (r) => <code style={{ fontSize: 11 }}>{r.passId || r.id}</code> },
                  { header: 'Visitor', key: 'name', render: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {r.photo ? (
                        <img src={r.photo} alt={r.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #E5E7EB' }} />
                      ) : (
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: org?.primaryColor || '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {(r.name || '?')[0]}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{r.name}</div>
                        <div style={{ color: '#94A3B8', fontSize: 11 }}>{r.company}</div>
                      </div>
                    </div>
                  )},
                  { header: 'Type', key: 'type', render: (r) => <Badge variant="neutral">{r.type}</Badge> },
                  { header: 'Gate / Site', key: 'site' },
                  { header: 'Host', key: 'host', render: r => typeof r.host === 'object' ? r.host?.name : r.host },
                  { header: 'Check-in', key: 'checkin' },
                  { header: 'Status', key: 'status', render: (r) => <Badge variant={r.status === 'Checked In' ? 'success' : r.status === 'Awaiting Approval' ? 'warning' : 'danger'}>{r.status}</Badge> },
                ]}
                data={visitors}
              />
            )}
          </Card>
        </div>

        {/* Pending Host Approvals — from real kiosk data */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          <Card title={`Pending Approvals Queue (${kpis.pendingApprovals})`}>
            <div className="d-flex flex-column gap-3">
              {visitors.filter(v => v.status === 'Awaiting Approval').slice(0, 5).map((v) => (
                <div key={v.id} className="p-3 bg-light border rounded-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {v.photo ? (
                      <img src={v.photo} alt={v.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: org?.primaryColor || '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {(v.name || '?')[0]}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-semibold text-dark small">{v.name}</div>
                      <div className="text-secondary" style={{ fontSize: 11 }}>{v.company}</div>
                    </div>
                    <Badge variant="warning">{v.type}</Badge>
                  </div>
                  <div className="text-secondary small mb-2">
                    Host: <strong>{typeof v.host === 'object' ? v.host?.name : v.host || '—'}</strong>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <a href={`/org/${id}/approvals`} style={{ fontSize: 12, color: org?.primaryColor || '#1565C0', fontWeight: 600, textDecoration: 'none' }}>Review in Approvals →</a>
                  </div>
                </div>
              ))}
              {kpis.pendingApprovals === 0 && (
                <div className="text-center py-4">
                  <CheckCircle2 size={36} style={{ color: 'var(--color-success)', marginBottom: 8 }} />
                  <div className="fw-semibold text-dark">All clear!</div>
                  <div className="text-secondary small">No pending approvals right now.</div>
                </div>
              )}
              {kpis.pendingApprovals > 5 && (
                <a href={`/org/${id}/approvals`} style={{ display: 'block', textAlign: 'center', fontSize: 13, color: org?.primaryColor, fontWeight: 700, textDecoration: 'none', padding: '8px 0' }}>
                  View all {kpis.pendingApprovals} pending →
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default CorporateDashboardPage;

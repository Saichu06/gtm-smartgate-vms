/**
 * CorporateApprovalsPage — Visitor Approval Queue
 * Live sync with kiosk registrations. Filter by date, host, priority, and search.
 * Route: /org/:orgId/approvals
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  User, Phone, Mail, Tag, MapPin, Shield, Search, RefreshCw, Calendar, Clock,
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';
import {
  getVisitors,
  updateVisitor,
  formatHostName,
  isVisitorInDateRange,
  formatVisitorDateTime,
  getUniqueHosts,
  getOrgEmployees,
} from '@utils/orgStorage';

const priorityVariant = { Normal: 'neutral', High: 'warning', Urgent: 'danger', Low: 'info' };

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Pick Date' },
];

const CorporateApprovalsPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;
  const primary = activeOrg?.primaryColor || '#1565C0';

  const [allVisitors, setAllVisitors] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [hostFilter, setHostFilter] = useState('');
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadApprovals = useCallback(() => {
    setAllVisitors(getVisitors(currentOrgId));
  }, [currentOrgId]);

  useEffect(() => {
    loadApprovals();
    const interval = setInterval(loadApprovals, 2000);
    const onChanged = (e) => {
      if (String(e.detail?.orgId) === String(currentOrgId)) loadApprovals();
    };
    window.addEventListener('gtm-visitors-changed', onChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener('gtm-visitors-changed', onChanged);
    };
  }, [currentOrgId, loadApprovals]);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const matchesSearch = (v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const host = formatHostName(v.host).toLowerCase();
    return (
      (v.name || '').toLowerCase().includes(q) ||
      (v.company || '').toLowerCase().includes(q) ||
      host.includes(q) ||
      (v.phone || '').includes(q)
    );
  };

  const matchesHost = (v) => {
    if (!hostFilter) return true;
    const id = v.hostId || formatHostName(v.host);
    return id === hostFilter || formatHostName(v.host) === hostFilter;
  };

  const pendingApprovals = useMemo(() =>
    allVisitors.filter(v =>
      v.status === 'Awaiting Approval' &&
      isVisitorInDateRange(v, dateRange, customDate, false) &&
      matchesHost(v) &&
      matchesSearch(v) &&
      (!priorityFilter || v.priority === priorityFilter)
    ),
  [allVisitors, dateRange, customDate, hostFilter, search, priorityFilter]);

  const processedLog = useMemo(() =>
    allVisitors.filter(v =>
      (v.status === 'Checked In' || v.status === 'Rejected') &&
      isVisitorInDateRange(v, dateRange, customDate, true) &&
      matchesHost(v) &&
      matchesSearch(v) &&
      (!decisionFilter || v.status === decisionFilter)
    ).sort((a, b) => new Date(b.processedAt || b.timestamp) - new Date(a.processedAt || a.timestamp)),
  [allVisitors, dateRange, customDate, hostFilter, search, decisionFilter]);

  const hostOptions = useMemo(() => {
    const fromVisitors = getUniqueHosts(allVisitors);
    const fromEmployees = getOrgEmployees(currentOrgId).map(e => ({ id: e.id, name: e.name }));
    const map = new Map();
    [...fromEmployees, ...fromVisitors].forEach(h => map.set(h.id, h.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allVisitors, currentOrgId]);

  const saveVisitorUpdate = (visitorId, updatedFields) => {
    updateVisitor(currentOrgId, visitorId, updatedFields);
    loadApprovals();
  };

  const handleApprove = (visitor) => {
    const passId = `VMS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const checkin = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    saveVisitorUpdate(visitor.id, {
      status: 'Checked In',
      passId,
      checkin,
      processedAt: now.toISOString(),
      approvedBy: activeOrg?.corporateAdmin || 'Corporate Admin',
    });
    setExpandedId(null);
    showToast(`${visitor.name} approved! Pass ${passId} issued.`, 'success');
  };

  const handleReject = (visitor) => {
    saveVisitorUpdate(visitor.id, {
      status: 'Rejected',
      processedAt: new Date().toISOString(),
      approvedBy: activeOrg?.corporateAdmin || 'Corporate Admin',
    });
    setExpandedId(null);
    showToast(`${visitor.name}'s visit has been declined.`, 'warning');
  };

  const urgent = pendingApprovals.filter(a => a.priority === 'Urgent').length;
  const high = pendingApprovals.filter(a => a.priority === 'High').length;

  const approvedCount = processedLog.filter(v => v.status === 'Checked In').length;
  const rejectedCount = processedLog.filter(v => v.status === 'Rejected').length;

  const dateLabel = DATE_OPTIONS.find(d => d.value === dateRange)?.label || 'Today';

  return (
    <OrganizationLayout
      title="Visitor Approvals"
      subtitle={`Host authorization queue — ${pendingApprovals.length} pending • ${activeOrg?.name}`}
    >
      {/* Filter toolbar */}
      <div className="bg-white border rounded-3 p-3 mb-4 shadow-sm">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Calendar size={16} style={{ color: primary }} />
          <span className="small fw-semibold text-secondary me-1">Date:</span>
          {DATE_OPTIONS.map(d => (
            <button
              key={d.value}
              onClick={() => setDateRange(d.value)}
              className="btn btn-sm"
              style={{
                fontSize: 12, fontWeight: 600,
                background: dateRange === d.value ? primary : '#F8FAFC',
                color: dateRange === d.value ? '#fff' : '#64748B',
                border: `1px solid ${dateRange === d.value ? primary : '#E2E8F0'}`,
              }}
            >
              {d.label}
            </button>
          ))}
          {dateRange === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="form-control form-control-sm"
              style={{ width: 160, height: 32 }}
            />
          )}
          <div style={{ marginLeft: 'auto' }}>
            <Button variant="secondary" size="sm" onClick={loadApprovals}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="global-search" style={{ width: 240 }}>
            <Search size={14} style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search visitor, company, host..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control form-control-sm"
            value={hostFilter}
            onChange={e => setHostFilter(e.target.value)}
            style={{ width: 200, height: 34 }}
          >
            <option value="">All Host Employees</option>
            {hostOptions.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          <select
            className="form-control form-control-sm"
            value={decisionFilter}
            onChange={e => setDecisionFilter(e.target.value)}
            style={{ width: 160, height: 34 }}
          >
            <option value="">All Decisions</option>
            <option value="Checked In">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {(urgent + high) > 0 && (
        <div className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3"
          style={{ background: '#FFF3E0', border: '1px solid #FFCC80' }}>
          <AlertTriangle size={20} style={{ color: '#F57C00', flexShrink: 0 }} />
          <div>
            <div className="fw-semibold" style={{ color: '#E65100' }}>
              {urgent} urgent + {high} high-priority approvals require immediate action
            </div>
            <div className="small text-secondary">Delays may hold visitors at the security gate kiosk.</div>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending Approval', value: pendingApprovals.length, color: pendingApprovals.length > 0 ? '#E65100' : 'var(--color-text-secondary)' },
          { label: `Approved (${dateLabel})`, value: approvedCount, color: 'var(--color-success)' },
          { label: `Rejected (${dateLabel})`, value: rejectedCount, color: 'var(--color-danger)' },
          { label: 'Urgent / High Priority', value: urgent + high, color: urgent + high > 0 ? '#F57C00' : 'var(--color-text-secondary)' },
        ].map(k => (
          <div key={k.label} className="col-6 col-md-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="stat-label small fw-semibold text-secondary mb-1">{k.label}</div>
              <div className="stat-value h3 fw-bold mb-0" style={{ color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending */}
      <Card
        title={`Pending Host Approvals (${pendingApprovals.length})`}
        extra={
          <div className="d-flex gap-2">
            {['', 'Urgent', 'High', 'Normal'].map(f => (
              <button key={f || 'all'}
                onClick={() => setPriorityFilter(f)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${priorityFilter === f ? primary : '#E2E8F0'}`,
                  background: priorityFilter === f ? primary : '#FFFFFF',
                  color: priorityFilter === f ? '#FFFFFF' : '#64748B',
                }}
              >{f || 'All'}</button>
            ))}
          </div>
        }
      >
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-5">
            <CheckCircle2 size={44} style={{ color: 'var(--color-success)', marginBottom: 12 }} />
            <div className="fw-semibold text-dark h5">No pending approvals for {dateLabel.toLowerCase()}</div>
            <div className="text-secondary small">
              New kiosk registrations with approval required will appear here automatically.
              {' '}Try <button className="btn btn-link btn-sm p-0" onClick={() => setDateRange('all')}>All Time</button> or register at{' '}
              <code>/kiosk/{currentOrgId}</code>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {pendingApprovals.map((v) => {
              const isExpanded = expandedId === v.id;
              const hostName = formatHostName(v.host);
              return (
                <div
                  key={v.id}
                  style={{
                    border: `1px solid ${v.priority === 'Urgent' ? '#FFCC80' : v.priority === 'High' ? '#FED7AA' : '#E2E8F0'}`,
                    borderLeft: `4px solid ${v.priority === 'Urgent' ? '#E65100' : v.priority === 'High' ? '#F57C00' : primary}`,
                    borderRadius: 14, background: '#FFFFFF', overflow: 'hidden',
                  }}
                >
                  <div
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {v.photo ? (
                        <img src={v.photo} alt={v.name}
                          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${primary}30` }} />
                      ) : (
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%', background: primary, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18,
                        }}>
                          {(v.name || '?')[0]}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{v.name}</div>
                      <div style={{ fontSize: 13, color: '#64748B' }}>{v.company} · {v.type}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        <Clock size={10} style={{ verticalAlign: -1 }} /> Submitted {formatVisitorDateTime(v)}
                      </div>
                    </div>

                    <div style={{ minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>HOST</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{hostName}</div>
                    </div>

                    {v.expectedDuration && (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>DURATION</div>
                        <div style={{ fontSize: 13, color: '#334155' }}>{v.expectedDuration}</div>
                      </div>
                    )}

                    <Badge variant={priorityVariant[v.priority] || 'neutral'}>{v.priority || 'Normal'}</Badge>

                    <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleApprove(v)} style={{
                        background: '#F0FDF4', color: '#2E7D32', border: '1px solid #BBF7D0',
                        borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <CheckCircle2 size={15} /> Approve
                      </button>
                      <button onClick={() => handleReject(v)} style={{
                        background: '#FFF1F2', color: '#D32F2F', border: '1px solid #FECDD3',
                        borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <XCircle size={15} /> Reject
                      </button>
                    </div>

                    {isExpanded ? <ChevronUp size={18} style={{ color: '#94A3B8' }} /> : <ChevronDown size={18} style={{ color: '#94A3B8' }} />}
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #F1F5F9', padding: '20px', background: '#F8FAFC' }}>
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Visitor Details</div>
                          <div className="d-flex flex-column gap-2" style={{ fontSize: 13 }}>
                            <div><Phone size={14} style={{ color: primary }} /> {v.phone || 'Not provided'}</div>
                            <div><Mail size={14} style={{ color: primary }} /> {v.email || 'Not provided'}</div>
                            <div><MapPin size={14} style={{ color: primary }} /> {v.site || 'Gate A — Kiosk'}</div>
                            <div><Tag size={14} style={{ color: primary }} /> Purpose: <strong>{v.purpose || 'Business Visit'}</strong></div>
                            {v.vehicle && <div>Vehicle: <strong>{v.vehicle}</strong></div>}
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Visit Info</div>
                          <div className="d-flex flex-column gap-1 small">
                            <div>Submitted: {formatVisitorDateTime(v)}</div>
                            <div>Duration: {v.expectedDuration || '—'}</div>
                            <div>Host: {hostName}</div>
                            <div>Pass ID: <code>{v.passId || 'Pending'}</code></div>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>ID Proof — {v.idType || 'Document'}</div>
                          {v.idImageUrl ? (
                            <img src={v.idImageUrl} alt="ID" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
                          ) : (
                            <div className="p-3 text-secondary small text-center bg-white border rounded-3">
                              <Shield size={22} style={{ color: primary }} />
                              <div>ID verified at gate</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Processed log */}
      <Card title={`Processed Approvals — ${dateLabel} (${processedLog.length})`} className="mt-4">
        {processedLog.length === 0 ? (
          <div className="text-center py-4 text-secondary small">
            No approved or rejected visitors for the selected filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Host</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Decision</th>
                  <th>Processed At</th>
                  <th>Check-In</th>
                </tr>
              </thead>
              <tbody>
                {processedLog.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {v.photo ? (
                          <img src={v.photo} alt={v.name}
                            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', background: primary, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                          }}>
                            {(v.name || '?')[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>{v.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small text-secondary">{formatHostName(v.host)}</td>
                    <td className="small text-secondary">{v.purpose}</td>
                    <td className="small text-secondary">{v.expectedDuration || '—'}</td>
                    <td><Badge variant="neutral">{v.type}</Badge></td>
                    <td>
                      <Badge variant={v.status === 'Checked In' ? 'success' : 'danger'}>
                        {v.status === 'Checked In' ? 'Approved' : 'Rejected'}
                      </Badge>
                    </td>
                    <td className="small text-secondary">{formatVisitorDateTime(v, true)}</td>
                    <td className="small text-secondary">{v.checkin || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateApprovalsPage;

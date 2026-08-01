/**
 * CorporateApprovalsPage — Visitor Approval Queue
 * Host approval requests for pre-registered visitors awaiting authorization.
 * Route: /org/:orgId/approvals
 */
import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye, MessageSquare, Filter } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const MOCK_APPROVALS = [
  { id: 'APR-001', visitor: 'Aakash Joshi', company: 'Amazon AWS', host: 'Deepak Narayan', dept: 'IT Infrastructure', site: 'IT Wing', purpose: 'Demo Session', type: 'Business', scheduled: 'Today, 2:00 PM', requestedAt: '10 mins ago', priority: 'Normal' },
  { id: 'APR-002', visitor: 'Lavanya Reddy', company: 'PwC India', host: 'CFO – Arjun Mehta', dept: 'Finance', site: 'Finance Dept', purpose: 'Annual Audit', type: 'Auditor', scheduled: 'Today, 3:30 PM', requestedAt: '25 mins ago', priority: 'High' },
  { id: 'APR-003', visitor: 'Bala Subramaniam', company: 'Govt. of Tamil Nadu', host: 'CEO – N. Venkatesh', dept: 'Executive', site: 'Board Room', purpose: 'Policy Discussion', type: 'Government', scheduled: 'Today, 4:00 PM', requestedAt: '1 hour ago', priority: 'Urgent' },
  { id: 'APR-004', visitor: 'Sanjay Kapoor', company: 'Siemens India', host: 'Karthik Mani', dept: 'Plant Engineering', site: 'Plant 3', purpose: 'Equipment Inspection', type: 'Contractor', scheduled: 'Tomorrow, 9:00 AM', requestedAt: '2 hours ago', priority: 'Normal' },
  { id: 'APR-005', visitor: 'Neha Gupta', company: 'Freshworks', host: 'Anitha Rao', dept: 'HR & Talent', site: 'HR Wing', purpose: 'HR Tech Demo', type: 'Business', scheduled: 'Tomorrow, 11:00 AM', requestedAt: '3 hours ago', priority: 'Low' },
];

const priorityVariant = { Normal: 'neutral', High: 'warning', Urgent: 'danger', Low: 'info' };

const CorporateApprovalsPage = () => {
  const { activeOrg } = useOrganizations();
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleApprove = (id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    showToast('Visitor approved! Pass sent via SMS & email.', 'success');
  };

  const handleReject = (id, name) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    showToast(`Visit from ${name} has been declined.`, 'warning');
  };

  const urgent = approvals.filter(a => a.priority === 'Urgent').length;
  const high = approvals.filter(a => a.priority === 'High').length;

  const filtered = filter ? approvals.filter(a => a.priority === filter) : approvals;

  return (
    <OrganizationLayout
      title="Visitor Approvals"
      subtitle={`Pending host authorization queue • ${activeOrg?.name}`}
    >
      {/* Alert Banner */}
      {(urgent + high) > 0 && (
        <div className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3" style={{ background: '#FFF3E0', border: '1px solid #FFCC80' }}>
          <AlertTriangle size={20} style={{ color: '#F57C00', flexShrink: 0 }} />
          <div>
            <div className="fw-semibold" style={{ color: '#E65100' }}>
              {urgent} urgent + {high} high-priority approvals require immediate action
            </div>
            <div className="small" style={{ color: '#BF360C' }}>
              Government officials and auditors are waiting. Please review and approve or reject promptly.
            </div>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending', value: approvals.length, color: 'var(--color-warning)' },
          { label: 'Urgent', value: urgent, color: 'var(--color-danger)' },
          { label: 'High Priority', value: high, color: '#F57C00' },
          { label: 'Approved Today', value: MOCK_APPROVALS.length - approvals.length, color: 'var(--color-success)' },
        ].map(k => (
          <div key={k.label} className="col-6 col-xl-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="stat-label small fw-semibold text-secondary mb-1">{k.label}</div>
              <div className="stat-value h3 fw-bold" style={{ color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="text-secondary small fw-semibold">Filter by priority:</span>
        {['', 'Urgent', 'High', 'Normal', 'Low'].map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className="btn btn-sm"
            style={{
              background: filter === p ? 'var(--color-primary)' : 'var(--color-bg-muted)',
              color: filter === p ? '#fff' : 'var(--color-text-primary)',
              border: `1px solid ${filter === p ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {p || 'All'}
          </button>
        ))}
      </div>

      {/* Approval Cards */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center p-5">
            <CheckCircle2 size={40} style={{ color: 'var(--color-success)', marginBottom: 16 }} />
            <div className="fw-semibold text-dark mb-1">All caught up!</div>
            <div className="text-secondary small">No pending approval requests at this time.</div>
          </div>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((req) => (
            <div key={req.id} className="p-4 bg-white border rounded-3 shadow-sm" style={{ borderLeft: `4px solid ${req.priority === 'Urgent' ? 'var(--color-danger)' : req.priority === 'High' ? '#F57C00' : req.priority === 'Low' ? 'var(--color-info)' : 'var(--color-border)'}` }}>
              <div className="flex-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <Avatar name={req.visitor} size="md" />
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-semibold text-dark">{req.visitor}</span>
                      <Badge variant={priorityVariant[req.priority]}>{req.priority}</Badge>
                      <Badge variant="neutral">{req.type}</Badge>
                    </div>
                    <div className="text-secondary small">{req.company} • {req.purpose}</div>
                    <div className="text-secondary small">
                      <strong>Host:</strong> {req.host} ({req.dept}) • <strong>Site:</strong> {req.site}
                    </div>
                    <div className="mt-1" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      📅 {req.scheduled} &nbsp;•&nbsp; Requested {req.requestedAt} &nbsp;•&nbsp; <code style={{ fontSize: 10 }}>{req.id}</code>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => showToast(`Details for ${req.id}`, 'info')}>
                    <Eye size={13} /> View
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => showToast(`Message sent to ${req.host}`, 'info')}>
                    <MessageSquare size={13} /> Message Host
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleReject(req.id, req.visitor)}>
                    <XCircle size={13} /> Reject
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleApprove(req.id)}>
                    <CheckCircle2 size={13} /> Approve Pass
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateApprovalsPage;

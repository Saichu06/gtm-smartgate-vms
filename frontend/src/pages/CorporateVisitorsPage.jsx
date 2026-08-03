/**
 * CorporateVisitorsPage — Visitor Management Module
 * Live visitor log with check-in/check-out tracking, search, and pass generation.
 * Route: /org/:orgId/visitors
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserCheck, PlusCircle, Search, Download, Eye, CheckCircle2,
  Clock, XCircle, Filter, RefreshCw, QrCode,
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const MOCK_VISITORS = [
  { id: 'VIS-001', name: 'Arjun Sharma', company: 'TCS Ltd', host: 'Ramesh Patel', site: 'Main Gate', purpose: 'Business Meeting', checkin: '09:14 AM', checkout: null, status: 'Checked In', type: 'Business' },
  { id: 'VIS-002', name: 'Priya Nair', company: 'Wipro Pvt Ltd', host: 'Sunita Gupta', site: 'North Wing', purpose: 'Vendor Delivery', checkin: '09:32 AM', checkout: '10:45 AM', status: 'Checked Out', type: 'Vendor' },
  { id: 'VIS-003', name: 'Rohan Das', company: 'Self', host: 'Dr. Kumar', site: 'Main Gate', purpose: 'Interview', checkin: '10:00 AM', checkout: null, status: 'Checked In', type: 'Candidate' },
  { id: 'VIS-004', name: 'Meena Krishnan', company: 'Mahindra Finance', host: 'Anil Sharma', site: 'South Block', purpose: 'Audit Visit', checkin: '10:30 AM', checkout: null, status: 'Checked In', type: 'Auditor' },
  { id: 'VIS-005', name: 'Vikash Yadav', company: 'Bosch India', host: 'Rajiv Sen', site: 'Plant 2', purpose: 'Maintenance', checkin: '11:05 AM', checkout: '12:30 PM', status: 'Checked Out', type: 'Contractor' },
  { id: 'VIS-006', name: 'Sneha Reddy', company: 'Google India', host: 'Pooja Iyer', site: 'HQ Lobby', purpose: 'Partnership Meeting', checkin: '11:20 AM', checkout: null, status: 'Checked In', type: 'Business' },
  { id: 'VIS-007', name: 'Aakash Joshi', company: 'Amazon AWS', host: 'Deepak Narayan', site: 'IT Wing', purpose: 'Demo Session', checkin: '11:45 AM', checkout: null, status: 'Pre-Registered', type: 'Business' },
  { id: 'VIS-008', name: 'Kavita Bose', company: 'HDFC Bank', host: 'Ranjit Kumar', site: 'Finance Dept', purpose: 'Loan Verification', checkin: '12:00 PM', checkout: '13:15 PM', status: 'Checked Out', type: 'Business' },
];

const statusVariant = (s) => {
  if (s === 'Checked In') return 'success';
  if (s === 'Checked Out') return 'neutral';
  if (s === 'Pre-Registered') return 'info';
  return 'warning';
};

const CorporateVisitorsPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', company: '', host: '', purpose: '', type: 'Business' });

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = MOCK_VISITORS.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !search || v.name.toLowerCase().includes(q) || v.company.toLowerCase().includes(q) || v.host.toLowerCase().includes(q);
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const checkedIn = MOCK_VISITORS.filter(v => v.status === 'Checked In').length;
  const checkedOut = MOCK_VISITORS.filter(v => v.status === 'Checked Out').length;
  const preReg = MOCK_VISITORS.filter(v => v.status === 'Pre-Registered').length;

  return (
    <OrganizationLayout
      title="Visitor Management"
      subtitle={`Live visitor tracking & pass management • ${activeOrg?.name}`}
    >
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Currently Inside', value: checkedIn, icon: UserCheck, color: 'var(--color-success)', sub: 'Active visitors on-site' },
          { label: 'Checked Out Today', value: checkedOut, icon: CheckCircle2, color: 'var(--color-info)', sub: 'Completed visits' },
          { label: 'Pre-Registered', value: preReg, icon: Clock, color: 'var(--color-warning)', sub: 'Awaiting arrival' },
          { label: "Total Today", value: MOCK_VISITORS.length, icon: Filter, color: 'var(--color-primary)', sub: 'All visitor passes' },
        ].map((k) => (
          <div key={k.label} className="col-6 col-xl-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="stat-label small fw-semibold text-secondary">{k.label}</span>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <div className="stat-value h3 fw-bold mb-1" style={{ color: k.color }}>{k.value}</div>
              <div className="stat-subtext text-secondary small">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <Card>
        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
          <div className="global-search" style={{ width: 260 }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input type="text" placeholder="Search visitors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 160, height: 36, padding: '0 10px', fontSize: 'var(--text-sm)', margin: 0 }}
          >
            <option value="">All Status</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Pre-Registered">Pre-Registered</option>
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => showToast('Visitor log exported', 'info')}>
              <Download size={14} /> Export
            </Button>
            <Button variant="primary" size="sm" onClick={() => setRegisterOpen(true)}>
              <PlusCircle size={14} /> Register Visitor
            </Button>
          </div>
        </div>

        {/* Visitor Table */}
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pass ID</th>
                <th>Visitor</th>
                <th>Category</th>
                <th>Host Employee</th>
                <th>Gate / Site</th>
                <th>Purpose</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td><code style={{ fontSize: 11 }}>{v.id}</code></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={v.name} size="sm" />
                      <div>
                        <div className="fw-semibold text-dark" style={{ fontSize: 'var(--text-sm)' }}>{v.name}</div>
                        <div className="text-secondary" style={{ fontSize: 11 }}>{v.company}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge variant="neutral">{v.type}</Badge></td>
                  <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{v.host}</td>
                  <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{v.site}</td>
                  <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{v.purpose}</td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>{v.checkin}</td>
                  <td style={{ fontSize: 'var(--text-sm)', color: v.checkout ? 'var(--color-text-secondary)' : 'var(--color-warning)' }}>
                    {v.checkout || '—'}
                  </td>
                  <td><Badge variant={statusVariant(v.status)}>{v.status}</Badge></td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-sm btn-light" title="View Pass" onClick={() => showToast(`Viewing pass for ${v.name}`, 'info')}>
                        <Eye size={13} />
                      </button>
                      {v.status === 'Checked In' && (
                        <button className="btn btn-sm btn-light text-danger" title="Check Out" onClick={() => showToast(`${v.name} checked out`, 'success')}>
                          <XCircle size={13} />
                        </button>
                      )}
                      {v.status === 'Pre-Registered' && (
                        <button className="btn btn-sm btn-light text-success" title="Check In" onClick={() => showToast(`${v.name} checked in`, 'success')}>
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register Visitor Drawer */}
      <Drawer
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register New Visitor"
        onSave={() => { showToast('Visitor pass created & SMS sent to host!', 'success'); setRegisterOpen(false); }}
      >
        <Input label="Visitor Full Name" placeholder="e.g., Arjun Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Company / Organization" placeholder="e.g., TCS Ltd" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
        <Input label="Host Employee Name" placeholder="e.g., Ramesh Patel" value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} />
        <Input label="Purpose of Visit" placeholder="e.g., Business Meeting" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
        <Select
          label="Visitor Type"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          options={[
            { label: 'Business', value: 'Business' },
            { label: 'Vendor', value: 'Vendor' },
            { label: 'Contractor', value: 'Contractor' },
            { label: 'Candidate', value: 'Candidate' },
            { label: 'Auditor', value: 'Auditor' },
            { label: 'Government Official', value: 'Government' },
          ]}
        />
        <Input label="Expected Date & Time" type="datetime-local" />
        <div className="p-2 bg-info-subtle rounded-3 small text-info-emphasis mt-2">
          A digital visitor pass will be generated and host will receive an approval notification via SMS & email.
        </div>
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateVisitorsPage;

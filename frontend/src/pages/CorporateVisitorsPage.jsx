/**
 * CorporateVisitorsPage — Visitor Management Module
 * Live visitor tracking with expandable detail drawer, webcam photo inspection,
 * identity document proof view, check-in/check-out actions, and manual visitor registration.
 * Route: /org/:orgId/visitors
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserCheck, PlusCircle, Search, Download, Eye, CheckCircle2,
  Clock, XCircle, Filter, RefreshCw, QrCode, Shield, Phone, Mail, Car, MapPin, Tag, ChevronDown, ChevronUp, Printer
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import VisitorPass from '../modules/kiosk/components/Pass/VisitorPass';
import { useOrganizations } from '@contexts/OrganizationContext';
import { getVisitors, saveVisitors, getOrgEmployees } from '@utils/orgStorage';

const CorporateVisitorsPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const navigate = useNavigate();
  const currentOrgId = orgId || activeOrg?.id || 1;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: '', company: '', host: '', hostId: '', purpose: '', phone: '', email: '', type: 'Business Visitor', site: 'Gate A — Kiosk'
  });

  const [allVisitors, setAllVisitors] = useState(() => getVisitors(currentOrgId));
  const [orgEmployees, setOrgEmployees] = useState([]);

  const refreshVisitors = () => setAllVisitors(getVisitors(currentOrgId));

  useEffect(() => {
    refreshVisitors();
    setOrgEmployees(getOrgEmployees(currentOrgId));
    const interval = setInterval(refreshVisitors, 2000);
    const onChanged = (e) => {
      if (String(e.detail?.orgId) === String(currentOrgId)) refreshVisitors();
    };
    window.addEventListener('gtm-visitors-changed', onChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener('gtm-visitors-changed', onChanged);
    };
  }, [currentOrgId]);

  const saveVisitorsLocal = (updated) => {
    setAllVisitors(updated);
    saveVisitors(currentOrgId, updated);
  };

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleRegisterSubmit = () => {
    if (!form.name.trim()) return;
    const selectedHost = orgEmployees.find(e => e.id === form.hostId);
    const newRecord = {
      id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
      passId: `VMS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: form.name,
      company: form.company || 'Walk-in',
      phone: form.phone || '+91 98000 00000',
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      host: selectedHost ? selectedHost.name : form.host || 'Reception',
      hostId: form.hostId || null,
      site: form.site,
      purpose: form.purpose || 'General Meeting',
      checkin: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkout: null,
      status: 'Checked In',
      type: form.type,
      registeredVia: 'Admin Manual Entry',
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...allVisitors];
    saveVisitorsLocal(updated);
    setRegisterOpen(false);
    setForm({ name: '', company: '', host: '', hostId: '', purpose: '', phone: '', email: '', type: 'Business Visitor', site: 'Gate A — Kiosk' });
    showToast(`Visitor pass created for ${newRecord.name}!`, 'success');
  };

  const handleCheckOut = (id, name) => {
    const updated = allVisitors.map(v => v.id === id ? {
      ...v,
      status: 'Checked Out',
      checkout: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    } : v);
    saveVisitorsLocal(updated);
    showToast(`${name} has checked out successfully.`, 'neutral');
  };

  const hostLabel = (h) => (typeof h === 'object' ? h?.name : h) || '—';

  const filtered = allVisitors.filter(v => {
    const q = search.toLowerCase();
    const hostStr = hostLabel(v.host).toLowerCase();
    const matchSearch = !search || (v.name || '').toLowerCase().includes(q) || (v.company || '').toLowerCase().includes(q) || hostStr.includes(q);
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const checkedIn = allVisitors.filter(v => v.status === 'Checked In').length;
  const checkedOut = allVisitors.filter(v => v.status === 'Checked Out').length;
  const totalCount = allVisitors.length;

  return (
    <OrganizationLayout
      title="Visitor Management"
      subtitle={`Live visitor log & identity verification center • ${activeOrg?.name}`}
    >
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Currently Inside', value: checkedIn, icon: UserCheck, color: 'var(--color-success)', sub: 'Active visitors on-site' },
          { label: 'Checked Out Today', value: checkedOut, icon: CheckCircle2, color: 'var(--color-info)', sub: 'Completed visits' },
          { label: 'Total Registered', value: totalCount, icon: Filter, color: 'var(--color-primary)', sub: 'Total visitor records' },
        ].map((k) => (
          <div key={k.label} className="col-12 col-md-4">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="stat-label small fw-semibold text-secondary">{k.label}</span>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <div className="stat-value h3 fw-bold text-dark mb-0">{k.value}</div>
              <div className="stat-subtext text-secondary small">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <Card
        title="Real-Time Visitor Log"
        extra={
          <div className="d-flex align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setRegisterOpen(true)}>
              <PlusCircle size={14} /> Register Visitor
            </Button>
          </div>
        }
      >
        {/* Search & Filter Controls */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div style={{ maxWidth: 320, width: '100%' }}>
            <Input
              placeholder="Search by visitor, company, host..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<Search size={14} />}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Checked In', value: 'Checked In' },
                { label: 'Checked Out', value: 'Checked Out' },
                { label: 'Awaiting Approval', value: 'Awaiting Approval' },
                { label: 'Rejected', value: 'Rejected' },
              ]}
            />
          </div>
        </div>

        {/* Data Table with Expandable Row Detail */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Pass ID</th>
                <th>Visitor</th>
                <th>Category</th>
                <th>Host Employee</th>
                <th>Gate / Site</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-secondary">
                    No visitor records found. Use Kiosk (`/kiosk/${currentOrgId}`) or Register Visitor above to add records.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const isExpanded = expandedId === v.id;
                  return (
                    <React.Fragment key={v.id}>
                      <tr
                        style={{ cursor: 'pointer', background: isExpanded ? '#F8FAFC' : 'transparent' }}
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                      >
                        <td className="text-center text-secondary">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td><code>{v.passId || v.id}</code></td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {v.photo ? (
                              <img src={v.photo} alt={v.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #E2E8F0' }} />
                            ) : (
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: activeOrg?.primaryColor || '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                {(v.name || '?')[0]}
                              </div>
                            )}
                            <div>
                              <div className="fw-semibold text-dark">{v.name}</div>
                              <div className="text-secondary small">{v.company}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge variant="neutral">{v.type}</Badge></td>
                        <td className="text-secondary small">{hostLabel(v.host)}</td>
                        <td className="text-secondary small">{v.site}</td>
                        <td className="small">{v.checkin}</td>
                        <td className="small">{v.checkout || '—'}</td>
                        <td><Badge variant={v.status === 'Checked In' ? 'success' : 'neutral'}>{v.status}</Badge></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-sm btn-light"
                              title="Expand / View Full Details"
                              onClick={() => { setSelectedVisitor(v); }}
                            >
                              <Eye size={14} />
                            </button>
                            {v.status === 'Checked In' && (
                              <button
                                className="btn btn-sm btn-light text-danger"
                                title="Check Out Visitor"
                                onClick={() => handleCheckOut(v.id, v.name)}
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── EXPANDABLE INLINE DETAIL ROW ───────────────────────── */}
                      {isExpanded && (
                        <tr style={{ background: '#F1F5F9' }}>
                          <td colSpan={10} className="p-3">
                            <div className="bg-white border rounded-3 p-4 shadow-sm">
                              <div className="row g-4">
                                
                                {/* Photo & Badge Snapshot */}
                                <div className="col-12 col-md-3 text-center border-end">
                                  <div style={{ width: 120, height: 140, borderRadius: 16, overflow: 'hidden', border: '3px solid var(--org-primary, #1565C0)', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    {v.photo ? (
                                      <img src={v.photo} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '100%', height: '100%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                        <UserCheck size={44} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="fw-bold text-dark">{v.name}</div>
                                  <div className="text-secondary small">{v.company}</div>
                                  <div className="mt-2">
                                    <Badge variant={v.status === 'Checked In' ? 'success' : 'neutral'}>
                                      {v.status}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Full Visitor Data Grid */}
                                <div className="col-12 col-md-5 border-end">
                                  <h6 className="fw-bold text-dark mb-3">Visitor Details & Purpose</h6>
                                  <div className="d-flex flex-column gap-2 small">
                                    <div><strong>Phone:</strong> {v.phone || 'N/A'}</div>
                                    <div><strong>Email:</strong> {v.email || 'N/A'}</div>
                                    <div><strong>Purpose:</strong> {v.purpose || 'Business Visit'}</div>
                                    <div><strong>Host Employee:</strong> {hostLabel(v.host)}</div>
                                    <div><strong>Vehicle Number:</strong> {v.vehicle || 'None'}</div>
                                    <div><strong>Entry Gate / Site:</strong> {v.site}</div>
                                    <div><strong>Registration Mode:</strong> <Badge variant="info">{v.registeredVia || 'Visitor Kiosk'}</Badge></div>
                                  </div>
                                </div>

                                {/* Identity Document Proof View */}
                                <div className="col-12 col-md-4">
                                  <h6 className="fw-bold text-dark mb-2">Identity Proof ({v.idType || 'ID Document'})</h6>
                                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid #E2E8F0', background: '#F8FAFC', padding: 8, textAlign: 'center' }}>
                                    {v.idImageUrl ? (
                                      <img src={v.idImageUrl} alt="ID Document" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    ) : (
                                      <div className="p-3 text-secondary small">
                                        <Shield size={24} className="mb-1 text-primary d-block mx-auto" />
                                        ID Verified on Gate Entry
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-3 d-flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => { setSelectedVisitor(v); setShowPassModal(true); }}>
                                      <QrCode size={14} /> View Digital Badge
                                    </Button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail View Drawer */}
      {selectedVisitor && (
        <Drawer
          isOpen={Boolean(selectedVisitor)}
          onClose={() => { setSelectedVisitor(null); setShowPassModal(false); }}
          title={`Visitor Details — ${selectedVisitor.name}`}
        >
          <div className="d-flex flex-column gap-3">
            {showPassModal ? (
              <VisitorPass passData={selectedVisitor} />
            ) : (
              <>
                <div className="text-center p-3 bg-light rounded-3">
                  <img src={selectedVisitor.photo} alt={selectedVisitor.name} style={{ width: 100, height: 110, borderRadius: 14, objectFit: 'cover', border: '2px solid var(--org-primary)' }} />
                  <div className="fw-bold h5 mb-0 mt-2">{selectedVisitor.name}</div>
                  <div className="text-secondary small">{selectedVisitor.company}</div>
                </div>

                <div className="p-3 border rounded-3 bg-white">
                  <h6 className="fw-bold mb-2">Visit Details</h6>
                  <div className="small d-flex flex-column gap-1">
                    <div><strong>Pass ID:</strong> <code>{selectedVisitor.passId || selectedVisitor.id}</code></div>
                    <div><strong>Phone:</strong> {selectedVisitor.phone}</div>
                    <div><strong>Email:</strong> {selectedVisitor.email}</div>
                    <div><strong>Host:</strong> {hostLabel(selectedVisitor.host)}</div>
                    <div><strong>Purpose:</strong> {selectedVisitor.purpose}</div>
                    <div><strong>Vehicle:</strong> {selectedVisitor.vehicle || 'None'}</div>
                    <div><strong>Gate:</strong> {selectedVisitor.site}</div>
                  </div>
                </div>

                {selectedVisitor.idImageUrl && (
                  <div className="p-3 border rounded-3 bg-white">
                    <h6 className="fw-bold mb-2">Identity Proof Image</h6>
                    <img src={selectedVisitor.idImageUrl} alt="ID Document" style={{ width: '100%', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  </div>
                )}

                <Button variant="primary" onClick={() => setShowPassModal(true)}>
                  <QrCode size={16} /> Preview Digital Access Badge
                </Button>
              </>
            )}
          </div>
        </Drawer>
      )}

      {/* Register Visitor Drawer */}
      <Drawer
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register New Visitor"
        onSave={handleRegisterSubmit}
      >
        <Input label="Visitor Full Name" placeholder="e.g., Vikram Malhotra" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Company / Organization" placeholder="e.g., Infosys Ltd" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
        <Input label="Phone Number" placeholder="+91 98000 00000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Input label="Email Address" placeholder="visitor@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Select
          label="Host Employee"
          value={form.hostId}
          onChange={e => {
            const emp = orgEmployees.find(x => x.id === e.target.value);
            setForm({ ...form, hostId: e.target.value, host: emp?.name || '' });
          }}
          options={[
            { label: 'Select host employee...', value: '' },
            ...orgEmployees.filter(e => e.status === 'Active' || !e.status).map(e => ({ label: `${e.name} — ${e.dept}`, value: e.id })),
          ]}
        />
        <Input label="Purpose of Visit" placeholder="e.g., Business Meeting" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
        <Select
          label="Visitor Category"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          options={[
            { label: 'Business Visitor', value: 'Business Visitor' },
            { label: 'Vendor / Supplier', value: 'Vendor / Supplier' },
            { label: 'Contractor', value: 'Contractor' },
            { label: 'Job Candidate', value: 'Job Candidate' },
          ]}
        />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateVisitorsPage;

/**
 * CorporateEmployeesPage — Employee Directory Module
 * Active Directory synced employee list with department filters, search, and add employee flow.
 * Route: /org/:orgId/employees
 */
import React, { useState } from 'react';
import { Briefcase, PlusCircle, Search, Download, Edit, Trash2, Phone, Mail, UserCheck } from 'lucide-react';
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

const MOCK_EMPLOYEES = [
  { id: 'EMP-001', name: 'Ramesh Patel', email: 'ramesh.p@company.com', phone: '+91 98400 11111', dept: 'Plant Engineering', designation: 'Senior Engineer', site: 'Main Gate', status: 'Active', joinDate: '2020-03-15' },
  { id: 'EMP-002', name: 'Sunita Gupta', email: 'sunita.g@company.com', phone: '+91 98400 22222', dept: 'Administration', designation: 'Executive Assistant', site: 'North Wing', status: 'Active', joinDate: '2018-07-22' },
  { id: 'EMP-003', name: 'Dr. Arun Kumar', email: 'arun.k@company.com', phone: '+91 98400 33333', dept: 'R&D', designation: 'Chief Scientist', site: 'R&D Block', status: 'Active', joinDate: '2015-01-10' },
  { id: 'EMP-004', name: 'Anil Sharma', email: 'anil.s@company.com', phone: '+91 98400 44444', dept: 'Finance', designation: 'Finance Manager', site: 'South Block', status: 'Active', joinDate: '2019-09-05' },
  { id: 'EMP-005', name: 'Rajiv Sen', email: 'rajiv.s@company.com', phone: '+91 98400 55555', dept: 'Maintenance', designation: 'Maintenance Head', site: 'Plant 2', status: 'Active', joinDate: '2017-04-18' },
  { id: 'EMP-006', name: 'Pooja Iyer', email: 'pooja.i@company.com', phone: '+91 98400 66666', dept: 'HR & Talent', designation: 'HR Business Partner', site: 'HQ Lobby', status: 'Active', joinDate: '2021-11-30' },
  { id: 'EMP-007', name: 'Deepak Narayan', email: 'deepak.n@company.com', phone: '+91 98400 77777', dept: 'IT Infrastructure', designation: 'IT Manager', site: 'IT Wing', status: 'Active', joinDate: '2016-06-12' },
  { id: 'EMP-008', name: 'Karthik Mani', email: 'karthik.m@company.com', phone: '+91 98400 88888', dept: 'Plant Engineering', designation: 'Plant Engineer', site: 'Plant 3', status: 'On Leave', joinDate: '2022-03-01' },
  { id: 'EMP-009', name: 'Anitha Rao', email: 'anitha.r@company.com', phone: '+91 98400 99999', dept: 'HR & Talent', designation: 'Talent Acquisition Lead', site: 'HR Wing', status: 'Active', joinDate: '2023-01-15' },
  { id: 'EMP-010', name: 'Ranjit Kumar', email: 'ranjit.k@company.com', phone: '+91 98401 11111', dept: 'Finance', designation: 'Finance Analyst', site: 'Finance Dept', status: 'Inactive', joinDate: '2020-08-20' },
];

const DEPARTMENTS = [...new Set(MOCK_EMPLOYEES.map(e => e.dept))];

const CorporateEmployeesPage = () => {
  const { activeOrg } = useOrganizations();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = MOCK_EMPLOYEES.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.dept === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const active = MOCK_EMPLOYEES.filter(e => e.status === 'Active').length;
  const onLeave = MOCK_EMPLOYEES.filter(e => e.status === 'On Leave').length;
  const inactive = MOCK_EMPLOYEES.filter(e => e.status === 'Inactive').length;

  return (
    <OrganizationLayout
      title="Employee Directory"
      subtitle={`Active Directory synced workforce • ${activeOrg?.name}`}
    >
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Employees', value: MOCK_EMPLOYEES.length, color: 'var(--color-primary)' },
          { label: 'Active', value: active, color: 'var(--color-success)' },
          { label: 'On Leave', value: onLeave, color: 'var(--color-warning)' },
          { label: 'Inactive', value: inactive, color: 'var(--color-text-secondary)' },
        ].map(k => (
          <div key={k.label} className="col-6 col-xl-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="stat-label small fw-semibold text-secondary mb-1">{k.label}</div>
              <div className="stat-value h3 fw-bold" style={{ color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        {/* Toolbar */}
        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
          <div className="global-search" style={{ width: 260 }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input type="text" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 200, height: 36, padding: '0 10px', fontSize: 'var(--text-sm)', margin: 0 }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140, height: 36, padding: '0 10px', fontSize: 'var(--text-sm)', margin: 0 }}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => showToast('Employee list exported', 'info')}><Download size={14} /> Export</Button>
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}><PlusCircle size={14} /> Add Employee</Button>
          </div>
        </div>

        {/* Employee Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Assigned Site</th>
              <th>Contact</th>
              <th>Join Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Avatar name={e.name} size="sm" />
                    <span className="fw-semibold text-dark" style={{ fontSize: 'var(--text-sm)' }}>{e.name}</span>
                  </div>
                </td>
                <td><code style={{ fontSize: 11 }}>{e.id}</code></td>
                <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{e.dept}</td>
                <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{e.designation}</td>
                <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{e.site}</td>
                <td>
                  <div style={{ fontSize: 11 }}>
                    <div className="d-flex align-items-center gap-1"><Mail size={10} /> {e.email}</div>
                    <div className="d-flex align-items-center gap-1 text-secondary"><Phone size={10} /> {e.phone}</div>
                  </div>
                </td>
                <td className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{e.joinDate}</td>
                <td>
                  <Badge variant={e.status === 'Active' ? 'success' : e.status === 'On Leave' ? 'warning' : 'neutral'}>
                    {e.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-1 justify-content-center">
                    <button className="btn btn-sm btn-light" onClick={() => showToast(`Editing ${e.name}`)}><Edit size={13} /></button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => showToast(`${e.name} removed`, 'warning')}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add Employee Drawer */}
      <Drawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Employee"
        onSave={() => { showToast('Employee added & synced to Active Directory!'); setAddOpen(false); }}
      >
        <Input label="Full Name" placeholder="e.g., Ramesh Patel" />
        <Input label="Work Email" type="email" placeholder="e.g., ramesh@company.com" />
        <Input label="Phone Number" placeholder="+91 98400 00000" />
        <Select label="Department" options={DEPARTMENTS.map(d => ({ label: d, value: d }))} />
        <Input label="Designation / Job Title" placeholder="e.g., Senior Engineer" />
        <Input label="Employee ID" placeholder="e.g., EMP-011" />
        <Input label="Date of Joining" type="date" />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateEmployeesPage;

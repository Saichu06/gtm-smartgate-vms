/**
 * CorporateEmployeesPage — Employee Directory Module
 * Active Directory synced employee list with department filters, search, and add employee flow.
 * Route: /org/:orgId/employees
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

import { getEmployeeSeeds, storageKeys } from '@utils/orgStorage';

const CorporateEmployeesPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;

  const [employees, setEmployees] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKeys.employees(currentOrgId)) || '[]');
      return saved.length > 0 ? saved : getEmployeeSeeds(currentOrgId);
    } catch {
      return getEmployeeSeeds(currentOrgId);
    }
  });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', dept: 'Technology', designation: '', site: 'Main Gate' });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKeys.employees(currentOrgId)) || '[]');
      if (saved.length > 0) setEmployees(saved);
      else setEmployees(getEmployeeSeeds(currentOrgId));
    } catch (e) {}
  }, [currentOrgId]);

  const saveEmployees = (updated) => {
    setEmployees(updated);
    try {
      localStorage.setItem(storageKeys.employees(currentOrgId), JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleAddSubmit = () => {
    if (!form.name.trim()) return;
    const newEmp = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      phone: form.phone || '+91 98400 00000',
      dept: form.dept,
      designation: form.designation || 'Team Member',
      site: form.site,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
    };
    saveEmployees([newEmp, ...employees]);
    setAddOpen(false);
    setForm({ name: '', email: '', phone: '', dept: 'Technology', designation: '', site: 'Main Gate' });
    showToast(`Employee ${newEmp.name} added to host directory!`, 'success');
  };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.dept === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const active = employees.filter(e => e.status === 'Active').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;
  const inactive = employees.filter(e => e.status === 'Inactive').length;

  return (
    <OrganizationLayout
      title="Employee Directory"
      subtitle={`Active Directory synced workforce • ${activeOrg?.name}`}
    >
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Employees', value: employees.length, color: 'var(--color-primary)' },
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
            {[...new Set(employees.map(e => e.dept))].map(d => <option key={d} value={d}>{d}</option>)}
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
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
        </div>
      </Card>

      {/* Add Employee Drawer */}
      <Drawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Employee"
        onSave={handleAddSubmit}
      >
        <Input label="Full Name" placeholder="e.g., Ramesh Patel" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Work Email" type="email" placeholder="e.g., ramesh@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone Number" placeholder="+91 98400 00000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Input label="Department" placeholder="e.g., Technology" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} />
        <Input label="Designation / Job Title" placeholder="e.g., Senior Engineer" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
        <Input label="Assigned Site / Floor" placeholder="e.g., Floor 3 - Tech Hub" value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateEmployeesPage;

/**
 * CorporateEmployeesPage — Employee Directory Module
 * PostgreSQL API-backed employee list with department filters, search, and add employee flow.
 * Route: /org/:orgId/employees
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, PlusCircle, Search, UserCheck } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';
import { employeeApi } from '@services/vmsApi';

const CorporateEmployeesPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', dept: 'Technology', designation: '', site: 'Main Gate' });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getEmployees(currentOrgId, search);
      if (res.success) {
        setEmployees(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load employees from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentOrgId, search]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleAddSubmit = async () => {
    if (!form.name.trim()) return;
    try {
      const res = await employeeApi.createEmployee({
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.dept,
        designation: form.designation || 'Staff',
        companyId: currentOrgId,
        siteId: 1,
      });

      if (res.success) {
        showToast(`Employee ${form.name} added successfully!`, 'success');
        setAddOpen(false);
        setForm({ name: '', email: '', phone: '', dept: 'Technology', designation: '', site: 'Main Gate' });
        fetchEmployees();
      }
    } catch (err) {
      showToast('Failed to add employee', 'danger');
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.dept).filter(Boolean)));

  const filtered = employees.filter(e => {
    const matchDept = !deptFilter || e.dept === deptFilter;
    return matchDept;
  });

  return (
    <OrganizationLayout
      title="Employee Directory"
      subtitle={`Host employee directory & visitor notification routing • ${activeOrg?.displayName || activeOrg?.name || 'Organization'}`}
    >
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Employees', value: employees.length, icon: Briefcase, color: 'var(--color-primary)', sub: 'Registered host staff' },
          { label: 'Departments', value: departments.length || 1, icon: UserCheck, color: 'var(--color-success)', sub: 'Active departments' },
        ].map((k) => (
          <div key={k.label} className="col-12 col-md-6">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="stat-label small fw-semibold text-secondary">{k.label}</span>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <div className="stat-value h3 fw-bold text-dark mb-0">{loading ? '...' : k.value}</div>
              <div className="stat-subtext text-secondary small">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <Card
        title="Employee Directory"
        extra={
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <PlusCircle size={14} /> Add Employee
          </Button>
        }
      >
        {/* Search Controls */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div style={{ maxWidth: 320, width: '100%' }}>
            <Input
              placeholder="Search by name, dept, designation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<Search size={14} />}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <Select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              options={[
                { label: 'All Departments', value: '' },
                ...departments.map(d => ({ label: d, value: d })),
              ]}
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Location / Site</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-secondary">
                    Loading directory from PostgreSQL...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    No employees found. Click Add Employee to register new host staff.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id}>
                    <td><code>{e.employeeCode || e.id}</code></td>
                    <td>
                      <div className="fw-semibold text-dark">{e.name}</div>
                      <div className="text-secondary small">{e.email}</div>
                    </td>
                    <td><Badge variant="neutral">{e.dept}</Badge></td>
                    <td className="small">{e.designation}</td>
                    <td className="small text-secondary">{e.phone}</td>
                    <td className="small text-secondary">{e.site || 'Main Office'}</td>
                    <td><Badge variant="success">Active</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Drawer */}
      <Drawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Host Employee"
        onSave={handleAddSubmit}
      >
        <Input label="Full Name" placeholder="e.g. Rahul Verma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Email Address" placeholder="rahul.verma@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone Number" placeholder="+91 98000 11111" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Input label="Department" placeholder="e.g. Technology" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} />
        <Input label="Designation" placeholder="e.g. Senior Manager" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateEmployeesPage;

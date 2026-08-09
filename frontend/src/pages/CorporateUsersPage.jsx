/**
 * CorporateUsersPage — Organization Users Management (smartgate.user_details)
 * Full CRUD connected to Express REST API / PostgreSQL.
 * Route: /org/:orgId/users
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, Search, RefreshCw, Users, AlertTriangle, ToggleLeft, ToggleRight, PlusCircle
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Badge from '@components/ui/Badge';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';
import { userApi } from '@services/vmsApi';

const PAGE_SIZE = 10;

const CorporateUsersPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleCode: 'GU',
    password: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getUsers(currentOrgId);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setError('Unable to connect to backend');
      }
    } catch (err) {
      console.error('Failed to load users from API:', err);
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.userCode || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleStatus = async (user) => {
    try {
      const targetStatus = user.status !== 'Active';
      const res = await userApi.toggleStatus(user.id, targetStatus);
      if (res.success) {
        showToast(`User ${user.name} ${targetStatus ? 'Activated' : 'Deactivated'} in PostgreSQL.`);
        await fetchUsers();
      }
    } catch (err) {
      showToast('Failed to toggle user status on backend', 'error');
    }
  };

  const handleCreateUser = async () => {
    if (!form.name || !form.email) return;
    try {
      const res = await userApi.createUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        roleCode: form.roleCode,
        password: form.password || 'User@2026',
        companyId: currentOrgId,
      });
      if (res.success) {
        showToast(`User "${form.name}" created and saved to PostgreSQL!`, 'success');
        setDrawerOpen(false);
        setForm({ name: '', email: '', phone: '', roleCode: 'GU', password: '' });
        await fetchUsers();
      }
    } catch (err) {
      showToast('Failed to create user on backend', 'error');
    }
  };

  return (
    <OrganizationLayout title="Users & Access Control">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="org-page-container space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portal Users</h1>
            <p className="text-sm text-slate-500 mt-1">
              Portal user accounts stored in smartgate.user_details PostgreSQL table.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button onClick={() => setDrawerOpen(true)} className="bg-primary text-white flex items-center gap-2">
              <PlusCircle size={18} /> Add User
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
            <AlertTriangle size={20} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or user code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users from PostgreSQL...</div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">User Code</th>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paged.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs font-bold text-slate-700">{u.userCode}</td>
                      <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        {u.name}
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <Badge variant="info">{u.role || u.roleCode}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="p-2 text-slate-600 hover:text-primary transition-colors"
                          title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.status === 'Active' ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} className="text-slate-400" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Create Portal User">
        <div className="space-y-4 p-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vikram Sharma" />
          <Input label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. vikram@company.in" />
          <Input label="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 9876543210" />
          <Input label="Initial Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Default: User@2026" />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
            <select
              value={form.roleCode}
              onChange={(e) => setForm({ ...form, roleCode: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="CORP_ADMIN">Corporate Admin</option>
              <option value="RA">Security Desk (RA)</option>
              <option value="GU">Gate User (GU)</option>
              <option value="EMP">Employee (EMP)</option>
            </select>
          </div>
          <Button onClick={handleCreateUser} className="w-full bg-primary text-white mt-4">Save User to PostgreSQL</Button>
        </div>
      </Drawer>
    </OrganizationLayout>
  );
};

export default CorporateUsersPage;

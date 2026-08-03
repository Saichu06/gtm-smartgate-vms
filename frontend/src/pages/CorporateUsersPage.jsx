/**
 * CorporateUsersPage — Screen 4: Organization Users Management
 * Manage all portal users (Admins, Receptionists, Gate Operators, Security Leads).
 * Route: /org/users
 */
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Search, Download, RefreshCw, SlidersHorizontal, Users,
  ChevronLeft, ChevronRight, X, Eye, Edit3, Key, PauseCircle, PlayCircle, Trash2
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Badge from '@components/ui/Badge';
import Toast from '@components/feedback/Toast';
import initialUsers from '@mock/corporate_users.json';

const PAGE_SIZE = 6;

const CorporateUsersPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const id = orgId || 1;

  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.employeeId.toLowerCase().includes(q));
    }
    if (roleFilter) data = data.filter(u => u.role === roleFilter);
    if (siteFilter) data = data.filter(u => u.site === siteFilter);
    if (statusFilter) data = data.filter(u => u.status === statusFilter);
    return data;
  }, [users, search, roleFilter, siteFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(u => u.id)));
  };

  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleDeactivate = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    showToast(`User ${user.name} ${user.status === 'Active' ? 'Deactivated' : 'Activated'}`);
  };

  return (
    <OrganizationLayout
      title="User Management"
      subtitle="Manage organization users, role permissions, and site gate accessibility."
      actions={
        <Button variant="primary" onClick={() => navigate(`/org/${id}/users/new`)}>
          <Plus size={14} /> Create User
        </Button>
      }
    >
      <div className="table-wrapper">
        <div className="table-toolbar flex-between gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="global-search" style={{ width: 280 }}>
              <Search size={14} className="text-secondary" />
              <input 
                type="text" 
                placeholder="Search users by name, email, or EMP ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 150, height: 34, padding: '0 8px', fontSize: 13 }}>
              <option value="">All Roles</option>
              <option value="Corporate Admin">Corporate Admin</option>
              <option value="Site Admin">Site Admin</option>
              <option value="Receptionist">Receptionist</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Gate Operator">Gate Operator</option>
              <option value="Security Manager">Security Manager</option>
            </select>

            <select className="form-control" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} style={{ width: 160, height: 34, padding: '0 8px', fontSize: 13 }}>
              <option value="">All Sites</option>
              <option value="Head Office Chennai">Head Office Chennai</option>
              <option value="Limda Plant 1">Limda Plant 1</option>
              <option value="Perambra Unit">Perambra Unit</option>
            </select>

            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 130, height: 34, padding: '0 8px', fontSize: 13 }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => showToast('Exporting portal users list...', 'info')}>
              <Download size={12} /> Export
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw size={12} />
            </Button>
          </div>
        </div>

        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} />
                </th>
                <th>Full Name</th>
                <th>Work Email</th>
                <th>Phone</th>
                <th>Assigned Site</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr key={user.id} onClick={() => navigate(`/org/users/${user.id}`)} style={{ cursor: 'pointer' }}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleOne(user.id)} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <div className="fw-semibold text-dark">{user.name}</div>
                        <div className="text-secondary small">{user.employeeId} • {user.department}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td><span className="small text-secondary">{user.site}</span></td>
                  <td><Badge variant={user.role === 'Corporate Admin' ? 'primary' : user.role === 'Site Admin' ? 'info' : 'neutral'}>{user.role}</Badge></td>
                  <td><Badge variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge></td>
                  <td><span className="small text-secondary">{user.lastLogin}</span></td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <button className="btn btn-sm btn-light border p-1" title="View Details" onClick={() => navigate(`/org/users/${user.id}`)}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-sm btn-light border p-1 text-primary" title="Reset Password" onClick={() => showToast(`Password reset link emailed to ${user.email}`, 'info')}>
                        <Key size={14} />
                      </button>
                      <button className="btn btn-sm btn-light border p-1 text-warning" title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'} onClick={() => handleDeactivate(user)}>
                        {user.status === 'Active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <div>Showing <strong>{paged.length}</strong> of <strong>{filtered.length}</strong> Portal Users</div>
          <div className="d-flex gap-2">
            <Button variant="secondary" size="xs" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={13} /> Previous</Button>
            <Button variant="secondary" size="xs" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next <ChevronRight size={13} /></Button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateUsersPage;

/**
 * OrganizationsPage — Screen 1: Organization Management
 * Complete enterprise-grade organizations list with search, filters, table, bulk selection, and actions.
 * Routes to: /customers
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Download, RefreshCw, SlidersHorizontal,
  Building2, ChevronLeft, ChevronRight, X, ArrowUpDown,
} from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import StatusBadge from '@modules/organizations/components/StatusBadge';
import SubscriptionBadge from '@modules/organizations/components/SubscriptionBadge';
import ActionDropdown from '@modules/organizations/components/ActionDropdown';
import ConfirmationModal from '@modules/organizations/components/ConfirmationModal';
import Toast from '@components/feedback/Toast';
import LoadingSkeleton from '@components/feedback/LoadingSkeleton';
import { useOrganizations } from '@contexts/OrganizationContext';

const PAGE_SIZE = 6;

const OrganizationsPage = () => {
  const navigate = useNavigate();
  const { organizations, updateOrganizationStatus } = useOrganizations();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selected, setSelected] = useState(new Set());

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, type: 'suspend', org: null });

  // Toast
  const [toast, setToast] = useState(null);

  const INDUSTRIES = useMemo(() => [...new Set(organizations.map((o) => o.industry))], [organizations]);
  const COUNTRIES = useMemo(() => [...new Set(organizations.map((o) => o.country))], [organizations]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered + sorted data
  const filtered = useMemo(() => {
    let data = [...organizations];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.code.toLowerCase().includes(q) ||
          (o.corporateAdmin && o.corporateAdmin.toLowerCase().includes(q))
      );
    }
    if (statusFilter) data = data.filter((o) => o.status === statusFilter);
    if (planFilter) data = data.filter((o) => o.plan === planFilter);
    if (industryFilter) data = data.filter((o) => o.industry === industryFilter);
    if (countryFilter) data = data.filter((o) => o.country === countryFilter);

    data.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created) - new Date(a.created);
      if (sortBy === 'oldest') return new Date(a.created) - new Date(b.created);
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      return 0;
    });

    return data;
  }, [organizations, search, statusFilter, planFilter, industryFilter, countryFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPlanFilter('');
    setIndustryFilter('');
    setCountryFilter('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter || planFilter || industryFilter || countryFilter;

  // Bulk selection
  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map((o) => o.id)));
    }
  };

  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  // Actions
  const handleView = (org) => navigate(`/customers/${org.id}`);
  const handleEdit = (org) => navigate(`/customers/${org.id}`);
  const handleCreateAdmin = (org) => navigate(`/customers/${org.id}/create-admin`);
  const handleSuspend = (org) => setConfirmModal({ open: true, type: 'suspend', org });
  const handleActivate = (org) => setConfirmModal({ open: true, type: 'activate', org });
  const handleDelete = (org) => setConfirmModal({ open: true, type: 'delete', org });
  const handleExport = (org) => showToast(`Exporting ${org.name} data...`, 'info');

  const handleConfirm = () => {
    const { type, org } = confirmModal;
    if (type === 'suspend') {
      updateOrganizationStatus(org.id, 'Suspended');
      showToast(`${org.name} has been suspended.`, 'warning');
    } else if (type === 'activate') {
      updateOrganizationStatus(org.id, 'Active');
      showToast(`${org.name} has been activated.`, 'success');
    } else if (type === 'delete') {
      showToast(`${org.name} has been deleted.`, 'danger');
    }
    setConfirmModal({ open: false, type: 'suspend', org: null });
  };

  return (
    <AppLayout
      title="Organization Management"
      subtitle="Manage organizations, subscriptions, branding and corporate administrators."
      actions={
        <Button variant="primary" onClick={() => navigate('/customers/new')}>
          <Plus size={14} /> Create Organization
        </Button>
      }
    >
      {/* ── Summary Stats Strip ───────────────────────────────── */}
      <div className="org-stats-strip">
        {[
          { label: 'Total Organizations', value: organizations.length, color: 'var(--color-primary)' },
          { label: 'Active', value: organizations.filter((o) => o.status === 'Active').length, color: 'var(--color-success)' },
          { label: 'Trial', value: organizations.filter((o) => o.status === 'Trial').length, color: 'var(--color-warning)' },
          { label: 'Suspended', value: organizations.filter((o) => o.status === 'Suspended').length, color: 'var(--color-danger)' },
          { label: 'Enterprise', value: organizations.filter((o) => o.plan === 'Enterprise').length, color: '#1565C0' },
        ].map((s) => (
          <div key={s.label} className="org-stats-strip-item">
            <span className="org-stats-strip-value" style={{ color: s.color }}>{s.value}</span>
            <span className="org-stats-strip-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Table Card ────────────────────────────────────────── */}
      <div className="table-wrapper">
        {/* Toolbar */}
        <div className="table-toolbar" style={{ flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'stretch' }}>
          {/* Row 1: Search + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="global-search" style={{ width: 300, flexShrink: 0 }}>
              <Search size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: 0 }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <SlidersHorizontal size={13} />
              Filters
              {hasActiveFilters && (
                <span
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {[statusFilter, planFilter, industryFilter, countryFilter].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              style={{ width: 150, margin: 0, height: 34, padding: '0 10px', fontSize: 'var(--text-sm)' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetical</option>
            </select>

            {hasActiveFilters && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}
              >
                <X size={13} /> Clear All
              </button>
            )}

            {/* Right actions */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
              {selected.size > 0 && (
                <Button variant="danger" size="sm">
                  Suspend Selected ({selected.size})
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast('Exporting organizations list...', 'info')}
              >
                <Download size={12} /> Export
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw size={12} />
              </Button>
            </div>
          </div>

          {/* Row 2: Filter pills */}
          {showFilters && (
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ width: 140, margin: 0, height: 34, padding: '0 10px', fontSize: 'var(--text-sm)' }}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
              <select
                className="form-control"
                value={planFilter}
                onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                style={{ width: 160, margin: 0, height: 34, padding: '0 10px', fontSize: 'var(--text-sm)' }}
              >
                <option value="">All Subscriptions</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Professional">Professional</option>
                <option value="Trial">Trial</option>
              </select>
              <select
                className="form-control"
                value={industryFilter}
                onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
                style={{ width: 200, margin: 0, height: 34, padding: '0 10px', fontSize: 'var(--text-sm)' }}
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <select
                className="form-control"
                value={countryFilter}
                onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                style={{ width: 140, margin: 0, height: 34, padding: '0 10px', fontSize: 'var(--text-sm)' }}
              >
                <option value="">All Countries</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Building2 size={40} /></div>
            <div className="empty-title">No organizations found</div>
            <div className="empty-desc">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Create your first organization to get started.'}
            </div>
            {!hasActiveFilters && (
              <Button
                variant="primary"
                onClick={() => navigate('/customers/new')}
                style={{ marginTop: 'var(--space-4)' }}
              >
                <Plus size={14} /> Create Organization
              </Button>
            )}
          </div>
        ) : (
          <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === paged.length && paged.length > 0}
                      onChange={toggleAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Organization</th>
                  <th>Code</th>
                  <th>Industry</th>
                  <th>Corporate Admin</th>
                  <th>Subscription</th>
                  <th style={{ textAlign: 'center' }}>Sites</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'center', width: 60 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((org) => (
                  <tr
                    key={org.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/customers/${org.id}`)}
                    className={selected.has(org.id) ? 'org-row-selected' : ''}
                  >
                    {/* Checkbox */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(org.id)}
                        onChange={() => toggleOne(org.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>

                    {/* Organization */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-md)',
                            background: org.logo ? '#FFFFFF' : org.primaryColor,
                            border: `1px solid ${org.primaryColor}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontWeight: 800,
                            fontSize: 16,
                            color: '#FFFFFF',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                          }}
                        >
                          {org.logo ? (
                            <img src={org.logo} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                          ) : (
                            org.displayName?.charAt(0) || org.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 'var(--font-semibold)',
                              color: 'var(--color-text-primary)',
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            {org.name}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                            <a
                              href={`/org/${org.id}/login`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              /org/{org.id}/login
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td>
                      <code
                        style={{
                          fontSize: 'var(--text-xs)',
                          background: 'var(--color-bg-muted)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          fontWeight: 600,
                        }}
                      >
                        {org.code}
                      </code>
                    </td>

                    {/* Industry */}
                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {org.industry}
                      </span>
                    </td>

                    {/* Corporate Admin */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={org.corporateAdmin} size="sm" />
                        <div>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                            {org.corporateAdmin}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                            {org.corporateAdminStatus === 'Active' ? (
                              <span style={{ color: 'var(--color-success)' }}>● Active</span>
                            ) : (
                              <span style={{ color: 'var(--color-warning)' }}>● Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subscription */}
                    <td><SubscriptionBadge plan={org.plan} /></td>

                    {/* Sites */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 'var(--font-semibold)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {org.sites}
                      </span>
                    </td>

                    {/* Status */}
                    <td><StatusBadge status={org.status} /></td>

                    {/* Created */}
                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {new Date(org.created).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      style={{ textAlign: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionDropdown
                        organization={org}
                        onView={handleView}
                        onEdit={handleEdit}
                        onCreateAdmin={handleCreateAdmin}
                        onSuspend={org.status !== 'Suspended' ? handleSuspend : null}
                        onActivate={org.status === 'Suspended' ? handleActivate : null}
                        onDelete={handleDelete}
                        onExport={handleExport}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="table-pagination">
            <div>
              Showing{' '}
              <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong>{' '}
              of <strong>{filtered.length}</strong> organizations
              {selected.size > 0 && (
                <span style={{ marginLeft: 12, color: 'var(--color-primary)' }}>
                  · {selected.size} selected
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button
                variant="secondary"
                size="xs"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={13} /> Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: p === page ? 'var(--color-primary)' : 'var(--color-border)',
                    background: p === page ? 'var(--color-primary)' : 'transparent',
                    color: p === page ? 'white' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                    fontWeight: p === page ? 700 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="secondary"
                size="xs"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        type={confirmModal.type}
        organizationName={confirmModal.org?.name}
        onClose={() => setConfirmModal({ open: false, type: 'suspend', org: null })}
        onConfirm={handleConfirm}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
};

export default OrganizationsPage;

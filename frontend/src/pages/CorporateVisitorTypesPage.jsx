/**
 * CorporateVisitorTypesPage — Visitor Type Configuration
 * Define and manage visitor categories, allowed access zones, pass templates, and approval workflows.
 * Route: /org/:orgId/visitor-types
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tag, PlusCircle, Edit, Trash2, Shield, Clock, CheckCircle2 } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import LoadingSkeleton from '@components/feedback/LoadingSkeleton';
import { useOrganizations } from '@contexts/OrganizationContext';
import masterApiService from '@services/masterApi.service';

const CorporateVisitorTypesPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editType, setEditType] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '', color: '#1565C0', maxHours: 8,
    requiresApproval: 'yes', requiresID: 'yes', zones: '',
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    masterApiService
      .getPassCategory()
      .then((res) => {
        if (!isMounted) return;
        const rawData = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(rawData)) {
          const mapped = rawData.map((cat, idx) => ({
            id: cat.id || `CAT-${idx + 1}`,
            name: cat.pass_category || cat.category_name || cat.name || `Category ${idx + 1}`,
            code: cat.category_code || cat.code || `VT-00${idx + 1}`,
            color: '#1565C0',
            maxHours: 8,
            requiresApproval: true,
            requiresID: true,
            zones: ['General Areas'],
          }));
          setTypes(mapped);
        } else {
          setTypes([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[CorporateVisitorTypesPage] Failed to fetch pass categories:', err);
        setError('Unable to load visitor categories.');
        setTypes([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentOrgId]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const persistTypes = (updated) => {
    setTypes(updated);
    saveVisitorTypes(currentOrgId, updated);
  };

  const openCreate = () => {
    setEditType(null);
    setForm({ name: '', code: '', color: '#1565C0', maxHours: 8, requiresApproval: 'yes', requiresID: 'yes', zones: '' });
    setAddOpen(true);
  };

  const openEdit = (vt) => {
    setEditType(vt);
    setForm({
      name: vt.name, code: vt.code, color: vt.color, maxHours: vt.maxHours,
      requiresApproval: vt.requiresApproval ? 'yes' : 'no',
      requiresID: vt.requiresID ? 'yes' : 'no',
      zones: vt.zones.join(', '),
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      id: editType?.id || `VT-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      code: form.code || form.name.slice(0, 3).toUpperCase(),
      color: form.color,
      maxHours: parseInt(form.maxHours, 10) || 8,
      requiresApproval: form.requiresApproval === 'yes',
      requiresID: form.requiresID === 'yes',
      zones: form.zones.split(',').map(z => z.trim()).filter(Boolean),
      passTemplate: editType?.passTemplate || `${form.name} Pass`,
    };
    if (editType) {
      persistTypes(types.map(t => t.id === editType.id ? { ...t, ...payload } : t));
      showToast(`${payload.name} updated!`);
    } else {
      persistTypes([payload, ...types]);
      showToast(`${payload.name} created!`);
    }
    setAddOpen(false);
    setEditType(null);
  };

  const handleDelete = (vt) => {
    persistTypes(types.filter(t => t.id !== vt.id));
    showToast(`${vt.name} deleted`, 'warning');
  };

  return (
    <OrganizationLayout
      title="Visitor Types"
      subtitle={`Define visitor categories, access rules, and pass templates • ${activeOrg?.name}`}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="text-secondary small">
          {types.length} visitor types configured. Active counts reflect live kiosk check-ins.
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <PlusCircle size={14} /> Create Visitor Type
        </Button>
      </div>

      <div className="row g-3">
        {types.map(vt => (
          <div key={vt.id} className="col-12 col-md-6 col-xl-4">
            <div className="p-4 bg-white border rounded-3 shadow-sm h-100" style={{ borderTop: `4px solid ${vt.color}` }}>
              <div className="flex-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${vt.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={15} style={{ color: vt.color }} />
                  </div>
                  <div>
                    <div className="fw-semibold text-dark" style={{ fontSize: 'var(--text-sm)' }}>{vt.name}</div>
                    <code style={{ fontSize: 10 }}>{vt.code}</code>
                  </div>
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-light" onClick={() => openEdit(vt)}><Edit size={13} /></button>
                  <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(vt)}><Trash2 size={13} /></button>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  <Clock size={12} /> Max Duration: <strong className="text-dark">{vt.maxHours}h</strong>
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  <CheckCircle2 size={12} /> Host Approval: <Badge variant={vt.requiresApproval ? 'warning' : 'success'} style={{ fontSize: 10 }}>{vt.requiresApproval ? 'Required' : 'Auto-approve'}</Badge>
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  <Shield size={12} /> ID Verification: <Badge variant={vt.requiresID ? 'info' : 'neutral'} style={{ fontSize: 10 }}>{vt.requiresID ? 'Mandatory' : 'Optional'}</Badge>
                </div>
              </div>

              <div className="mb-3">
                <div className="small fw-semibold text-secondary mb-1">Allowed Zones:</div>
                <div className="d-flex flex-wrap gap-1">
                  {vt.zones.map(z => (
                    <span key={z} className="px-2 py-1 rounded-3" style={{ fontSize: 10, background: `${vt.color}15`, color: vt.color, fontWeight: 600 }}>
                      {z}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-between border-top pt-2 mt-2">
                <span className="small text-secondary">Pass: <strong>{vt.passTemplate}</strong></span>
                <span className="small" style={{ color: (activeCounts[vt.name] || 0) > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                  {activeCounts[vt.name] || 0} active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Drawer
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setEditType(null); }}
        title={editType ? `Edit: ${editType.name}` : 'Create Visitor Type'}
        onSave={handleSave}
      >
        <Input label="Type Name" placeholder="e.g., VIP Guest" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Type Code" placeholder="e.g., VIP" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
        <Input label="Pass Color (Hex)" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
        <Input label="Max Visit Duration (hours)" type="number" placeholder="8" value={form.maxHours} onChange={e => setForm({ ...form, maxHours: e.target.value })} />
        <Select
          label="Approval Required"
          value={form.requiresApproval}
          onChange={e => setForm({ ...form, requiresApproval: e.target.value })}
          options={[{ label: 'Yes – Host must approve', value: 'yes' }, { label: 'No – Auto approve', value: 'no' }]}
        />
        <Select
          label="ID Verification"
          value={form.requiresID}
          onChange={e => setForm({ ...form, requiresID: e.target.value })}
          options={[{ label: 'Mandatory', value: 'yes' }, { label: 'Optional', value: 'no' }]}
        />
        <Input label="Allowed Zones (comma-separated)" placeholder="Reception, Meeting Rooms, Cafeteria" value={form.zones} onChange={e => setForm({ ...form, zones: e.target.value })} />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateVisitorTypesPage;

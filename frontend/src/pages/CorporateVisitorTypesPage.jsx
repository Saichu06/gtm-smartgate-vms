/**
 * CorporateVisitorTypesPage — Visitor Type Configuration
 * Define and manage visitor categories, allowed access zones, pass templates, and approval workflows.
 * Route: /org/:orgId/visitor-types
 */
import React, { useState } from 'react';
import { Tag, PlusCircle, Edit, Trash2, Shield, Clock, CheckCircle2 } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Select from '@components/forms/Select';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';

const MOCK_TYPES = [
  { id: 'VT-001', name: 'Business Visitor', code: 'BUS', color: '#1565C0', maxHours: 8, requiresApproval: true, requiresID: true, zones: ['Reception', 'Meeting Rooms', 'Cafeteria'], passTemplate: 'Standard Blue', activeVisitors: 6 },
  { id: 'VT-002', name: 'Vendor / Supplier', code: 'VEN', color: '#2E7D32', maxHours: 12, requiresApproval: true, requiresID: true, zones: ['Loading Dock', 'Warehouse', 'Finance Dept'], passTemplate: 'Green Pass', activeVisitors: 2 },
  { id: 'VT-003', name: 'Contractor', code: 'CON', color: '#F57C00', maxHours: 24, requiresApproval: true, requiresID: true, zones: ['Plant Areas', 'Workshop', 'Utility Rooms'], passTemplate: 'Orange Safety', activeVisitors: 1 },
  { id: 'VT-004', name: 'Job Candidate', code: 'CAN', color: '#6A1B9A', maxHours: 4, requiresApproval: false, requiresID: true, zones: ['HR Wing', 'Interview Rooms'], passTemplate: 'Purple Temp', activeVisitors: 1 },
  { id: 'VT-005', name: 'Auditor / Inspector', code: 'AUD', color: '#C62828', maxHours: 10, requiresApproval: true, requiresID: true, zones: ['All Areas'], passTemplate: 'Red Authority', activeVisitors: 1 },
  { id: 'VT-006', name: 'Government Official', code: 'GOV', color: '#212121', maxHours: 8, requiresApproval: true, requiresID: true, zones: ['Executive Suite', 'Board Room', 'All Areas'], passTemplate: 'Black Protocol', activeVisitors: 0 },
  { id: 'VT-007', name: 'Delivery Personnel', code: 'DEL', color: '#00838F', maxHours: 2, requiresApproval: false, requiresID: false, zones: ['Reception', 'Loading Dock'], passTemplate: 'Teal Quick', activeVisitors: 0 },
];

const CorporateVisitorTypesPage = () => {
  const { activeOrg } = useOrganizations();
  const [addOpen, setAddOpen] = useState(false);
  const [editType, setEditType] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  return (
    <OrganizationLayout
      title="Visitor Types"
      subtitle={`Define visitor categories, access rules, and pass templates • ${activeOrg?.name}`}
    >
      {/* Header Action */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="text-secondary small">
            {MOCK_TYPES.length} visitor types configured. Pass templates control badge colors, access zones, and approval requirements.
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <PlusCircle size={14} /> Create Visitor Type
        </Button>
      </div>

      {/* Visitor Type Cards Grid */}
      <div className="row g-3">
        {MOCK_TYPES.map(vt => (
          <div key={vt.id} className="col-12 col-md-6 col-xl-4">
            <div
              className="p-4 bg-white border rounded-3 shadow-sm h-100"
              style={{ borderTop: `4px solid ${vt.color}` }}
            >
              {/* Type Header */}
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
                  <button className="btn btn-sm btn-light" onClick={() => { setEditType(vt); setAddOpen(true); }}><Edit size={13} /></button>
                  <button className="btn btn-sm btn-light text-danger" onClick={() => showToast(`${vt.name} deleted`, 'warning')}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Config Details */}
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

              {/* Access Zones */}
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

              {/* Footer */}
              <div className="flex-between border-top pt-2 mt-2">
                <span className="small text-secondary">Pass: <strong>{vt.passTemplate}</strong></span>
                <span className="small" style={{ color: vt.activeVisitors > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                  {vt.activeVisitors} active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Drawer */}
      <Drawer
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setEditType(null); }}
        title={editType ? `Edit: ${editType.name}` : 'Create Visitor Type'}
        onSave={() => { showToast(editType ? 'Visitor type updated!' : 'New visitor type created!'); setAddOpen(false); setEditType(null); }}
      >
        <Input label="Type Name" placeholder="e.g., VIP Guest" defaultValue={editType?.name} />
        <Input label="Type Code" placeholder="e.g., VIP" defaultValue={editType?.code} />
        <Input label="Pass Color (Hex)" type="color" defaultValue={editType?.color || '#1565C0'} />
        <Input label="Max Visit Duration (hours)" type="number" placeholder="8" defaultValue={editType?.maxHours} />
        <Select
          label="Approval Required"
          defaultValue={editType?.requiresApproval ? 'yes' : 'no'}
          options={[{ label: 'Yes – Host must approve', value: 'yes' }, { label: 'No – Auto approve', value: 'no' }]}
        />
        <Select
          label="ID Verification"
          defaultValue={editType?.requiresID ? 'yes' : 'no'}
          options={[{ label: 'Mandatory', value: 'yes' }, { label: 'Optional', value: 'no' }]}
        />
        <Input label="Allowed Zones (comma-separated)" placeholder="Reception, Meeting Rooms, Cafeteria" />
      </Drawer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </OrganizationLayout>
  );
};

export default CorporateVisitorTypesPage;

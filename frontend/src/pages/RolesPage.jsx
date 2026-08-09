/**
 * Roles Page Component
 * Role selection sidebar and granular module permission matrix table.
 * Mapped to roleinfos in PostgreSQL database.
 */
import React, { useState } from 'react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import Button from '@components/ui/Button';

const SYSTEM_ROLES = [
  { id: 'role_1', code: 'SUPER_ADMIN', name: 'GTM Super Admin', description: 'Full root access to platform, organizations, billing, and system configurations.' },
  { id: 'role_2', code: 'CORP_ADMIN', name: 'Corporate Admin', description: 'Organization administrator with full access to sites, employees, gate passes, and visitor logs.' },
  { id: 'role_3', code: 'SECURITY_DESK', name: 'Security Desk Officer', description: 'Front gate security access to process visitor check-in, check-out, and pass validation.' },
  { id: 'role_4', code: 'GATE_USER', name: 'Gate User / Self-Service Terminal', description: 'Restricted kiosk access for self-service visitor registration and badge printing.' },
];

const RolesPage = () => {
  const [selectedRoleId, setSelectedRoleId] = useState('role_1');

  return (
    <AppLayout
      title="Roles & Permission Matrix"
      subtitle="Define access control policies and granular module permissions across GTM platform."
    >
      <div className="grid-cols-1-2">
        <Card title="Defined System Roles">
          {SYSTEM_ROLES.map((r) => (
            <div
              key={r.id}
              className={`nav-item ${selectedRoleId === r.id ? 'active' : ''}`}
              onClick={() => setSelectedRoleId(r.id)}
              style={{ padding: '10px', marginBottom: '4px', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div className="text-muted text-xs" style={{ marginTop: '2px' }}>{r.description.substring(0, 60)}...</div>
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Granular Permission Matrix"
          actions={
            <Button variant="primary" size="sm" onClick={() => alert('Role permissions saved successfully!')}>
              Save Matrix Changes
            </Button>
          }
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Module / Resource</th>
                <th style={{ textAlign: 'center' }}>Read</th>
                <th style={{ textAlign: 'center' }}>Create</th>
                <th style={{ textAlign: 'center' }}>Edit</th>
                <th style={{ textAlign: 'center' }}>Delete</th>
                <th style={{ textAlign: 'center' }}>Export Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Customer Accounts</strong></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
              </tr>
              <tr>
                <td><strong>Subscriptions & Billing</strong></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
              </tr>
              <tr>
                <td><strong>Platform Users</strong></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><strong>Security Audit Logs</strong></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
              </tr>
              <tr>
                <td><strong>System Settings</strong></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked disabled /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" defaultChecked /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RolesPage;

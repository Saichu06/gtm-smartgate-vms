/**
 * Roles Page Component
 * Role selection sidebar and granular module permission matrix table.
 */
import React, { useState, useEffect } from 'react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import Button from '@components/ui/Button';

import initialRolesData from '@mock/roles.json';
import masterApiService from '@services/masterApi.service';

const RolesPage = () => {
  const [roles, setRoles] = useState(initialRolesData);
  const [selectedRoleId, setSelectedRoleId] = useState(1);

  const [gatePrivileges, setGatePrivileges] = useState([]);

  useEffect(() => {
    masterApiService
      .getRoleList()
      .then((res) => {
        const rawData = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mappedRoles = rawData.map((item, idx) => ({
            id: item.id || idx + 1,
            name: item.name || item.role_name || `Role ${item.id}`,
            description: item.description || item.code || 'System Role',
          }));
          setRoles(mappedRoles);
          setSelectedRoleId(mappedRoles[0].id);
        }
      })
      .catch((err) => {
        console.warn('[RolesPage] Master Role List fallback:', err.message || err);
      });

    masterApiService
      .getGatePrivileges()
      .then((res) => {
        const rawData = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(rawData)) {
          setGatePrivileges(rawData);
        }
      })
      .catch((err) => {
        console.warn('[RolesPage] Master Gate Privileges GET error:', err.message || err);
      });
  }, []);

  return (
    <AppLayout
      title="Roles & Permission Matrix"
      subtitle="Define access control policies and granular module permissions across GTM platform."
    >
      <div className="grid-cols-1-2">
        <Card title="Defined Roles">
          {roles.map((r) => (
            <div
              key={r.id}
              className={`nav-item ${selectedRoleId === r.id ? 'active' : ''}`}
              onClick={() => setSelectedRoleId(r.id)}
              style={{ padding: '10px', marginBottom: '4px' }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div className="text-muted text-xs" style={{ marginTop: '2px' }}>{r.description.substring(0, 50)}...</div>
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Granular Permission Matrix"
          actions={
            <Button variant="primary" size="sm" onClick={() => alert('Role permissions matrix saved successfully!')}>
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

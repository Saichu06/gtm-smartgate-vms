/**
 * Audit Logs Page Component
 * Immutable security audit trail table with severity tags and export options.
 * Mapped to visitor_trans / audit activity in PostgreSQL database.
 */
import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Select from '@components/forms/Select';

const INITIAL_AUDIT_LOGS = [
  { id: 'LOG-1001', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), actor: 'Super Admin', action: 'System Init', target: 'PostgreSQL Database', severity: 'Info', ip: '127.0.0.1' },
  { id: 'LOG-1002', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), actor: 'Self-Service Kiosk', action: 'Gate Pass Check-in', target: 'Apollo Tyres Ltd', severity: 'Info', ip: '192.168.1.10' },
];

const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const filteredLogs = INITIAL_AUDIT_LOGS.filter((log) => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter ? log.severity === severityFilter : true;
    return matchesSearch && matchesSeverity;
  });

  const columns = [
    { header: 'Log ID', key: 'id', render: (row) => <code>{row.id}</code> },
    { header: 'Timestamp', key: 'timestamp' },
    { header: 'Actor (User/System)', key: 'actor', render: (row) => <strong>{row.actor}</strong> },
    { header: 'Event Action', key: 'action', render: (row) => <Badge variant="neutral">{row.action}</Badge> },
    { header: 'Target Enterprise', key: 'target' },
    {
      header: 'Severity',
      key: 'severity',
      render: (row) => (
        <Badge variant={row.severity === 'Info' ? 'neutral' : row.severity === 'Warning' ? 'warning' : 'danger'}>
          {row.severity}
        </Badge>
      ),
    },
    { header: 'IP Address', key: 'ip' },
  ];

  return (
    <AppLayout
      title="Platform Audit Logs"
      subtitle="Immutable security log trail of all administrative actions executed across tenants."
      actions={
        <Button variant="secondary" onClick={() => alert('Exporting Audit Log CSV...')}>
          <Download size={14} /> Export Logs (CSV)
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={filteredLogs}
        toolbar={
          <div className="toolbar-left">
            <div className="global-search" style={{ width: '240px' }}>
              <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="text"
                placeholder="Search log event or actor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              placeholder="All Severities"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { label: 'Info', value: 'Info' },
                { label: 'Warning', value: 'Warning' },
                { label: 'Critical', value: 'Critical' },
              ]}
              style={{ width: '140px', margin: 0 }}
            />
          </div>
        }
      />
    </AppLayout>
  );
};

export default AuditLogsPage;

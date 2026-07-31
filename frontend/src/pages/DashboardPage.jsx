/**
 * Dashboard Page Component
 * GTM Smart Gate Enterprise Visitor Management SaaS Master Control Center.
 * Production-quality reusable design system template.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Key, Users, MapPin, UserCheck, RefreshCw, Clock, 
  CheckCircle2, AlertTriangle, Info, PlusCircle, UserPlus, FileKey, 
  Settings, FileText, ExternalLink, Eye, Edit3, Slash, AlertCircle
} from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';

import dashboardData from '@mock/dashboard.json';
import customersData from '@mock/customers.json';
import auditLogsData from '@mock/auditlogs.json';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [visitorTimeframe, setVisitorTimeframe] = useState('30D');

  // Recent Organizations table definition with exact requested columns
  const organizationColumns = [
    {
      header: 'Organization',
      key: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-primary" style={{ cursor: 'pointer' }} onClick={() => navigate(`/customers/${row.id}`)}>{row.name}</div>
          <div className="text-secondary small">{row.code} • {row.subdomain}</div>
        </div>
      ),
    },
    { 
      header: 'Plan', 
      key: 'plan', 
      render: (row) => (
        <Badge variant={row.plan === 'Enterprise' ? 'primary' : row.plan === 'Professional' ? 'neutral' : 'warning'}>
          {row.plan}
        </Badge>
      ) 
    },
    { header: 'Sites', key: 'sites', render: (row) => `${row.sites} Sites` },
    { 
      header: 'Corporate Admin', 
      key: 'corporateAdmin', 
      render: (row) => <span className="small text-dark fw-medium">{row.corporateAdmin || row.email}</span> 
    },
    { 
      header: 'Last Activity', 
      key: 'lastActivity', 
      render: (row) => <span className="small text-secondary">{row.lastActivity || '10 mins ago'}</span> 
    },
    { 
      header: 'License Expiry', 
      key: 'licenseExpiry', 
      render: (row) => <span className="small text-secondary">{row.licenseExpiry || '2027-01-12'}</span> 
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Trial' ? 'warning' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button 
            className="btn btn-sm btn-light border text-secondary p-1" 
            title="View Details" 
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <Eye size={14} />
          </button>
          <button 
            className="btn btn-sm btn-light border text-secondary p-1" 
            title="Edit Organization" 
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <Edit3 size={14} />
          </button>
          <button 
            className="btn btn-sm btn-light border text-danger p-1" 
            title="Suspend Organization" 
            onClick={() => alert(`Suspend organization: ${row.name}`)}
          >
            <Slash size={14} />
          </button>
          <button 
            className="btn btn-sm btn-light border text-primary p-1" 
            title="Open Customer Portal" 
            onClick={() => window.open(`https://${row.subdomain}`, '_blank')}
          >
            <ExternalLink size={14} />
          </button>
        </div>
      )
    }
  ];

  const getLogBadgeColor = (color) => {
    switch (color) {
      case 'green': return '#2E7D32';
      case 'blue': return '#1565C0';
      case 'orange': return '#ED6C02';
      case 'red': return '#D32F2F';
      default: return '#64748B';
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-danger-subtle text-danger border-danger-subtle';
      case 'Warning': return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
      default: return 'bg-info-subtle text-info-emphasis border-info-subtle';
    }
  };

  return (
    <AppLayout 
      title="Platform Dashboard — Enterprise Visitor Management SaaS" 
      subtitle="Monitor organizations, visitors, subscriptions, platform operations and customer activity across GTM Smart Gate."
    >
      {/* Page Header Right Controls bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 p-3 bg-white border rounded-3 shadow-sm">
        <div className="d-flex align-items-center gap-2 small text-secondary">
          <Clock size={15} className="text-primary" />
          <span><strong>Last Synchronization:</strong> July 31, 2026 • 11:05 AM IST</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw size={13} /> Refresh Dashboard
        </Button>
      </div>

      {/* 5 Top Business Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold text-uppercase">Organizations</span>
              <Building2 size={18} className="text-primary" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{dashboardData.totalOrganizations}</div>
            <div className="stat-subtext text-success small fw-medium">↑ +2 this month • Onboarded</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold text-uppercase">Active Licenses</span>
              <Key size={18} className="text-success" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">
              {dashboardData.activeLicenses.enterprise + dashboardData.activeLicenses.professional + dashboardData.activeLicenses.trial}
            </div>
            <div className="stat-subtext small text-secondary">
              <span className="text-primary fw-semibold">{dashboardData.activeLicenses.enterprise} Enterprise</span> • {dashboardData.activeLicenses.professional} Pro • {dashboardData.activeLicenses.trial} Trial
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold text-uppercase">Visitors Today</span>
              <UserCheck size={18} className="text-primary" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{dashboardData.visitorsToday.toLocaleString()}</div>
            <div className="stat-subtext text-success small fw-medium">↑ +14% vs yesterday • All gates</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold text-uppercase">Active Sites</span>
              <MapPin size={18} className="text-info" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{dashboardData.activeSites}</div>
            <div className="stat-subtext small text-secondary">Deployed customer campuses</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold text-uppercase">Platform Users</span>
              <Users size={18} className="text-warning" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{dashboardData.platformUsers}</div>
            <div className="stat-subtext small text-secondary">GTM Super Admins & Staff</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white border rounded-3 p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>Quick Actions</span>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/customers/new')}>
            <PlusCircle size={14} /> Create Organization
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/platform-users')}>
            <UserPlus size={14} /> Invite Platform User
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/subscriptions')}>
            <FileKey size={14} /> Generate License
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/settings')}>
            <Settings size={14} /> System Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/audit-logs')}>
            <FileText size={14} /> Audit Logs
          </Button>
        </div>
      </div>

      {/* Essential Platform Health Section */}
      <div className="mb-4">
        <Card title="Platform Service Health">
          <div className="row g-3">
            {Object.entries(dashboardData.systemHealth).map(([key, service]) => (
              <div key={key} className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-light border rounded-3 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-semibold text-dark small text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-secondary" style={{ fontSize: '11px' }}>
                      {service.uptime} uptime • Latency {service.latency} • Checked {service.lastChecked}
                    </div>
                  </div>
                  <Badge variant={service.status === 'Operational' || service.status === 'Healthy' ? 'success' : 'warning'}>
                    <CheckCircle2 size={11} /> {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analytics & Subscription Charts Row (65% / 35% Split with Time Period Tabs) */}
      <div className="row g-3 mb-4">
        {/* Visitors Processed Chart (65% width, ~300px height with Tabs) */}
        <div className="col-12 col-lg-8">
          <Card 
            title="Visitors Processed"
            actions={
              <div className="btn-group btn-group-sm" role="group">
                <button 
                  type="button" 
                  className={`btn ${visitorTimeframe === '1D' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setVisitorTimeframe('1D')}
                >
                  Today
                </button>
                <button 
                  type="button" 
                  className={`btn ${visitorTimeframe === '7D' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setVisitorTimeframe('7D')}
                >
                  7 Days
                </button>
                <button 
                  type="button" 
                  className={`btn ${visitorTimeframe === '30D' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setVisitorTimeframe('30D')}
                >
                  30 Days
                </button>
              </div>
            }
          >
            <div className="d-flex flex-column justify-content-between p-1" style={{ height: '240px', maxHeight: '250px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small">
                  Volume ({visitorTimeframe === '1D' ? 'Today' : visitorTimeframe === '7D' ? 'Last 7 Days' : 'Last 30 Days'}): <strong>{visitorTimeframe === '1D' ? '24,850' : visitorTimeframe === '7D' ? '164,200' : '684,200'} Visitors</strong>
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">Peak: 28,400 / day</span>
              </div>
              <div className="w-100 flex-grow-1 position-relative" style={{ minHeight: '180px' }}>
                <svg className="w-100 h-100" viewBox="0 0 600 160" preserveAspectRatio="none" fill="none">
                  <path d="M0 140 Q 60 120, 120 90 T 240 110 T 360 40 T 480 60 T 600 30" stroke="#1565C0" strokeWidth="3" fill="none" />
                  <path d="M0 140 Q 60 120, 120 90 T 240 110 T 360 40 T 480 60 T 600 30 L 600 160 L 0 160 Z" fill="url(#visitorGradient)" opacity="0.15" />
                  <defs>
                    <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1565C0" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <circle cx="120" cy="90" r="4" fill="#1565C0" />
                  <circle cx="240" cy="110" r="4" fill="#1565C0" />
                  <circle cx="360" cy="40" r="4" fill="#1565C0" />
                  <circle cx="480" cy="60" r="4" fill="#1565C0" />
                  <circle cx="600" cy="30" r="4" fill="#1565C0" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Subscription Distribution Donut Chart (35% width, percentages shown) */}
        <div className="col-12 col-lg-4">
          <Card title="Subscription Distribution">
            <div className="d-flex flex-column align-items-center justify-content-between p-1" style={{ height: '240px', maxHeight: '250px' }}>
              <div className="d-flex align-items-center justify-content-center flex-grow-1 w-100 my-1 position-relative">
                <svg width="130" height="130" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E5E7EB" strokeWidth="5"></circle>
                  {/* Enterprise Segment (66%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1565C0" strokeWidth="5" strokeDasharray="66 34" strokeDashoffset="25"></circle>
                  {/* Professional Segment (25%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0369A1" strokeWidth="5" strokeDasharray="25 75" strokeDashoffset="59"></circle>
                  {/* Trial Segment (9%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ED6C02" strokeWidth="5" strokeDasharray="9 91" strokeDashoffset="34"></circle>
                </svg>
                <div className="position-absolute text-center">
                  <div className="fw-bold h5 mb-0 text-dark">12</div>
                  <div className="text-secondary" style={{ fontSize: '10px' }}>Tenants</div>
                </div>
              </div>
              <div className="d-flex justify-content-around text-center small w-100 pt-2 border-top">
                <div>
                  <span className="d-inline-block rounded-circle me-1" style={{ width: '8px', height: '8px', background: '#1565C0' }}></span>
                  <span className="fw-semibold">Enterprise (66%)</span>
                </div>
                <div>
                  <span className="d-inline-block rounded-circle me-1" style={{ width: '8px', height: '8px', background: '#0369A1' }}></span>
                  <span className="fw-semibold">Pro (25%)</span>
                </div>
                <div>
                  <span className="d-inline-block rounded-circle me-1" style={{ width: '8px', height: '8px', background: '#ED6C02' }}></span>
                  <span className="fw-semibold">Trial (9%)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Grid: Recent Organizations & Audit / Alerts */}
      <div className="row g-3">
        {/* Recent Organizations Table */}
        <div className="col-12 col-xl-8">
          <Card
            title="Recent Organizations"
            actions={<Button variant="secondary" size="sm" onClick={() => navigate('/customers')}>View All</Button>}
          >
            <DataTable
              columns={organizationColumns}
              data={customersData.slice(0, 5)}
            />
          </Card>
        </div>

        {/* Right Sidebar: Grouped Platform Alerts & Color-Coded Audit Stream */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          {/* Grouped Platform Alerts Widget */}
          <Card title="Platform Alerts">
            <div className="d-flex flex-column gap-2">
              {dashboardData.platformAlerts.map((alertItem) => (
                <div 
                  key={alertItem.id} 
                  className={`p-2 rounded-2 border d-flex align-items-center gap-2 small ${getSeverityBadgeClass(alertItem.severity)}`}
                >
                  {alertItem.severity === 'Critical' ? <AlertCircle size={15} /> :
                   alertItem.severity === 'Warning' ? <AlertTriangle size={15} /> : <Info size={15} />}
                  <div className="d-flex flex-column">
                    <span className="fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{alertItem.severity}</span>
                    <span>{alertItem.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Color-Coded Audit Stream */}
          <Card title="Platform Audit Stream">
            <div className="d-flex flex-column gap-2">
              {auditLogsData.map((log) => (
                <div key={log.id} className="pb-2 mb-2 border-bottom border-dashed">
                  <div className="d-flex align-items-center justify-content-between">
                    <span 
                      className="badge fw-semibold" 
                      style={{ 
                        backgroundColor: `${getLogBadgeColor(log.color)}15`, 
                        color: getLogBadgeColor(log.color),
                        border: `1px solid ${getLogBadgeColor(log.color)}40`
                      }}
                    >
                      {log.action}
                    </span>
                    <span className="text-secondary" style={{ fontSize: '11px' }}>{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <div className="text-secondary small mt-1">
                    By <strong>{log.actor}</strong> for <span className="text-primary fw-medium">{log.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;



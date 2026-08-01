/**
 * CorporateDashboardPage — Screen 3: Operational Corporate Dashboard
 * Real-time operational overview for Organization's Visitor Management System.
 * Route: /org/dashboard
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserCheck, Clock, CheckCircle2, Users, MapPin, ShieldCheck, PlusCircle,
  UserPlus, FileCheck, ArrowRight, AlertTriangle, Eye, Check, X, Calendar
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import DataTable from '@components/data-display/DataTable';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import { useOrganizations } from '@contexts/OrganizationContext';

import dashboardData from '@mock/corporate_dashboard.json';

const CorporateDashboardPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { activeOrg } = useOrganizations();
  const id = orgId || activeOrg?.id || 1;
  const org = activeOrg || dashboardData.organization;
  const kpis = {
    visitorsToday: org.visitorsToday || 1420,
    expectedVisitors: 380,
    pendingApprovals: 24,
    totalEmployees: org.employees || 1240,
    totalSites: org.sites || 8,
    gateActivityCount: 3840
  };

  return (
    <OrganizationLayout
      title={`${org.displayName || org.name} Visitor Operations`}
      subtitle={`Live Visitor Management System control center • ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
    >
      {/* Quick Actions Strip */}
      <div className="bg-white border rounded-3 p-3 mb-4 shadow-sm flex-between flex-wrap gap-2">
        <div className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
          Operational Quick Actions ({org.code})
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => alert('Registering new visitor pass...')}>
            <PlusCircle size={14} /> Register Visitor
          </Button>
          <Button variant="secondary" size="sm" onClick={() => alert('Adding new employee...')}>
            <UserPlus size={14} /> Add Employee
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/users/new`)}>
            <Users size={14} /> Create Portal User
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/sites`)}>
            <MapPin size={14} /> Manage Sites
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/org/${id}/approvals`)}>
            <FileCheck size={14} /> Approve Visitors ({kpis.pendingApprovals})
          </Button>
        </div>
      </div>

      {/* 6 Top Operational Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold">Today's Visitors</span>
              <UserCheck size={16} color={org.primaryColor} />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{kpis.visitorsToday.toLocaleString()}</div>
            <div className="stat-subtext text-success small fw-medium">↑ +14% vs avg</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold">Expected Today</span>
              <Clock size={16} className="text-info" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{kpis.expectedVisitors}</div>
            <div className="stat-subtext text-secondary small">Pre-registered passes</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold">Pending Approvals</span>
              <AlertTriangle size={16} className="text-warning" />
            </div>
            <div className="stat-value h3 fw-bold text-warning mb-1">{kpis.pendingApprovals}</div>
            <div className="stat-subtext text-warning small fw-medium">Requires host action</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold">Total Employees</span>
              <Users size={16} className="text-primary" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{kpis.totalEmployees.toLocaleString()}</div>
            <div className="stat-subtext text-secondary small">AD Synced Users</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold">Active Sites</span>
              <MapPin size={16} className="text-success" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{kpis.totalSites}</div>
            <div className="stat-subtext text-secondary small">Gates & Campuses</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="stat-card h-100 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-1">
              <span className="stat-label small fw-semibold">Gate Scans</span>
              <ShieldCheck size={16} className="text-primary" />
            </div>
            <div className="stat-value h3 fw-bold text-dark mb-1">{kpis.gateActivityCount.toLocaleString()}</div>
            <div className="stat-subtext text-success small fw-medium">100% Gate Uptime</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row (65% / 35% Split) */}
      <div className="row g-3 mb-4">
        {/* Visitor Traffic Trend Line Chart */}
        <div className="col-12 col-lg-8">
          <Card title={`Visitor Check-in Trends (${org.name} Gates)`}>
            <div className="d-flex flex-column justify-content-between p-1" style={{ height: '230px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small">Weekly Breakdown: <strong>7,380 Total Visitors</strong></span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Peak: Wednesday (1,480)</span>
              </div>
              <div className="w-100 flex-grow-1 position-relative" style={{ minHeight: '160px' }}>
                <svg className="w-100 h-100" viewBox="0 0 600 140" preserveAspectRatio="none" fill="none">
                  <path d="M0 110 Q 100 80, 200 40 T 400 30 T 600 120" stroke={org.primaryColor} strokeWidth="3" fill="none" />
                  <circle cx="100" cy="80" r="4" fill={org.primaryColor} />
                  <circle cx="200" cy="40" r="4" fill={org.primaryColor} />
                  <circle cx="300" cy="20" r="4" fill={org.primaryColor} />
                  <circle cx="400" cy="30" r="4" fill={org.primaryColor} />
                  <circle cx="500" cy="90" r="4" fill={org.primaryColor} />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Visitor Type Distribution Donut Chart */}
        <div className="col-12 col-lg-4">
          <Card title="Visitor Category Breakdown">
            <div className="d-flex flex-column justify-content-between p-1" style={{ height: '230px' }}>
              <div className="d-flex flex-column gap-2 mt-2">
                {dashboardData.visitorTypes.map((v) => (
                  <div key={v.type} className="d-flex align-items-center justify-content-between text-sm">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: 10, height: 10, background: v.color }}></span>
                      <span>{v.type}</span>
                    </div>
                    <span className="fw-semibold">{v.percentage}% ({v.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tables Grid Row */}
      <div className="row g-3">
        {/* Recent Visitors Table */}
        <div className="col-12 col-xl-8">
          <Card title={`Live Gate Feed (${org.displayName})`}>
            <DataTable
              columns={[
                { header: 'Pass ID', key: 'id', render: (r) => <code>{r.id}</code> },
                { header: 'Visitor Name', key: 'name', render: (r) => <div><div className="fw-semibold text-dark">{r.name}</div><div className="text-secondary small">{r.company}</div></div> },
                { header: 'Category', key: 'type', render: (r) => <Badge variant="neutral">{r.type}</Badge> },
                { header: 'Gate / Site', key: 'site' },
                { header: 'Host Employee', key: 'host' },
                { header: 'Status', key: 'status', render: (r) => <Badge variant={r.status === 'Checked In' ? 'success' : 'neutral'}>{r.status}</Badge> },
              ]}
              data={dashboardData.recentVisitors}
            />
          </Card>
        </div>

        {/* Pending Host Approvals Queue */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          <Card title="Pending Approvals Queue">
            <div className="d-flex flex-column gap-3">
              {dashboardData.pendingApprovals.map((req) => (
                <div key={req.id} className="p-3 bg-light border rounded-3">
                  <div className="flex-between mb-1">
                    <span className="fw-semibold text-dark small">{req.visitorName} ({req.company})</span>
                    <Badge variant="warning">{req.type}</Badge>
                  </div>
                  <div className="text-secondary small mb-2">
                    Host: <strong>{req.host}</strong> • Site: {req.site}
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="danger" size="xs" onClick={() => alert(`Rejected ${req.visitorName}`)}>
                      <X size={12} /> Reject
                    </Button>
                    <Button variant="primary" size="xs" onClick={() => alert(`Approved ${req.visitorName}`)}>
                      <Check size={12} /> Approve Pass
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default CorporateDashboardPage;

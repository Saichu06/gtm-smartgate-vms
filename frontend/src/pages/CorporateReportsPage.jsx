/**
 * CorporateReportsPage — SQL Aggregated Analytics & Reporting Module
 * Connected directly to Express REST API report metrics (/api/v1/reports/metrics).
 * Route: /org/:orgId/reports
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Download, Users, UserCheck, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Button from '@components/ui/Button';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';
import { reportApi, visitorApi } from '@services/vmsApi';

const CorporateReportsPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;

  const [period, setPeriod] = useState('30d');
  const [toast, setToast] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportApi.getMetrics(currentOrgId, period);
      if (res.success && res.data) {
        setMetrics(res.data);
      } else {
        setError('Unable to connect to backend');
      }
    } catch (err) {
      console.error('Failed to load report metrics:', err);
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, period]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const exportCsv = async () => {
    try {
      const res = await visitorApi.getVisitors(currentOrgId);
      if (!res.success || !Array.isArray(res.data) || res.data.length === 0) {
        showToast('No visitor data to export', 'warning');
        return;
      }
      const headers = ['Pass ID', 'Name', 'Company', 'Host', 'Site', 'Type', 'Status', 'Check-In'];
      const rows = res.data.map(v => [
        v.passId || v.id, v.name, v.company, v.host || '', v.site || '', v.type || '', v.status || '', v.checkin || '',
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartgate-report-${period}.csv`;
      a.click();
      showToast('CSV report downloaded from PostgreSQL data', 'success');
    } catch (err) {
      showToast('Failed to export report CSV', 'error');
    }
  };

  const summary = metrics?.summary || { totalVisitors: 0, currentlyInside: 0, checkedOut: 0, pending: 0, rejected: 0 };
  const typeDistribution = metrics?.typeDistribution || [];
  const topHosts = metrics?.topHosts || [];
  const siteTraffic = metrics?.siteTraffic || [];

  return (
    <OrganizationLayout title="Reports & Analytics">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="org-page-container space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Live SQL-aggregated visitor statistics and metrics directly from PostgreSQL.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
            <Button onClick={loadMetrics} variant="outline" className="flex items-center gap-2">
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button onClick={exportCsv} className="bg-primary text-white flex items-center gap-2">
              <Download size={16} /> Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
            <AlertTriangle size={20} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Aggregating PostgreSQL metrics...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200 text-blue-900">
                <div className="text-xs uppercase font-semibold text-blue-600">Total Visitors</div>
                <div className="text-2xl font-bold mt-1">{summary.totalVisitors}</div>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200 text-green-900">
                <div className="text-xs uppercase font-semibold text-green-600">Currently Inside</div>
                <div className="text-2xl font-bold mt-1">{summary.currentlyInside}</div>
              </Card>
              <Card className="p-4 bg-slate-50 border-slate-200 text-slate-900">
                <div className="text-xs uppercase font-semibold text-slate-600">Checked Out</div>
                <div className="text-2xl font-bold mt-1">{summary.checkedOut}</div>
              </Card>
              <Card className="p-4 bg-amber-50 border-amber-200 text-amber-900">
                <div className="text-xs uppercase font-semibold text-amber-600">Pending Approval</div>
                <div className="text-2xl font-bold mt-1">{summary.pending}</div>
              </Card>
              <Card className="p-4 bg-red-50 border-red-200 text-red-900">
                <div className="text-xs uppercase font-semibold text-red-600">Rejected</div>
                <div className="text-2xl font-bold mt-1">{summary.rejected}</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" /> Visitor Type Distribution
                </h3>
                {typeDistribution.length === 0 ? (
                  <p className="text-sm text-slate-500">No records found for selected period.</p>
                ) : (
                  <div className="space-y-3">
                    {typeDistribution.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-700 font-medium">{t.type}</span>
                        <span className="font-bold text-slate-900">{t.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Top Hosts
                </h3>
                {topHosts.length === 0 ? (
                  <p className="text-sm text-slate-500">No host records found.</p>
                ) : (
                  <div className="space-y-3">
                    {topHosts.map((h, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-700 font-medium">{h.host}</span>
                        <span className="font-bold text-slate-900">{h.count} visits</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Facility Site Traffic
                </h3>
                {siteTraffic.length === 0 ? (
                  <p className="text-sm text-slate-500">No facility site traffic recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {siteTraffic.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-700 font-medium">{s.site}</span>
                        <span className="font-bold text-slate-900">{s.count} visits</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </OrganizationLayout>
  );
};

export default CorporateReportsPage;

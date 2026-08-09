/**
 * CorporateDashboardPage — Screen 3: Operational Corporate Dashboard
 * Connected to Express REST API & PostgreSQL smartgate schema.
 * Route: /org/:orgId/dashboard
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserCheck, CheckCircle2, Users, MapPin, PlusCircle,
  Eye, Tablet, Tag
} from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import { useOrganizations } from '@contexts/OrganizationContext';
import { visitorApi, employeeApi, gatePassApi, siteApi } from '@services/vmsApi';

const CorporateDashboardPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { activeOrg } = useOrganizations();
  const targetOrgId = orgId || activeOrg?.id || 1;

  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const [vRes, eRes, pRes, sRes] = await Promise.all([
        visitorApi.getVisitors(targetOrgId).catch(() => ({ success: false })),
        employeeApi.getEmployees(targetOrgId).catch(() => ({ success: false })),
        gatePassApi.getGatePasses(targetOrgId).catch(() => ({ success: false })),
        siteApi.getSites(targetOrgId).catch(() => ({ success: false })),
      ]);

      let fetchedVisitors = vRes.success && Array.isArray(vRes.data) ? vRes.data : [];
      if (fetchedVisitors.length === 0) {
        try {
          const local = JSON.parse(localStorage.getItem(`gtm_kiosk_visitors_${targetOrgId}`) || '[]');
          if (Array.isArray(local) && local.length > 0) fetchedVisitors = local;
        } catch (e) {}
      }

      setVisitors(fetchedVisitors);
      if (eRes.success) setEmployees(eRes.data || []);
      if (pRes.success) setGatePasses(pRes.data || []);
      if (sRes.success) setSites(sRes.data || []);
      setError(null);
    } catch (err) {
      console.warn('Dashboard operational metrics fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [targetOrgId]);

  const checkedIn = visitors.filter(v => v.status === 'Checked In').length;
  const checkedOut = visitors.filter(v => v.status === 'Checked Out').length;
  const availablePasses = gatePasses.filter(p => p.status === 'available').length;
  const totalEmployees = employees.length;

  const hostLabel = (h) => (typeof h === 'object' ? h?.name : h) || '—';

  return (
    <OrganizationLayout
      title="Operational Overview"
      subtitle={`Live visitor management system summary • ${activeOrg?.displayName || activeOrg?.name || 'Organization'}`}
    >
      {/* Quick Action Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-0">System Summary</h4>
          <span className="text-secondary small">Real-time status updates powered by PostgreSQL backend</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/kiosk/${targetOrgId}`)}>
            <Tablet size={14} /> Open Kiosk Terminal
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/org/${targetOrgId}/visitors`)}>
            <PlusCircle size={14} /> Visitor Directory
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2 mb-4 small fw-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Currently Inside', value: checkedIn, icon: UserCheck, color: 'var(--color-success)', sub: 'Visitors on-site right now' },
          { label: 'Checked Out Today', value: checkedOut, icon: CheckCircle2, color: 'var(--color-info)', sub: 'Completed visits' },
          { label: 'Available Gate Passes', value: availablePasses, icon: Tag, color: 'var(--color-warning)', sub: `Of ${gatePasses.length} physical passes` },
          { label: 'Active Employees', value: totalEmployees, icon: Users, color: 'var(--color-primary)', sub: 'Registered host staff' },
        ].map((k) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card p-3 bg-white border rounded-3 shadow-sm h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="stat-label small fw-semibold text-secondary">{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <k.icon size={18} style={{ color: k.color }} />
                </div>
              </div>
              <div className="stat-value h3 fw-bold text-dark mb-0">
                {loading ? '...' : k.value}
              </div>
              <div className="stat-subtext text-secondary small mt-1">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Real-Time Visitors Table */}
      <Card
        title="Active Visitor Registrations"
        subtitle="Real-time log of visitors registered via Self-Service Kiosks or Admin entry"
        extra={
          <Button variant="light" size="sm" onClick={() => navigate(`/org/${targetOrgId}/visitors`)}>
            View All Visitors <Eye size={13} />
          </Button>
        }
      >
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pass ID</th>
                <th>Visitor Name</th>
                <th>Company / Coming From</th>
                <th>Host Employee</th>
                <th>Gate Pass</th>
                <th>Site Location</th>
                <th>Check-In Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-secondary">
                    Loading live visitor logs...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-secondary">
                    No active visitor records. Start a new visit using the self-service kiosk.
                  </td>
                </tr>
              ) : (
                visitors.slice(0, 8).map((v) => (
                  <tr key={v.id}>
                    <td><code>{v.passId || v.id}</code></td>
                    <td>
                      <div className="fw-semibold text-dark">{v.name}</div>
                      <div className="text-secondary small">{v.phone}</div>
                    </td>
                    <td>{v.company}</td>
                    <td className="text-secondary small">{hostLabel(v.host)}</td>
                    <td>
                      {v.gatePass ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '2px 8px' }}>
                          <Tag size={10} /> {v.gatePass}
                        </span>
                      ) : <span className="text-secondary small">—</span>}
                    </td>
                    <td className="text-secondary small">{v.site || 'Gate A Main Kiosk'}</td>
                    <td className="small">{v.checkin || '—'}</td>
                    <td>
                      <Badge variant={v.status === 'Checked In' ? 'success' : 'neutral'}>
                        {v.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </OrganizationLayout>
  );
};

export default CorporateDashboardPage;

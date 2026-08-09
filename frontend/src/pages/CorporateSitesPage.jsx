/**
 * CorporateSitesPage — Sites & Gate Terminals Module
 * Strictly bound to Express REST API / PostgreSQL (smartgate.sites).
 * Route: /org/:orgId/sites
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, PlusCircle, Wifi, ExternalLink, AlertTriangle } from 'lucide-react';
import OrganizationLayout from '@layouts/OrganizationLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Drawer from '@components/navigation/Drawer';
import Input from '@components/forms/Input';
import Toast from '@components/feedback/Toast';
import { useOrganizations } from '@contexts/OrganizationContext';
import { siteApi } from '@services/vmsApi';

const CorporateSitesPage = () => {
  const { activeOrg } = useOrganizations();
  const { orgId } = useParams();
  const currentOrgId = orgId || activeOrg?.id || 1;
  const primary = activeOrg?.primaryColor || '#1565C0';

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', location: '', city: '', state: '' });

  const loadSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await siteApi.getSites(currentOrgId);
      if (res.success && Array.isArray(res.data)) {
        setSites(res.data);
      } else {
        setError('Unable to connect to backend');
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleAddSite = async () => {
    if (!form.name.trim()) return;
    try {
      const res = await siteApi.createSite({
        name: form.name,
        code: form.code || form.name.toUpperCase().replace(/\s+/g, '-').slice(0, 10),
        address: form.location,
        city: form.city || activeOrg?.city || 'Bengaluru',
        state: form.state || activeOrg?.state || 'Karnataka',
        companyId: currentOrgId,
      });
      if (res.success) {
        showToast(`Site "${form.name}" configured and live in PostgreSQL!`, 'success');
        setAddOpen(false);
        setForm({ name: '', code: '', location: '', city: '', state: '' });
        await loadSites();
      }
    } catch (err) {
      showToast('Failed to create site on backend', 'error');
    }
  };

  return (
    <OrganizationLayout title="Sites & Gate Terminals">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="org-page-container space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sites & Facilities</h1>
            <p className="text-sm text-slate-500 mt-1">
              Active facility gates and self-service kiosks managed in PostgreSQL.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-primary text-white flex items-center gap-2">
            <PlusCircle size={18} /> Add Site
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
            <AlertTriangle size={20} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading sites from PostgreSQL...</div>
        ) : sites.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            No sites registered yet. Click "Add Site" to configure your first facility.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <Card key={site.id} className="p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{site.name}</h3>
                      <p className="text-xs text-slate-500">Code: {site.code}</p>
                    </div>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>

                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-slate-900">{site.city ? `${site.city}, ${site.state || ''}` : 'HQ'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Kiosk URL:</span>
                    <a
                      href={`/kiosk/${currentOrgId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 flex items-center gap-1 hover:underline font-mono"
                    >
                      /kiosk/{currentOrgId} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Drawer isOpen={addOpen} onClose={() => setAddOpen(false)} title="Configure New Site">
        <div className="space-y-4 p-4">
          <Input label="Site Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Entrance Gate 1" />
          <Input label="Site Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SC-MAIN" />
          <Input label="Address" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. 56 Nehru Nagar" />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Chennai" />
          <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Tamil Nadu" />
          <Button onClick={handleAddSite} className="w-full bg-primary text-white mt-4">Save Site to PostgreSQL</Button>
        </div>
      </Drawer>
    </OrganizationLayout>
  );
};

export default CorporateSitesPage;

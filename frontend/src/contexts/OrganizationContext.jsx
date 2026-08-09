/**
 * OrganizationContext — Authoritative React Context for multi-tenant Organization state & active tenant switcher.
 * Connected strictly to PostgreSQL backend via companyApi & userApi.
 * Zero business-data localStorage fallback.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyApi, userApi } from '@services/vmsApi';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch companies from PostgreSQL REST API on load
  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await companyApi.getCompanies();
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.map((c) => ({
          id: c.id,
          internalId: c.internalId || c.id,
          name: c.name || 'Unnamed Organization',
          displayName: c.displayName || c.name || 'Unnamed Organization',
          code: c.code || 'ORG',
          industry: c.compType || 'Enterprise',
          status: 'Active',
          lifecycle: 'Active',
          plan: 'Enterprise',
          created: c.created || new Date().toISOString(),
          corporateAdmin: c.contact_person || c.email || 'Admin',
          corporateAdminStatus: 'Active',
          corporateAdminEmail: c.email || 'support@gtm.com',
          corporateAdminPhone: c.phone || '',
          sites: c.sites_count ? parseInt(c.sites_count, 10) : 1,
          employees: c.employees_count ? parseInt(c.employees_count, 10) : 10,
          primaryColor: c.primaryColor || '#1565C0',
          secondaryColor: c.secondaryColor || '#0D47A1',
          accentColor: c.accentColor || '#FFD700',
          address: c.address1 || 'HQ Campus',
          city: c.city || 'Bengaluru',
          state: c.state || 'Karnataka',
          postalCode: c.pincode || '560001',
          logo: c.logo || null,
          welcomeMessage: c.welcomeMessage || 'Welcome',
        }));
        setOrganizations(normalized);
        if (normalized.length > 0 && !activeOrgId) {
          setActiveOrgId(normalized[0].id);
        }
      } else {
        setError('Unable to connect to backend');
      }
    } catch (err) {
      console.error('Backend API company lookup error:', err);
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const activeOrg = organizations.find((o) => String(o.id) === String(activeOrgId) || String(o.internalId) === String(activeOrgId)) || organizations[0] || null;

  // Apply theme CSS variables when activeOrg changes
  useEffect(() => {
    if (activeOrg) {
      const p = activeOrg.primaryColor || '#1565C0';
      const s = activeOrg.secondaryColor || '#0D47A1';
      const a = activeOrg.accentColor || '#FFD700';

      document.documentElement.style.setProperty('--org-primary', p);
      document.documentElement.style.setProperty('--org-secondary', s);
      document.documentElement.style.setProperty('--org-accent', a);
      document.documentElement.style.setProperty('--kiosk-primary', p);
      document.documentElement.style.setProperty('--kiosk-secondary', s);
    }
  }, [activeOrg]);

  const switchOrganization = (orgId) => {
    if (orgId) {
      setActiveOrgId(orgId);
    }
  };

  /** Update branding & sync to PostgreSQL */
  const updateOrganizationBranding = async (orgId, brandingData) => {
    const targetPublicId = activeOrg?.id || orgId;
    const res = await companyApi.updateCompany(targetPublicId, brandingData);
    if (res.success) {
      await loadOrganizations();
    } else {
      throw new Error('Failed to update organization branding');
    }
  };

  const addOrganization = async (newOrgData) => {
    const res = await companyApi.createCompany({
      code: newOrgData.code,
      name: newOrgData.name,
      email: newOrgData.supportEmail,
      phone: newOrgData.supportPhone,
      address: newOrgData.address,
      city: newOrgData.city,
      state: newOrgData.state,
      pincode: parseInt(newOrgData.postalCode || '0', 10),
    });
    if (res.success && res.data) {
      await loadOrganizations();
      setActiveOrgId(res.data.id);
      return res.data;
    }
    throw new Error('Failed to create company');
  };

  const updateOrganizationAdmin = async (orgPublicId, adminData) => {
    const res = await userApi.create({
      name: `${adminData.firstName} ${adminData.lastName}`,
      email: adminData.email,
      phone: adminData.phone,
      roleCode: 'CORP_ADMIN',
      password: adminData.tempPassword || 'GtmSmartGate@2026',
      companyId: orgPublicId,
    });
    if (res.success) {
      await loadOrganizations();
      return res.data;
    }
    throw new Error('Failed to provision administrator in PostgreSQL');
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrg,
        activeOrgId,
        loading,
        error,
        refreshOrganizations: loadOrganizations,
        switchOrganization,
        addOrganization,
        updateOrganizationBranding,
        updateOrganizationAdmin,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizations = () => {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganizations must be used within an OrganizationProvider');
  return context;
};

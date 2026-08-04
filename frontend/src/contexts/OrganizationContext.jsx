/**
 * OrganizationContext — React Context for multi-tenant Organization state & active tenant switcher.
 * Persists organization state, custom branding, and first-login password status to localStorage.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import initialOrgsData from '@mock/organizations.json';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
  // Load initial orgs data from localStorage if present, else fallback to JSON mock
  const [organizations, setOrganizations] = useState(() => {
    try {
      const saved = localStorage.getItem('gtm_organizations');
      return saved ? JSON.parse(saved) : initialOrgsData;
    } catch {
      return initialOrgsData;
    }
  });

  const [activeOrgId, setActiveOrgId] = useState(1);

  // Sync organizations state to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('gtm_organizations', JSON.stringify(organizations));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [organizations]);

  const activeOrg = organizations.find((o) => o.id === parseInt(activeOrgId, 10)) || organizations[0];

  const switchOrganization = (orgId) => {
    if (orgId) {
      setActiveOrgId(parseInt(orgId, 10));
    }
  };

  /** Update branding model & apply global CSS variables */
  const updateOrganizationBranding = (orgId, brandingData) => {
    setOrganizations((prev) =>
      prev.map((o) => {
        if (o.id === parseInt(orgId, 10)) {
          const updated = {
            ...o,
            ...brandingData,
            branding: {
              ...(o.branding || {}),
              ...(brandingData.branding || {}),
              logo: brandingData.logo || o.logo,
              gtmLogo: brandingData.gtmLogo || o.gtmLogo,
              primaryColor: brandingData.primaryColor || o.primaryColor,
              secondaryColor: brandingData.secondaryColor || o.secondaryColor,
              accentColor: brandingData.accentColor || o.accentColor,
              displayName: brandingData.displayName || o.displayName,
              welcomeTitle: brandingData.welcomeTitle || o.welcomeTitle,
              welcomeSubtitle: brandingData.welcomeSubtitle || o.welcomeSubtitle,
              kioskBackground: brandingData.kioskBackground || o.kioskBackground,
              watermark: brandingData.watermark || o.watermark,
              updatedAt: new Date().toISOString(),
            }
          };

          // Apply CSS custom properties globally
          const p = updated.primaryColor || '#1565C0';
          const s = updated.secondaryColor || '#0D47A1';
          const a = updated.accentColor || '#FFD700';

          document.documentElement.style.setProperty('--org-primary', p);
          document.documentElement.style.setProperty('--org-secondary', s);
          document.documentElement.style.setProperty('--org-accent', a);
          document.documentElement.style.setProperty('--kiosk-primary', p);
          document.documentElement.style.setProperty('--kiosk-secondary', s);

          return updated;
        }
        return o;
      })
    );
  };

  const addOrganization = (newOrgData) => {
    const newId = Date.now();
    const newOrg = {
      id: newId,
      name: newOrgData.name || 'New Organization',
      displayName: newOrgData.displayName || newOrgData.name || 'New Org',
      code: newOrgData.code || `ORG-${newId.toString().slice(-4)}`,
      industry: newOrgData.industry || 'Technology',
      description: newOrgData.description || '',
      website: newOrgData.website || '',
      gstNumber: newOrgData.gstNumber || '',
      supportEmail: newOrgData.supportEmail || `${(newOrgData.subdomain || 'org').toLowerCase()}@smartgate.gtm.com`,
      supportPhone: newOrgData.supportPhone || '+91 44 0000 0000',
      country: newOrgData.country || 'India',
      state: newOrgData.state || '',
      city: newOrgData.city || '',
      address: newOrgData.address || '',
      postalCode: newOrgData.postalCode || '',
      timezone: newOrgData.timezone || 'Asia/Kolkata',
      currency: newOrgData.currency || 'INR',
      logo: null,
      primaryColor: newOrgData.primaryColor || '#1565C0',
      secondaryColor: newOrgData.secondaryColor || '#0D47A1',
      loginTagline: 'Secure. Smart. Seamless.',
      isFirstLoginDone: false,
      subdomain: (newOrgData.subdomain || 'org').toLowerCase(),
      portalUrl: `${(newOrgData.subdomain || 'org').toLowerCase()}.smartgate.gtm.com`,
      corporateAdmin: 'Pending Setup',
      corporateAdminEmail: newOrgData.supportEmail || '',
      corporateAdminPhone: newOrgData.supportPhone || '',
      corporateAdminStatus: 'Pending',
      plan: newOrgData.plan || 'Enterprise',
      licenseCount: parseInt(newOrgData.licenseCount, 10) || 100,
      licenseUsed: 0,
      storageLimit: newOrgData.storageLimit || '500 GB',
      storageUsed: '0 GB',
      visitorCapacity: parseInt(newOrgData.visitorCapacity, 10) || 10000,
      smsCredits: parseInt(newOrgData.smsCredits, 10) || 5000,
      emailCredits: parseInt(newOrgData.emailCredits, 10) || 10000,
      subscriptionStart: newOrgData.startDate || new Date().toISOString().split('T')[0],
      subscriptionExpiry: newOrgData.expiryDate || '2027-08-01',
      isTrial: newOrgData.plan === 'Trial',
      sites: 1, employees: 0, users: 0, visitorsToday: 0, totalVisitors: 0,
      lifecycle: 'Created',
      status: newOrgData.plan === 'Trial' ? 'Trial' : 'Active',
      created: new Date().toISOString().split('T')[0],
      lastActivity: 'Just now',
      recentActivity: [
        { id: 1, action: 'Organization Provisioned', actor: 'Super Admin', target: 'System Onboarding', time: 'Just now', type: 'success' }
      ]
    };
    setOrganizations((prev) => [newOrg, ...prev]);
    setActiveOrgId(newId);
    return newOrg;
  };

  const updateOrganizationAdmin = (orgId, adminData) => {
    setOrganizations((prev) =>
      prev.map((o) => {
        if (o.id === parseInt(orgId, 10)) {
          return {
            ...o,
            corporateAdmin: `${adminData.firstName} ${adminData.lastName}`.trim(),
            corporateAdminEmail: adminData.email,
            corporateAdminPhone: adminData.phone,
            ...(adminData.avatar !== undefined && { corporateAdminAvatar: adminData.avatar }),
            corporateAdminStatus: 'Active',
            lifecycle: 'Corporate Admin Assigned',
            recentActivity: [
              { id: Date.now(), action: 'Corporate Admin Details Updated', actor: `${adminData.firstName} ${adminData.lastName}`.trim(), target: adminData.email, time: 'Just now', type: 'primary' },
              ...o.recentActivity
            ]
          };
        }
        return o;
      })
    );
  };

  const updateOrganizationStatus = (orgId, status) => {
    setOrganizations((prev) =>
      prev.map((o) => {
        if (o.id === parseInt(orgId, 10)) {
          return { ...o, status, lifecycle: status === 'Suspended' ? 'Suspended' : 'Operational' };
        }
        return o;
      })
    );
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrg,
        activeOrgId,
        switchOrganization,
        addOrganization,
        updateOrganizationAdmin,
        updateOrganizationStatus,
        updateOrganizationBranding,
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

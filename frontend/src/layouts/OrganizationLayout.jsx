/**
 * OrganizationLayout — Layout wrapper for the Corporate Organization Portal.
 *
 * KEY BEHAVIOURS:
 * - Injects --org-primary / --org-secondary CSS custom properties from activeOrg branding
 *   so the entire portal (sidebar active state, buttons, etc.) uses the org's colors
 * - Sets document.title to "{OrgName} — Smart Gate Portal" for correct browser tab
 * - Reads the org ONLY from OrganizationContext (never from URL directly)
 * - Does NOT show the org switcher — each org's portal is isolated
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CorporateSidebar from '@components/layout/CorporateSidebar';
import OrgPortalHeader from '@components/layout/OrgPortalHeader';
import PageHeader from '@components/layout/PageHeader';
import Footer from '@components/layout/Footer';
import { useOrganizations } from '@contexts/OrganizationContext';

const OrganizationLayout = ({ children, title, subtitle, breadcrumbs, actions }) => {
  const { activeOrg, organizations, switchOrganization } = useOrganizations();
  const { orgId } = useParams();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync activeOrg with URL param orgId if available
  useEffect(() => {
    if (orgId && switchOrganization && Array.isArray(organizations) && organizations.length > 0) {
      const match = organizations.find(
        (o) => String(o.id) === String(orgId) || String(o.internalId) === String(orgId)
      );
      if (match && String(activeOrg?.id) !== String(match.id)) {
        switchOrganization(match.id);
      }
    }
  }, [orgId, organizations, activeOrg?.id, switchOrganization]);

  const currentOrg = activeOrg || (organizations && organizations.length > 0 ? organizations[0] : null);
  const primary   = currentOrg?.primaryColor   || '#1565C0';
  const secondary = currentOrg?.secondaryColor || '#0D47A1';
  const orgName   = currentOrg?.displayName    || currentOrg?.name || 'Organization';

  // Set browser tab title to the org's name
  useEffect(() => {
    const prev = document.title;
    document.title = `${orgName} — Smart Gate Portal`;
    return () => { document.title = prev; };
  }, [orgName]);

  // Inject org CSS variables at the layout root so all children inherit them
  const orgStyle = {
    '--org-primary':         primary,
    '--org-secondary':       secondary,
    '--org-primary-subtle':  `${primary}14`,
    '--org-primary-hover':   `${primary}cc`,
    // Override the global color-primary with org primary inside this layout
    '--color-primary':        primary,
    '--color-primary-subtle': `${primary}14`,
  };

  return (
    <div className="app-shell org-portal" style={orgStyle}>
      {/* Backdrop overlay for mobile offcanvas sidebar */}
      <div 
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <CorporateSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onCloseMobile={() => setIsMobileSidebarOpen(false)} 
      />

      <div className="main-area">
        <OrgPortalHeader 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
        />
        <PageHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs || [`${activeOrg?.code || 'ORG'} Portal`, title]}
          actions={actions}
        />
        <main className="page-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default OrganizationLayout;

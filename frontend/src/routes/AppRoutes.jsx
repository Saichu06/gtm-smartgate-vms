/**
 * Central Route Configuration & Router setup wrapped in OrganizationProvider.
 * Includes GTM Super Admin routes and Organization Portal routes (/org/:orgId/*).
 * All org portal routes use the OrgUrlSyncWrapper to sync activeOrg from the URL.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { OrganizationProvider, useOrganizations } from '@contexts/OrganizationContext';

// ── Super Admin Portal ─────────────────────────────────────────────────────
import LoginPage from '@pages/LoginPage';
import DashboardPage from '@pages/DashboardPage';
import OrganizationsPage from '@pages/CustomersPage';
import CreateOrganizationWizard from '@pages/CreateCustomerPage';
import CustomerDetailsPage from '@pages/CustomerDetailsPage';
import CreateCorporateAdminPage from '@pages/CreateCorporateAdminPage';
import SubscriptionsPage from '@pages/SubscriptionsPage';
import PlatformUsersPage from '@pages/PlatformUsersPage';
import RolesPage from '@pages/RolesPage';
import AuditLogsPage from '@pages/AuditLogsPage';
import SettingsPage from '@pages/SettingsPage';

// ── Organization Portal — Phase 1 ─────────────────────────────────────────
import CorporateLoginPage from '@pages/CorporateLoginPage';
import FirstLoginPasswordPage from '@pages/FirstLoginPasswordPage';
import CorporateDashboardPage from '@pages/CorporateDashboardPage';
import CorporateUsersPage from '@pages/CorporateUsersPage';
import CreateUserWizardPage from '@pages/CreateUserWizardPage';
import CorporateUserDetailsPage from '@pages/CorporateUserDetailsPage';

// ── Organization Portal — Phase 2 ─────────────────────────────────────────
import CorporateVisitorsPage from '@pages/CorporateVisitorsPage';
import CorporateApprovalsPage from '@pages/CorporateApprovalsPage';
import CorporateEmployeesPage from '@pages/CorporateEmployeesPage';
import CorporateSitesPage from '@pages/CorporateSitesPage';
import CorporateVisitorTypesPage from '@pages/CorporateVisitorTypesPage';
import CorporateReportsPage from '@pages/CorporateReportsPage';
import CorporatePortalSettingsPage from '@pages/CorporatePortalSettingsPage';

/**
 * OrgUrlSyncWrapper — reads :orgId from the URL and syncs the activeOrg in
 * OrganizationContext so that every nested page renders the correct tenant.
 */
const OrgUrlSyncWrapper = ({ children }) => {
  const { orgId } = useParams();
  const { switchOrganization } = useOrganizations();

  React.useEffect(() => {
    if (orgId) {
      switchOrganization(orgId);
    }
  }, [orgId, switchOrganization]);

  return children;
};

/**
 * Helper to build an org-scoped route with the sync wrapper.
 * All org portal pages MUST be wrapped so that direct URL access
 * (e.g. localhost:3000/org/2/dashboard) correctly activates the right org.
 */
const OrgRoute = ({ element }) => (
  <OrgUrlSyncWrapper>{element}</OrgUrlSyncWrapper>
);

const AppRoutes = () => {
  return (
    <OrganizationProvider>
      <BrowserRouter>
        <Routes>
          {/* ── GTM Super Admin Portal ─────────────────────────────────── */}
          <Route path="/login"                      element={<LoginPage />} />
          <Route path="/dashboard"                  element={<DashboardPage />} />
          <Route path="/customers"                  element={<OrganizationsPage />} />
          <Route path="/customers/new"              element={<CreateOrganizationWizard />} />
          <Route path="/customers/create"           element={<CreateOrganizationWizard />} />
          <Route path="/customers/:id"              element={<CustomerDetailsPage />} />
          <Route path="/customers/:id/create-admin" element={<CreateCorporateAdminPage />} />
          <Route path="/subscriptions"              element={<SubscriptionsPage />} />
          <Route path="/platform-users"             element={<PlatformUsersPage />} />
          <Route path="/roles"                      element={<RolesPage />} />
          <Route path="/audit-logs"                 element={<AuditLogsPage />} />
          <Route path="/settings"                   element={<SettingsPage />} />

          {/* ── Organization Portal — /org/:orgId/* ───────────────────── */}
          {/* Login & Auth */}
          <Route path="/org/:orgId/login"           element={<OrgRoute element={<CorporateLoginPage />} />} />
          <Route path="/org/:orgId/first-login"     element={<OrgRoute element={<FirstLoginPasswordPage />} />} />

          {/* Dashboard */}
          <Route path="/org/:orgId/dashboard"       element={<OrgRoute element={<CorporateDashboardPage />} />} />

          {/* Gate Operations */}
          <Route path="/org/:orgId/visitors"        element={<OrgRoute element={<CorporateVisitorsPage />} />} />
          <Route path="/org/:orgId/approvals"       element={<OrgRoute element={<CorporateApprovalsPage />} />} />

          {/* Access Control */}
          <Route path="/org/:orgId/users"           element={<OrgRoute element={<CorporateUsersPage />} />} />
          <Route path="/org/:orgId/users/new"       element={<OrgRoute element={<CreateUserWizardPage />} />} />
          <Route path="/org/:orgId/users/:id"       element={<OrgRoute element={<CorporateUserDetailsPage />} />} />
          <Route path="/org/:orgId/employees"       element={<OrgRoute element={<CorporateEmployeesPage />} />} />
          <Route path="/org/:orgId/sites"           element={<OrgRoute element={<CorporateSitesPage />} />} />
          <Route path="/org/:orgId/visitor-types"   element={<OrgRoute element={<CorporateVisitorTypesPage />} />} />

          {/* Analytics & System */}
          <Route path="/org/:orgId/reports"         element={<OrgRoute element={<CorporateReportsPage />} />} />
          <Route path="/org/:orgId/settings"        element={<OrgRoute element={<CorporatePortalSettingsPage />} />} />

          {/* ── Catch-all redirects ────────────────────────────────────── */}
          <Route path="/org/:orgId"                 element={<OrgRoute element={<Navigate to="dashboard" replace />} />} />
          <Route path="/org"                        element={<Navigate to="/login" replace />} />
          <Route path="/"                           element={<Navigate to="/login" replace />} />
          <Route path="*"                           element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </OrganizationProvider>
  );
};

export default AppRoutes;

/**
 * Central Route Configuration & Router setup.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '@pages/LoginPage';
import DashboardPage from '@pages/DashboardPage';
import CustomersPage from '@pages/CustomersPage';
import CreateCustomerPage from '@pages/CreateCustomerPage';
import CustomerDetailsPage from '@pages/CustomerDetailsPage';
import SubscriptionsPage from '@pages/SubscriptionsPage';
import PlatformUsersPage from '@pages/PlatformUsersPage';
import RolesPage from '@pages/RolesPage';
import AuditLogsPage from '@pages/AuditLogsPage';
import SettingsPage from '@pages/SettingsPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/create" element={<CreateCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/platform-users" element={<PlatformUsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

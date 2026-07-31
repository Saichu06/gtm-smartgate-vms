/**
 * AppLayout Component
 * Primary layout wrapper for authenticated platform views.
 */
import React from 'react';
import Sidebar from '@components/layout/Sidebar';
import TopNavbar from '@components/layout/TopNavbar';
import PageHeader from '@components/layout/PageHeader';
import Footer from '@components/layout/Footer';

const AppLayout = ({ children, title, subtitle, breadcrumbs, actions }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopNavbar />
        <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs || [title]} actions={actions} />
        <main className="page-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;

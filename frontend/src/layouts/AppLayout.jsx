/**
 * AppLayout Component
 * Primary layout wrapper for authenticated platform views.
 */
import React, { useState } from 'react';
import Sidebar from '@components/layout/Sidebar';
import TopNavbar from '@components/layout/TopNavbar';
import PageHeader from '@components/layout/PageHeader';
import Footer from '@components/layout/Footer';

const AppLayout = ({ children, title, subtitle, breadcrumbs, actions }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Backdrop overlay for mobile offcanvas sidebar */}
      <div 
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onCloseMobile={() => setIsMobileSidebarOpen(false)} 
      />

      <div className="main-area">
        <TopNavbar 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
        />
        <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs || [title]} actions={actions} />
        <main className="page-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;

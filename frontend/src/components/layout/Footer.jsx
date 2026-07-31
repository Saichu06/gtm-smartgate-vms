/**
 * Footer Component
 * Enterprise page footer with version and copyright info.
 */
import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '16px 24px',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-tertiary)'
    }}>
      <div>© 2026 GTM Solutions Inc. All rights reserved.</div>
      <div>GTM Smart Gate Platform • Version 2.4.0-enterprise</div>
    </footer>
  );
};

export default Footer;

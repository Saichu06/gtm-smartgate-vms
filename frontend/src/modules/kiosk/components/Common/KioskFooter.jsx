/**
 * KioskFooter — Help info + "Powered by GTM Smart Gate" branding.
 */
import React from 'react';
import { HelpCircle, Zap, Phone, Mail } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';
import '../../styles/kiosk.css';

const KioskFooter = () => {
  const { org } = useVisitor();
  const email   = org?.supportEmail || 'support@gtmsmartgate.com';
  const phone   = org?.supportPhone || '+91 1800-000-0000';

  return (
    <footer className="kiosk-footer">
      <div>
        <div className="kiosk-footer-help-title">
          <HelpCircle size={16} />
          Need Help? Contact Security Desk
        </div>
        <div className="kiosk-footer-help-sub" style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11} /> {phone}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={11} /> {email}</span>
        </div>
      </div>
      <div className="kiosk-footer-powered">
        <Zap size={13} />
        Powered by <strong>GTM Smart Gate</strong>
      </div>
    </footer>
  );
};

export default KioskFooter;

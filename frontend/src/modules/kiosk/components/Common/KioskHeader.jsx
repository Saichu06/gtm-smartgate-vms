/**
 * KioskHeader — Displays org logo/branding + live ticking clock at top of every kiosk screen.
 * Robust logo error boundaries prevent broken image icons.
 */
import React, { useState, useEffect } from 'react';
import { Zap, Building2 } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';
import '../../styles/kiosk.css';

const KioskHeader = () => {
  const { org } = useVisitor();
  const [time, setTime] = useState(new Date());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0D47A1';
  const orgName   = org?.displayName    || org?.name || 'GTM Smart Gate';
  const logo      = org?.logo || org?.logoLight;

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="kiosk-header">
      <div className="kiosk-header-brand">
        <div
          className="kiosk-header-logo"
          style={{
            background: logo && !imgError ? '#FFFFFF' : `linear-gradient(135deg, ${primary}, ${secondary})`,
            border: logo && !imgError ? `2px solid ${primary}30` : 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            padding: 4,
          }}
        >
          {logo && !imgError ? (
            <img
              src={logo}
              alt={orgName}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
              <Building2 size={26} />
            </div>
          )}
        </div>
        <div>
          <div className="kiosk-header-org">{orgName}</div>
          <div className="kiosk-header-powered">
            <Zap size={11} style={{ color: primary }} />
            Powered by <strong>GTM Smart Gate</strong>
          </div>
        </div>
      </div>

      <div className="kiosk-header-right">
        <div className="kiosk-header-time">{timeStr}</div>
        <div className="kiosk-header-date">{dateStr}</div>
      </div>
    </header>
  );
};

export default KioskHeader;

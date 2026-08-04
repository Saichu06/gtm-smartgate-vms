/**
 * WelcomePage — Screen 1. Full-screen landing with dynamic org title, subtitle & background.
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fingerprint, ArrowRight, Shield, Users, Clock } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';
import gtmLogo from '../../../assets/icons/logo.png';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, resetFlow } = useVisitor();

  const primary = org?.primaryColor || '#1565C0';
  const secondary = org?.secondaryColor || '#0D47A1';
  const orgName = org?.displayName || org?.name || 'GTM Smart Gate';
  const title = org?.welcomeTitle || `Welcome to ${orgName}`;
  const subtitle = org?.welcomeSubtitle || 'Register as a visitor and receive your digital access pass in under 2 minutes.';
  const bgStyle = org?.kioskBackground || `linear-gradient(160deg, #F8FAFC 0%, ${primary}0F 100%)`;

  const handleStart = () => {
    resetFlow();
    navigate(`/kiosk/${orgId}/mobile`);
  };

  const features = [
    { icon: Shield, label: 'Secure Entry', sub: 'ID Verified Badge' },
    { icon: Users, label: 'Fast Process', sub: 'Under 2 Minutes' },
    { icon: Clock, label: 'Smart Access', sub: 'Digital Pass QR' },
  ];

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <KioskHeader />

      <div className="kiosk-page" style={{ background: bgStyle }}>
        <div className="kiosk-welcome">

          {/* Floating Illustration */}
          {/* Brand Logos */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '48px',
              marginBottom: '36px',
            }}
          >
            {/* Organization Logo */}
            <img
              src={org?.logoUrl || org?.logo}
              alt={orgName}
              style={{
                height: '90px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />

            {/* Divider */}
            <div
              style={{
                width: '2px',
                height: '72px',
                background: '#E2E8F0',
                borderRadius: '999px',
              }}
            />

            {/* GTM SmartGate Logo */}
            <img
              src={gtmLogo}
              alt="GTM SmartGate"
              style={{
                height: '90px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Welcome Text */}
          <div className="kiosk-welcome-text">
            <h1 style={{ fontSize: 44, fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: '0 0 12px' }}>
              {title}
            </h1>
            <p style={{ fontSize: 18, color: '#64748B', margin: '0 auto', maxWidth: 540, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          </div>

          {/* Feature Chips */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {features.map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#FFFFFF', border: '1px solid #E5E7EB',
                borderRadius: 16, padding: '14px 22px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                minWidth: 160,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${primary}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: primary, flexShrink: 0,
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div>
            <button
              className="kiosk-btn kiosk-btn-primary kiosk-btn-lg"
              onClick={handleStart}
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                color: '#FFFFFF',
                boxShadow: `0 10px 32px ${primary}40`,
                fontSize: 22,
                padding: '0 56px',
                minHeight: 72,
                borderRadius: 20,
              }}
            >
              Start Registration <ArrowRight size={26} style={{ color: '#FFFFFF' }} />
            </button>
            <p style={{ marginTop: 16, fontSize: 13, color: '#94A3B8', textAlign: 'center', fontWeight: 500 }}>
              Tap to begin · Touch-enabled self-service kiosk
            </p>
          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default WelcomePage;

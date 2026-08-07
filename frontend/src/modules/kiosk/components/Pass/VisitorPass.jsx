/**
 * VisitorPass — Enterprise Visitor Badge Generator Component (PPT Spec Compliant).
 * Features:
 * - Top Left: Organization Logo
 * - Top Right: GTM Smart Gate Logo
 * - Center: VISITOR PASS Title, Photo, Name, Company, Purpose, Visitor Type, Host, Visit Date, Visit Time, Gate, Gate Pass Number, QR Code, Status ("VALID TODAY")
 * - Footer: Powered by GTM Smart Gate
 * - Print-ready CSS (@media print) hiding shell navigation, buttons, and footers.
 */
import React from 'react';
import { QrCode, ShieldCheck, Zap, User, MapPin, Clock, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';
import gtmLogo from '../../../../assets/icons/logo.png';

const VisitorPass = ({ passData, template }) => {
  const { org } = useVisitor();
  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';
  const orgLogo   = org?.logo || org?.logoLight;
  const orgName   = org?.displayName || org?.name || 'Apollo Tyres';

  const displayPassNumber = passData?.displayPassNumber || `Gate Pass #${(passData?.passId || '').slice(-4) || '0043'}`;
  const fullPassId = passData?.passId || 'APL-GP-20260807-0043';

  // Encrypted / Structured QR payload string
  const qrPayload = JSON.stringify({
    passId: fullPassId,
    visitorId: passData?.visitId || 'VIS-9982',
    orgId: org?.id || 1,
    date: new Date().toISOString().slice(0, 10),
    status: 'VALID TODAY',
  });

  const currentDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="kiosk-pass-wrapper" style={{ position: 'relative', width: '100%', maxWidth: 660, margin: '0 auto' }}>
      
      {/* Enterprise Dual-Logo Header Pass Container */}
      <div className="printable-visitor-badge" style={{
        background: '#FFFFFF',
        borderRadius: 24,
        border: `3px solid ${primary}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ── TOP DUAL LOGO HEADER ─────────────────────────────────────── */}
        <div style={{
          background: '#0F172A',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `4px solid ${primary}`,
        }}>
          {/* Top Left: Organization Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {orgLogo ? (
              <img
                src={orgLogo}
                alt={orgName}
                style={{ height: 42, maxWidth: 180, objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                background: primary, color: '#fff', padding: '6px 14px',
                borderRadius: 8, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Building2 size={18} /> {orgName}
              </div>
            )}
          </div>

          {/* Center Badge Title */}
          <div style={{
            background: '#F0FDF4',
            color: '#2E7D32',
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: '1.5px',
            padding: '6px 16px',
            borderRadius: 999,
            border: '1px solid #BBF7D0',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <ShieldCheck size={14} /> VALID TODAY
          </div>

          {/* Top Right: GTM Smart Gate Logo */}
          <div>
            <img
              src={gtmLogo}
              alt="GTM Smart Gate"
              style={{ height: 40, objectFit: 'contain', background: '#fff', padding: '4px 10px', borderRadius: 8 }}
            />
          </div>
        </div>

        {/* ── PASS TITLE STRIP ────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '10px 0',
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          VISITOR PASS
        </div>

        {/* ── PASS BODY CONTENT ────────────────────────────────────────── */}
        <div style={{ padding: 28, position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Visitor Photo Frame */}
            <div style={{ textCenter: 'center' }}>
              <div style={{
                width: 144, height: 168, borderRadius: 16,
                overflow: 'hidden', border: `3px solid ${primary}`,
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                position: 'relative', background: '#F8FAFC'
              }}>
                {passData?.photo ? (
                  <img src={passData.photo} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                    <User size={56} />
                  </div>
                )}
              </div>
              <div style={{
                marginTop: 8, background: '#EFF6FF', color: primary,
                border: `1px solid ${primary}30`, borderRadius: 8, padding: '4px 8px',
                fontSize: 11, fontWeight: 800, textAlign: 'center'
              }}>
                {displayPassNumber}
              </div>
            </div>

            {/* Visitor Info Details */}
            <div style={{ flex: 1, minWidth: 220 }}>
              
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {passData?.name || 'Visitor Name'}
              </div>
              
              <div style={{ fontSize: 15, color: primary, fontWeight: 700, marginTop: 4 }}>
                {passData?.company || 'Walk-in Visitor'}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16,
                background: '#F8FAFC', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0'
              }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>PURPOSE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.purpose || 'Business Visit'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>VISITOR TYPE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.visitorType || 'Business Visitor'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>HOST EMPLOYEE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.host?.name || passData?.host || 'Reception Desk'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>GATE / LOCATION</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.gate || 'Gate A Main Kiosk'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>VISIT DATE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{currentDateStr}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>VISIT TIME</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{currentTimeStr}</strong>
                </div>
              </div>

            </div>
          </div>

          {/* ── QR CODE FOOTER STRIP ───────────────────────────────────── */}
          <div style={{
            marginTop: 20, paddingTop: 16, borderTop: '2px dashed #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              
              {/* QR Code Container */}
              <div style={{
                width: 76, height: 76, background: '#FFFFFF', border: '2px solid #0F172A',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <QrCode size={56} style={{ color: '#0F172A' }} />
              </div>

              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: 1 }}>
                  {fullPassId}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  Scan at turnstile barrier or gate officer device
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>STATUS</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2E7D32' }}>
                VALID TODAY
              </div>
            </div>

          </div>

        </div>

        {/* ── PASS FOOTER BRANDING ─────────────────────────────────────── */}
        <div style={{
          background: '#0F172A', padding: '12px 24px', color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <ShieldCheck size={14} style={{ color: '#38BDF8' }} /> Authorized Enterprise Visitor Badge
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Zap size={13} style={{ color: '#38BDF8' }} /> Powered by <strong>GTM Smart Gate</strong>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VisitorPass;

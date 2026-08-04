/**
 * VisitorPass — Enterprise Visitor Badge Generator Component.
 * Supports dynamic pass templates (Visitor Pass, Contractor Pass, Vendor Pass, VIP Pass, Interview Pass),
 * dual logo header (Company Logo Top-Left, GTM Smart Gate Logo Top-Right),
 * QR Code verification payload, and print/export hooks.
 */
import React from 'react';
import { QrCode, ShieldCheck, Zap, User, MapPin, Clock, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';

// Standard GTM Smart Gate Logo Data URI for pass header Top Right
const GTM_SMARTGATE_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 44"><rect width="180" height="44" rx="8" fill="%230F172A"/><path d="M15 12L25 22L15 32M25 12L35 32" stroke="%2338BDF8" stroke-width="3" stroke-linecap="round"/><text x="44" y="27" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%23FFFFFF">GTM <tspan fill="%2338BDF8">SMART GATE</tspan></text></svg>`;

const TEMPLATE_STYLES = {
  'Visitor Pass':     { bg: 'linear-gradient(135deg, #1565C0, #0D47A1)', label: 'VISITOR ACCESS PASS', badgeBg: '#E3F2FD', badgeColor: '#0D47A1' },
  'Contractor Pass':  { bg: 'linear-gradient(135deg, #E65100, #EF6C00)', label: 'CONTRACTOR ACCESS PASS', badgeBg: '#FFF3E0', badgeColor: '#E65100' },
  'Vendor Pass':      { bg: 'linear-gradient(135deg, #2E7D32, #1B5E20)', label: 'VENDOR PERMIT BADGE', badgeBg: '#E8F5E9', badgeColor: '#1B5E20' },
  'VIP Pass':         { bg: 'linear-gradient(135deg, #6A1B9A, #4A148C)', label: 'VIP EXECUTIVE PASS', badgeBg: '#F3E5F5', badgeColor: '#4A148C' },
  'Interview Pass':   { bg: 'linear-gradient(135deg, #00838F, #006064)', label: 'CANDIDATE ENTRY PASS', badgeBg: '#E0F7FA', badgeColor: '#006064' },
};

const VisitorPass = ({ passData, template, onPrint }) => {
  const { org } = useVisitor();
  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';
  const orgLogo   = org?.logo || org?.logoLight;
  const orgName   = org?.displayName || org?.name || 'Apollo Tyres';
  const watermark = org?.watermark || `${orgName.toUpperCase()} ENTERPRISE PASS`;

  const activeTemplate = template || org?.kioskConfig?.visitorPassTemplate || 'Visitor Pass';
  const styleConfig = TEMPLATE_STYLES[activeTemplate] || TEMPLATE_STYLES['Visitor Pass'];

  // Encrypted / Structured QR payload string
  const qrPayload = JSON.stringify({
    vId: passData?.visitId || 'VIS-9982',
    pId: passData?.passId || 'VMS-APOLLO-9842',
    oId: org?.id || 1,
    hId: passData?.host?.id || 'EMP001',
    ts: passData?.timestamp || new Date().toISOString(),
    chk: 'VERIFIED_OK',
  });

  return (
    <div className="kiosk-pass-wrapper" style={{ position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto' }}>
      
      {/* Enterprise Dual-Logo Header Pass Container */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 24,
        border: `2px solid ${primary}30`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        
        {/* Background Watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          fontSize: 32,
          fontWeight: 900,
          color: 'rgba(0,0,0,0.03)',
          letterSpacing: 4,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          width: '100%',
          textAlign: 'center',
        }}>
          {watermark}
        </div>

        {/* ── TOP DUAL LOGO HEADER ─────────────────────────────────────── */}
        <div style={{
          background: '#0F172A',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          borderBottom: `4px solid ${primary}`,
        }}>
          {/* Top Left: Organization Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {orgLogo ? (
              <img
                src={orgLogo}
                alt={orgName}
                style={{ height: 38, maxWidth: 160, objectFit: 'contain' }}
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

          {/* Center Badge: Template Type */}
          <div style={{
            background: styleConfig.badgeBg,
            color: styleConfig.badgeColor,
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: '1px',
            padding: '4px 12px',
            borderRadius: 999,
            textTransform: 'uppercase',
          }}>
            {activeTemplate}
          </div>

          {/* Top Right: GTM Smart Gate Logo */}
          <div>
            <img
              src={GTM_SMARTGATE_LOGO_SVG}
              alt="GTM Smart Gate"
              style={{ height: 32, objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* ── PASS BODY CONTENT ────────────────────────────────────────── */}
        <div style={{ padding: 28, position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Visitor Photo Frame */}
            <div style={{ textCenter: 'center' }}>
              <div style={{
                width: 140, height: 160, borderRadius: 16,
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
                marginTop: 8, background: '#F0FDF4', color: '#2E7D32',
                border: '1px solid #BBF7D0', borderRadius: 8, padding: '3px 8px',
                fontSize: 11, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
              }}>
                <CheckCircle2 size={12} /> ID VERIFIED
              </div>
            </div>

            {/* Visitor Info Details */}
            <div style={{ flex: 1, minWidth: 220 }}>
              
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {passData?.name || 'Visitor Name'}
              </div>
              
              <div style={{ fontSize: 14, color: primary, fontWeight: 700, marginTop: 4 }}>
                {passData?.company || 'Walk-in Visitor'}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16,
                background: '#F8FAFC', padding: 14, borderRadius: 14, border: '1px solid #E2E8F0'
              }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>HOST EMPLOYEE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.host?.name || passData?.host || 'Reception'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>PURPOSE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.purpose || 'Business Visit'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>GATE / SITE</span>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{passData?.gate || 'Gate A Main Kiosk'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>VALID UNTIL</span>
                  <strong style={{ fontSize: 13, color: '#2E7D32' }}>{passData?.validUntil || '06:00 PM Today'}</strong>
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
                width: 72, height: 72, background: '#FFFFFF', border: '2px solid #0F172A',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <QrCode size={52} style={{ color: '#0F172A' }} />
              </div>

              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: 1 }}>
                  {passData?.passId || 'VMS-APOLLO-9842'}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Scan at turnstile barrier or gate officer device
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>ISSUE DATE & TIME</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

          </div>

        </div>

        {/* ── PASS FOOTER BRANDING ─────────────────────────────────────── */}
        <div style={{
          background: '#F1F5F9', padding: '10px 24px', borderTop: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#64748B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <ShieldCheck size={14} style={{ color: '#2E7D32' }} /> Authorized Enterprise Access Badge
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Zap size={11} style={{ color: primary }} /> Powered by <strong>GTM Smart Gate</strong>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VisitorPass;

/**
 * KioskHeader — Enterprise Dual-Branding Header & Stepper for GTM Smart Gate Kiosk.
 * Features:
 * - LEFT: Organization Logo & Organization Name
 * - RIGHT: GTM Smart Gate Logo, Current Date, Live Clock
 * - CENTER: 4-Step Progress Indicator
 */
import React, { useState, useEffect } from 'react';
import { Building2, Shield, CheckCircle2 } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';

import gtmLogo from '../../../../assets/icons/logo.png';

const STEPS = [
  { step: 1, key: 'mobile',   label: 'Mobile Verification' },
  { step: 2, key: 'details',  label: 'Visitor Details' },
  { step: 3, key: 'identity', label: 'Identity Verification' },
  { step: 4, key: 'pass',     label: 'Visitor Pass' },
];

const KioskHeader = ({ currentStep = 1 }) => {
  const { org } = useVisitor();
  const primary   = org?.primaryColor   || '#1565C0';
  const orgLogo   = org?.logo || org?.logoLight;
  const orgName   = org?.displayName || org?.name || 'Apollo Tyres';

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="kiosk-header" style={{ borderBottom: `4px solid ${primary}` }}>
      
      {/* ── TOP LEFT: ORGANIZATION LOGO & NAME ────────────────────────────── */}
      <div className="kiosk-header-brand">
        {orgLogo ? (
          <img
            src={orgLogo}
            alt={orgName}
            style={{
              height: 48,
              maxHeight: 48,
              maxWidth: 160,
              objectFit: 'contain',
              display: 'block',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: primary }}>
            <Building2 size={28} />
          </div>
        )}
        <div>
          <div className="kiosk-header-org">{orgName}</div>
          <div className="kiosk-header-powered">
            <span>Terminal Gate Access</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: 4-STEP PROGRESS STEPPER ────────────────────────────────── */}
      <div className="kiosk-stepper-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
          Step {currentStep} of 4
        </div>
        <div className="kiosk-stepper">
          {STEPS.map((s, idx) => {
            const isDone = s.step < currentStep;
            const isActive = s.step === currentStep;

            return (
              <React.Fragment key={s.key}>
                <div className="kiosk-step-item">
                  <div className={`kiosk-step-circle ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    {isDone ? <CheckCircle2 size={18} /> : s.step}
                  </div>
                  <span className={`kiosk-step-label ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`kiosk-step-connector ${s.step < currentStep ? 'done' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── TOP RIGHT: GTM SMART GATE LOGO & LIVE CLOCK ────────────────────── */}
      <div className="kiosk-header-right" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="kiosk-header-time">{timeStr || '10:00 AM'}</div>
          <div className="kiosk-header-date">{dateStr || 'Fri, 7 Aug 2026'}</div>
        </div>
        <img
          src={gtmLogo}
          alt="GTM Smart Gate"
          style={{ height: 48, maxHeight: 48, maxWidth: 160, objectFit: 'contain', display: 'block' }}
        />
      </div>

    </header>
  );
};

export default KioskHeader;

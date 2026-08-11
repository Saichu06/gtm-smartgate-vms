/**
 * KioskHeader — Compact Header & Dynamic Stepper for Physical Kiosk Terminal.
 * 
 * Header layout:
 * LEFT: Organization logo + Organization name + "Terminal Gate Access"
 * RIGHT: Current Time & Date + GTM Smart Gate logo
 * 
 * Stepper layout:
 * Dynamic step count based on Laptop selection (Laptop=YES -> 6 steps, Laptop=NO -> 5 steps).
 */
import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, Clock } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';
import gtmLogo from '../../../../assets/icons/logo.png';

const KioskHeader = ({ currentStep = 1 }) => {
  const { org, visitor } = useVisitor();
  const primary   = org?.primaryColor   || '#1565C0';
  const orgLogo   = org?.logo || org?.logoLight;
  const orgName   = org?.displayName || org?.name || 'GTM Smart Gate';

  const isLaptop = visitor?.laptop === 'YES';

  // Live clock state
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic steps list
  const steps = isLaptop
    ? [
        { step: 1, key: 'mobile',   label: 'Mobile' },
        { step: 2, key: 'details',  label: 'Details' },
        { step: 3, key: 'identity', label: 'Identity' },
        { step: 4, key: 'luggage',  label: 'Luggage' },
        { step: 5, key: 'vehicle',  label: 'Vehicle' },
        { step: 6, key: 'gatepass', label: 'Gate Pass' },
      ]
    : [
        { step: 1, key: 'mobile',   label: 'Mobile' },
        { step: 2, key: 'details',  label: 'Details' },
        { step: 3, key: 'identity', label: 'Identity' },
        { step: 4, key: 'vehicle',  label: 'Vehicle' },
        { step: 5, key: 'gatepass', label: 'Gate Pass' },
      ];

  const totalSteps = steps.length;
  // Normalize currentStep within range
  const activeStep = Math.min(Math.max(1, currentStep), totalSteps);

  return (
    <div className="kiosk-inbox-header" style={{ marginBottom: 14 }}>

      {/* ── DUAL LOGOS & CLOCK TOP BAR ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'nowrap', gap: 12 }}>
        
        {/* LEFT: ORG LOGO + ORG NAME */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={orgName}
              style={{ height: 28, maxHeight: 28, maxWidth: 110, objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} />
            </div>
          )}
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
              {orgName}
            </div>
            <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600 }}>
              Terminal Gate Access
            </div>
          </div>
        </div>

        {/* CENTER: STEP BADGE FOR MOBILE/SMALL SCREEN */}
        <div className="kiosk-mobile-step-badge" style={{ fontSize: 11, fontWeight: 800, color: primary, background: `${primary}12`, padding: '4px 10px', borderRadius: 12 }}>
          Step {activeStep} of {totalSteps}
        </div>

        {/* RIGHT: TIME/DATE + GTM SMART GATE LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} style={{ color: primary }} /> {timeStr}
            </div>
            <div style={{ fontSize: 9, color: '#64748B', fontWeight: 500 }}>
              {dateStr}
            </div>
          </div>

          <img
            src={gtmLogo}
            alt="GTM Smart Gate"
            style={{ height: 24, maxHeight: 24, maxWidth: 90, objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* ── DESKTOP/TABLET COMPACT STEPPER ───────────────────────────── */}
      <div className="kiosk-desktop-stepper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 0' }}>
        <div className="kiosk-stepper" style={{ border: 'none', background: 'transparent', padding: '2px 0', gap: 4 }}>
          {steps.map((s, idx) => {
            const isDone = s.step < activeStep;
            const isActive = s.step === activeStep;

            return (
              <React.Fragment key={s.key}>
                <div className="kiosk-step-item" style={{ minWidth: 44, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    className={`kiosk-step-circle ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                    style={{
                      width: 22, height: 22, fontSize: 10, fontWeight: 800,
                      background: isDone ? '#2E7D32' : isActive ? primary : '#F1F5F9',
                      color: isDone || isActive ? '#fff' : '#64748B',
                      border: `1.5px solid ${isDone ? '#2E7D32' : isActive ? primary : '#CBD5E1'}`,
                    }}
                  >
                    {isDone ? <CheckCircle2 size={12} /> : s.step}
                  </div>
                  <span
                    className={`kiosk-step-label ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                    style={{
                      fontSize: 9, fontWeight: isActive ? 800 : 600,
                      color: isActive ? primary : isDone ? '#2E7D32' : '#94A3B8',
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`kiosk-step-connector ${s.step < activeStep ? 'done' : ''}`}
                    style={{
                      width: 16, height: 2,
                      background: s.step < activeStep ? '#2E7D32' : '#E2E8F0',
                      marginTop: -10,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: '#F1F5F9', marginTop: 8 }} />
    </div>
  );
};

export default KioskHeader;

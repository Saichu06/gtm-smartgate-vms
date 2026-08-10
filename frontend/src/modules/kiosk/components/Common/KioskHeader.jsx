/**
 * KioskHeader — In-Box Header & Stepper for GTM Smart Gate Kiosk.
 * Rendered INSIDE the main container card box.
 * Displays:
 * - Dual Logos (Org Logo + GTM Smart Gate Logo)
 * - Mobile view step counter: "Step 1/4"
 * - Desktop view stepper
 */
import React from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';
import gtmLogo from '../../../../assets/icons/logo.png';

const STEPS = [
  { step: 1, key: 'mobile',   label: 'Mobile' },
  { step: 2, key: 'details',  label: 'Details' },
  { step: 3, key: 'identity', label: 'Identity' },
  { step: 4, key: 'pass',     label: 'Pass' },
];

const KioskHeader = ({ currentStep = 1 }) => {
  const { org } = useVisitor();
  const primary   = org?.primaryColor   || '#1565C0';
  const orgLogo   = org?.logo || org?.logoLight;
  const orgName   = org?.displayName || org?.name || 'Apollo Tyres';

  return (
    <div className="kiosk-inbox-header" style={{ marginBottom: 20 }}>
      
      {/* ── DUAL LOGOS AT TOP OF CARD ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={orgName}
              style={{ height: 36, maxHeight: 36, maxWidth: 120, objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: primary, fontWeight: 800, fontSize: 16 }}>
              <Building2 size={20} /> {orgName}
            </div>
          )}
        </div>

        {/* Mobile Step Badge: Step X/4 */}
        <div className="kiosk-mobile-step-badge">
          Step {currentStep}/4
        </div>

        <img
          src={gtmLogo}
          alt="GTM Smart Gate"
          style={{ height: 32, maxHeight: 32, maxWidth: 120, objectFit: 'contain' }}
        />
      </div>

      {/* ── DESKTOP/TABLET STEPPER ───────────────────────────── */}
      <div className="kiosk-desktop-stepper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="kiosk-stepper" style={{ border: 'none', background: 'transparent', padding: '4px 0' }}>
          {STEPS.map((s, idx) => {
            const isDone = s.step < currentStep;
            const isActive = s.step === currentStep;

            return (
              <React.Fragment key={s.key}>
                <div className="kiosk-step-item" style={{ minWidth: 54 }}>
                  <div className={`kiosk-step-circle ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`} style={{ width: 24, height: 24, fontSize: 11 }}>
                    {isDone ? <CheckCircle2 size={13} /> : s.step}
                  </div>
                  <span className={`kiosk-step-label ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`} style={{ fontSize: 9 }}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`kiosk-step-connector ${s.step < currentStep ? 'done' : ''}`} style={{ width: 20 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: '#F1F5F9', marginTop: 12 }} />
    </div>
  );
};

export default KioskHeader;

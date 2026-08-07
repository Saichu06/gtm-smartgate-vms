/**
 * PassGeneratedPage — Screen 4B: Visitor Badge (4-Screen Kiosk Flow)
 *
 * Displays the Visitor Badge after a physical gate pass has been assigned.
 * The pass was chosen on the GatePassAssignmentPage (/gate-pass) and is
 * already stored in visitor.assignedPass.
 *
 * Dual-State UX (single page, no navigation):
 *   State A: "Preparing Visitor Badge..." (1.2s animation)
 *   State B: Full Visitor Badge appears
 *
 * On Finish:
 *   - Releases the physical gate pass back to "available" (prototype behaviour)
 *   - 5-second countdown → clears VisitorContext → returns to Welcome screen
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Printer, Home, Sparkles, Zap, ShieldCheck, QrCode, User, Building2, Tag } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import { submitRegistration } from '../services/kioskApi';
import { releaseGatePass } from '../services/gatePassApi';
import '../styles/kiosk.css';
import gtmLogo from '../../../assets/icons/logo.png';

const PassGeneratedPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor, resetFlow } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';
  const orgLogo   = org?.logo || org?.logoLight;
  const orgName   = org?.displayName || org?.name || 'Organization';

  const assignedPass = visitor.assignedPass;

  const [passState, setPassState]     = useState('generating');
  const [printing, setPrinting]       = useState(false);
  const [printed, setPrinted]         = useState(false);
  const [resetCountdown, setResetCountdown] = useState(null);
  const countdownRef = useRef(null);

  // Brief 1.2-second animation then reveal badge
  useEffect(() => {
    let isMounted = true;

    // Submit registration record to localStorage / backend
    submitRegistration(visitor, orgId, {
      approvalRequired: false,
      siteName: assignedPass?.gate || 'Gate A — Self-Service Kiosk',
      orgCode: org?.code || 'ORG',
    }).then((result) => {
      if (isMounted) {
        updateVisitor({ passInfo: result, submitted: true });
      }
    });

    const timer = setTimeout(() => {
      if (isMounted) setPassState('ready');
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
      setPrinted(true);
    }, 400);
  };

  const handleFinish = () => {
    if (resetCountdown !== null) return;

    // Prototype behaviour: release gate pass back to available on Finish
    if (assignedPass) {
      releaseGatePass(orgId, assignedPass.id);
    }

    setResetCountdown(5);
    countdownRef.current = setInterval(() => {
      setResetCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          resetFlow();
          navigate(`/kiosk/${orgId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const visitorName = visitor.name || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Visitor';
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <KioskHeader currentStep={4} />

      <div className="kiosk-page">

        {/* ── STATE A: GENERATING ANIMATION ─────────────────────────────── */}
        {passState === 'generating' ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 48, textAlign: 'center', animation: 'kioskFadeIn 0.3s ease',
          }}>
            <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 32 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `6px solid ${primary}20`, borderTopColor: primary,
                animation: 'spin 1s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 18, borderRadius: '50%',
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              }}>
                <Sparkles size={46} />
              </div>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
              Preparing Visitor Badge...
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 420, margin: 0 }}>
              Registering your visit and generating your secure QR code.
            </p>
          </div>

        ) : (
          /* ── STATE B: VISITOR BADGE ──────────────────────────────────── */
          <div
            className="kiosk-content"
            style={{
              margin: '0 auto', maxWidth: 820,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px 16px 40px',
              animation: 'kioskFadeUp 0.4s ease',
            }}
          >
            {/* Success header */}
            <div className="kiosk-success-icon" style={{ marginBottom: 12 }}>
              <CheckCircle size={52} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 4px', textAlign: 'center' }}>
              Registration Complete!
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 28px', textAlign: 'center' }}>
              Your visitor badge is ready. Please collect your physical gate pass from the security desk.
            </p>

            {/* ── VISITOR BADGE ──────────────────────────────────────────── */}
            <div
              className="printable-visitor-badge"
              style={{
                width: '100%', maxWidth: 680,
                background: '#FFFFFF',
                borderRadius: 24,
                border: `3px solid ${primary}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                overflow: 'hidden',
              }}
            >
              {/* Badge Header — Dual Logos */}
              <div style={{
                background: '#0F172A',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `4px solid ${primary}`,
              }}>
                {/* Org Logo Left */}
                <div>
                  {orgLogo ? (
                    <img
                      src={orgLogo}
                      alt={orgName}
                      style={{ height: 40, maxWidth: 160, objectFit: 'contain' }}
                      onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{orgName}</div>
                  )}
                </div>

                {/* VALID TODAY pill */}
                <div style={{
                  background: '#F0FDF4', color: '#2E7D32', fontWeight: 800,
                  fontSize: 11, letterSpacing: '1.5px', padding: '6px 14px',
                  borderRadius: 999, border: '1px solid #BBF7D0',
                  textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <ShieldCheck size={13} /> VALID TODAY
                </div>

                {/* GTM Smart Gate Logo Right */}
                <img
                  src={gtmLogo}
                  alt="GTM Smart Gate"
                  style={{ height: 40, maxWidth: 150, objectFit: 'contain', background: '#fff', padding: '4px 10px', borderRadius: 8 }}
                />
              </div>

              {/* VISITOR PASS Title Strip */}
              <div style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                color: '#fff', textAlign: 'center',
                padding: '10px 0', fontSize: 16, fontWeight: 900,
                letterSpacing: 2, textTransform: 'uppercase',
              }}>
                VISITOR PASS
              </div>

              {/* Badge Body */}
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                  {/* Visitor Photo */}
                  <div>
                    <div style={{
                      width: 130, height: 156, borderRadius: 14,
                      overflow: 'hidden', border: `3px solid ${primary}`,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      background: '#F8FAFC',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {visitor.photoDataUrl ? (
                        <img src={visitor.photoDataUrl} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={52} color="#CBD5E1" />
                      )}
                    </div>
                    {/* Physical Gate Pass Number */}
                    <div style={{
                      marginTop: 8, background: '#EFF6FF', color: primary,
                      border: `2px solid ${primary}40`, borderRadius: 10,
                      padding: '6px 10px', fontSize: 13, fontWeight: 800,
                      textAlign: 'center',
                    }}>
                      {assignedPass?.name || 'Gate Pass'}
                    </div>
                  </div>

                  {/* Visitor Info Grid */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                      {visitorName}
                    </div>
                    <div style={{ fontSize: 14, color: primary, fontWeight: 700, marginTop: 4 }}>
                      {visitor.company || 'Walk-in Visitor'}
                    </div>

                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: 12, marginTop: 16,
                      background: '#F8FAFC', padding: 14, borderRadius: 14,
                      border: '1px solid #E2E8F0',
                    }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Visitor Type</span>
                        <strong style={{ fontSize: 13, color: '#0F172A' }}>{visitor.visitorType || 'Business Visitor'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Person To Meet</span>
                        <strong style={{ fontSize: 13, color: '#0F172A' }}>{visitor.host?.name || 'Reception Desk'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Visit Date</span>
                        <strong style={{ fontSize: 13, color: '#0F172A' }}>{currentDate}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Visit Time</span>
                        <strong style={{ fontSize: 13, color: '#0F172A' }}>{currentTime}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Strip */}
                <div style={{
                  marginTop: 20, paddingTop: 16, borderTop: '2px dashed #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 70, height: 70, background: '#fff',
                      border: '2px solid #0F172A', borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}>
                      <QrCode size={52} color="#0F172A" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: 1 }}>
                        {visitor.visitId || 'VIS-XXXXX'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Scan at turnstile or gate officer device
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2E7D32' }}>VALID TODAY</div>
                  </div>
                </div>
              </div>

              {/* Badge Footer */}
              <div style={{
                background: '#0F172A', padding: '10px 24px', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  <ShieldCheck size={13} style={{ color: '#38BDF8' }} /> Authorized Enterprise Visitor Badge
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} style={{ color: '#38BDF8' }} /> Powered by <strong>GTM Smart Gate</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 16, marginTop: 28, width: '100%', maxWidth: 560 }}>
              <button
                className="kiosk-btn kiosk-btn-secondary"
                onClick={handlePrint}
                disabled={printing}
                style={{ flex: 1, minHeight: 60 }}
              >
                {printing ? (
                  <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #64748B', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> Printing...</>
                ) : printed ? (
                  <><CheckCircle size={18} style={{ color: '#2E7D32' }} /> Printed</>
                ) : (
                  <><Printer size={18} /> Print Pass</>
                )}
              </button>

              <button
                className="kiosk-btn kiosk-btn-primary"
                onClick={handleFinish}
                disabled={resetCountdown !== null}
                style={{
                  flex: 1, minHeight: 60,
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  color: '#fff',
                }}
              >
                {resetCountdown !== null ? (
                  <>Returning in {resetCountdown}s...</>
                ) : (
                  <><Home size={18} /> Finish</>
                )}
              </button>
            </div>

            {/* Countdown notice */}
            {resetCountdown !== null && (
              <div style={{
                marginTop: 16, background: '#F0F9FF', border: '1px solid #BAE6FD',
                borderRadius: 12, padding: '10px 20px', color: '#0369A1',
                fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                animation: 'kioskFadeIn 0.3s ease',
              }}>
                <Zap size={15} />
                Terminal will reset for the next visitor in <strong>{resetCountdown} seconds</strong>...
              </div>
            )}

            {!resetCountdown && (
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 12 }}>
                Please collect your physical gate pass from the security desk and wear it visibly at all times.
              </p>
            )}

          </div>
        )}
      </div>

      <KioskFooter />
    </div>
  );
};

export default PassGeneratedPage;

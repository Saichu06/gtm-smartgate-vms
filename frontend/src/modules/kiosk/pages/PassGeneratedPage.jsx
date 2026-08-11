/**
 * PassGeneratedPage — Registration Complete + Visitor Badge
 * - Brief "Generating..." state (1 second)
 * - Visitor badge with real QR code
 * - Print button (window.print())
 * - Auto-reset countdown after Finish
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Printer, Home, ShieldCheck, User, Loader2, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import KioskHeader from '../components/Common/KioskHeader';
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

  const isLaptop    = visitor.laptop === 'YES';
  const totalSteps  = isLaptop ? 6 : 5;

  const assignedPass = visitor.assignedPass;

  const [passState, setPassState]           = useState('generating');
  const [printing, setPrinting]             = useState(false);
  const [printed, setPrinted]               = useState(false);
  const [resetCountdown, setResetCountdown] = useState(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    submitRegistration(visitor, orgId, {
      approvalRequired: false,
      siteName: assignedPass?.gate || 'Gate — Self-Service Kiosk',
      orgCode: org?.code || 'ORG',
    }).then(result => {
      if (mounted) updateVisitor({ passInfo: result, submitted: true });
    });

    const timer = setTimeout(() => {
      if (mounted) setPassState('ready');
    }, 1000);

    return () => {
      mounted = false;
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
    }, 200);
  };

  const handleFinish = () => {
    if (resetCountdown !== null) return;
    if (assignedPass) releaseGatePass(orgId, assignedPass.id);
    setResetCountdown(5);
    countdownRef.current = setInterval(() => {
      setResetCountdown(prev => {
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

  const visitorName  = visitor.visitorName || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Visitor';
  const personToMeet = visitor.personToMeet || visitor.host?.name || 'Reception Desk';
  const comingFrom   = visitor.comingFrom   || visitor.company || 'Walk-in';
  const currentDate  = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTime  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const qrPayload = JSON.stringify({
    visitId:     visitor.visitId || 'VIS-000000',
    orgId,
    visitorName,
    gatePass:    assignedPass?.name || null,
    gatePassId:  assignedPass?.id   || null,
    gate:        assignedPass?.gate || 'Gate A',
    status:      'VALID TODAY',
    date:        new Date().toISOString().slice(0, 10),
    checkinTime: currentTime,
  });

  if (passState === 'generating') {
    return (
      <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
        <div className="kiosk-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', animation: 'kioskFadeIn 0.3s ease' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `5px solid ${primary}20`, borderTopColor: primary, animation: 'spin 0.9s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={22} style={{ color: primary, animation: 'spin 0.8s linear infinite' }} />
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Generating Visitor Pass...</div>
            <div style={{ fontSize: 13, color: '#64748B' }}>Registering your visit and creating QR code</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <div className="kiosk-page" style={{ padding: '12px', overflowY: 'auto' }}>
        <div className="kiosk-panel" style={{ maxWidth: 700 }}>
          <KioskHeader currentStep={totalSteps} />

          {/* Success heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <CheckCircle2 size={24} style={{ color: '#2E7D32', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>Registration Complete</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Collect your physical gate pass from the security desk.</div>
            </div>
          </div>

          {/* Visitor Badge — printable */}
          <div
            className="printable-visitor-badge"
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 16,
              border: `2px solid ${primary}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            {/* Badge header */}
            <div style={{ background: '#0F172A', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${primary}` }}>
              <div>
                {orgLogo ? (
                  <img src={orgLogo} alt={orgName} style={{ height: 32, maxWidth: 130, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{orgName}</span>
                )}
              </div>
              <div style={{ background: '#F0FDF4', color: '#2E7D32', fontWeight: 800, fontSize: 10, letterSpacing: 1, padding: '4px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' }}>
                <ShieldCheck size={11} /> Valid Today
              </div>
              <img src={gtmLogo} alt="GTM Smart Gate" style={{ height: 28, maxWidth: 100, objectFit: 'contain', background: '#fff', padding: '3px 8px', borderRadius: 6 }} />
            </div>

            {/* Title strip */}
            <div style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#fff', textAlign: 'center', padding: '7px 0', fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>
              VISITOR PASS
            </div>

            {/* Badge body */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Photo */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: 110, height: 132, borderRadius: 10, overflow: 'hidden', border: `2px solid ${primary}`, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {visitor.photoDataUrl ? (
                      <img src={visitor.photoDataUrl} alt="Visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={42} color="#CBD5E1" />
                    )}
                  </div>
                  <div style={{ marginTop: 6, background: '#EFF6FF', color: primary, border: `1.5px solid ${primary}40`, borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>
                    {assignedPass?.name || 'Gate Pass'}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{visitorName}</div>
                  <div style={{ fontSize: 12, color: primary, fontWeight: 700, marginTop: 2 }}>{comingFrom}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, background: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    {[
                      ['Visitor Type', visitor.visitorType || 'Business Visitor'],
                      ['Person To Meet', personToMeet],
                      ['Vehicle', visitor.vehicleNumber || '—'],
                      ['Date', currentDate],
                      ['Time', currentTime],
                      ['Gate', assignedPass?.gate || '—'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{label}</span>
                        <strong style={{ fontSize: 12, color: '#0F172A' }}>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Strip */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1.5px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#fff', border: '1.5px solid #0F172A', borderRadius: 8, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <QRCodeSVG value={qrPayload} size={56} level="M" bgColor="#ffffff" fgColor="#0F172A" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#0F172A', letterSpacing: 1 }}>{visitor.visitId || 'VIS-XXXXX'}</div>
                    <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Scan at gate officer device</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#2E7D32' }}>VALID TODAY</div>
                </div>
              </div>
            </div>

            {/* Badge footer */}
            <div style={{ background: '#0F172A', padding: '8px 18px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <ShieldCheck size={11} style={{ color: '#38BDF8' }} /> Authorized Enterprise Visitor Badge
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Zap size={10} style={{ color: '#38BDF8' }} /> Powered by <strong style={{ marginLeft: 3 }}>GTM Smart Gate</strong>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button className="kiosk-btn kiosk-btn-back" style={{ flex: 1, minHeight: 44, fontSize: 13 }} onClick={handlePrint} disabled={printing}>
              {printing ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Printing...</>
                : printed ? <><CheckCircle2 size={15} style={{ color: '#2E7D32' }} /> Printed</>
                : <><Printer size={15} /> Print Pass</>}
            </button>
            <button
              className="kiosk-btn kiosk-btn-primary"
              style={{ flex: 2, minHeight: 44, fontSize: 14, fontWeight: 800 }}
              onClick={handleFinish}
              disabled={resetCountdown !== null}
            >
              {resetCountdown !== null ? `Returning in ${resetCountdown}s...` : <><Home size={15} /> Finish</>}
            </button>
          </div>

          {resetCountdown !== null && (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
              Terminal resets for next visitor in <strong>{resetCountdown}s</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassGeneratedPage;

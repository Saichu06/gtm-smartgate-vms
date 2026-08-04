/**
 * PassGeneratedPage — Screen 9. Renders VisitorPass enterprise badge, print action & done button.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Printer, Home } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import VisitorPass from '../components/Pass/VisitorPass';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';

const PassGeneratedPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, resetFlow } = useVisitor();

  const primary = org?.primaryColor || '#1565C0';
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);

  const passData = {
    passId: visitor.passInfo?.passId || 'VMS-APOLLO-9842',
    visitId: visitor.passInfo?.visitId || 'VIS-7821A',
    name: `${visitor.firstName || 'Rajesh'} ${visitor.lastName || 'Kumar'}`,
    company: visitor.company || 'Infosys Ltd',
    host: visitor.host || { name: 'Arun Sharma', floor: 'Floor 3 - Tech Hub' },
    purpose: visitor.purpose || 'Business Visit',
    visitorType: visitor.visitorType || 'Business Visitor',
    photo: visitor.photoDataUrl,
    gate: visitor.passInfo?.gate || 'Gate A - Self-Service Kiosk',
    validUntil: visitor.passInfo?.validUntil || '06:00 PM IST Today',
    timestamp: new Date().toISOString(),
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
      setPrinted(true);
    }, 1500);
  };

  const handleDone = () => {
    resetFlow();
    navigate(`/kiosk/${orgId}`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <KioskHeader />
      <ProgressStepper currentStep={7} />

      <div className="kiosk-page">
        <div className="kiosk-content" style={{ margin: '0 auto', maxWidth: 760, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div className="kiosk-success-icon" style={{ marginBottom: 16 }}>
            <CheckCircle size={56} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', textAlign: 'center' }}>
            Registration Approved!
          </h2>
          <p style={{ fontSize: 16, color: '#64748B', margin: '0 0 24px', textAlign: 'center' }}>
            Your enterprise access pass badge has been generated.
          </p>

          {/* Standalone Dual-Logo Visitor Badge Component */}
          <VisitorPass passData={passData} template={org?.kioskConfig?.visitorPassTemplate} />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 16, marginTop: 32, width: '100%', maxWidth: 460 }}>
            <button
              className="kiosk-btn kiosk-btn-secondary"
              onClick={handlePrint}
              disabled={printing}
              style={{ flex: 1 }}
            >
              {printing ? (
                <>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #64748B', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  Printing Badge...
                </>
              ) : printed ? (
                <> <CheckCircle size={20} style={{ color: '#2E7D32' }} /> Badge Printed </>
              ) : (
                <> <Printer size={20} /> Print Access Badge </>
              )}
            </button>

            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={handleDone}
              style={{ flex: 1, background: `linear-gradient(135deg, ${primary}, #0F172A)`, color: '#FFFFFF' }}
            >
              <Home size={20} /> Done
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 16 }}>
            Please wear your printed badge visibly at all times while inside the premises.
          </p>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default PassGeneratedPage;

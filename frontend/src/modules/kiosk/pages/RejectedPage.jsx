/**
 * RejectedPage — Screen 10. Professional rejection screen directing visitor to security desk.
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XCircle, Home, HelpCircle, Phone, Mail } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';

const RejectedPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, resetFlow } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const handleReturnHome = () => {
    resetFlow();
    navigate(`/kiosk/${orgId}`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <KioskHeader />

      <div className="kiosk-page">
        <div className="kiosk-content" style={{ margin: '0 auto', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

          {/* Error Animated Icon */}
          <div className="kiosk-error-icon" style={{ marginBottom: 24 }}>
            <XCircle size={64} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', textAlign: 'center' }}>
            Request Not Approved
          </h2>
          <p style={{ fontSize: 17, color: '#64748B', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.6 }}>
            Your visitor access request could not be automatically approved at this time.
            Please visit the reception or security desk for assistance.
          </p>

          {/* Security Box */}
          <div className="kiosk-section-card" style={{ width: '100%', marginBottom: 32 }}>
            <div className="kiosk-section-card-body" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D32F2F' }}>
                  <HelpCircle size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>Security Desk Instructions</div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>Please provide your name and phone number to the officer.</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={15} style={{ color: primary }} />
                  Security Desk Extension: <strong>#4040</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={15} style={{ color: primary }} />
                  Security Support: <strong>{org?.supportEmail || 'security@company.com'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="kiosk-btn kiosk-btn-primary kiosk-btn-lg kiosk-btn-full"
            onClick={handleReturnHome}
            style={{ maxWidth: 360 }}
          >
            <Home size={22} /> Return Home
          </button>
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default RejectedPage;

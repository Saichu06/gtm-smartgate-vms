/**
 * PhotoCapturePage — Screen 5. Mock webcam photo capture with face guide overlay.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Camera, Info } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import CameraCapture from '../components/Camera/CameraCapture';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';

const PhotoCapturePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const [capturedUrl, setCapturedUrl] = useState(visitor.photoDataUrl || null);

  const handleCapture = (url) => {
    setCapturedUrl(url);
    updateVisitor({ photoDataUrl: url });
  };

  const handleRetake = () => {
    setCapturedUrl(null);
    updateVisitor({ photoDataUrl: null });
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content" style={{ margin: '0 auto', maxWidth: 820, width: '100%', padding: 0 }}>

          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>

            {/* In-Box Header (Dual Logos + Step 3/4 Counter) */}
            <KioskHeader currentStep={3} />

            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <div className="kiosk-page-title" style={{ fontSize: 22, margin: '0 0 4px' }}>
                <Camera size={24} style={{ color: primary, verticalAlign: 'middle', marginRight: 8 }} />
                Photo Capture
              </div>
              <p className="kiosk-page-sub" style={{ fontSize: 13, margin: 0 }}>Your photo will be used to generate a secure visitor pass.</p>
            </div>

            {/* Info Card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#F0F9FF', border: '1px solid #BAE6FD',
              borderRadius: 12, padding: '10px 14px', marginBottom: 20,
            }}>
              <Info size={16} style={{ color: '#0369A1', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: '#0369A1', fontWeight: 500 }}>
                Look directly at camera, ensure clear lighting, and remove hats/glasses.
              </div>
            </div>

            {/* Camera */}
            <CameraCapture
              onCapture={handleCapture}
              onRetake={handleRetake}
              capturedUrl={capturedUrl}
              showFaceGuide={!capturedUrl}
              label="Position face inside oval frame and tap Capture"
            />

            {/* Bottom Action Bar inside Box */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
                onClick={() => navigate(`/kiosk/${orgId}/employee`)}
                style={{ flex: 1, minHeight: 48 }}
              >
                <ArrowLeft size={18} /> Back
              </button>

              <button
                className="kiosk-btn kiosk-btn-primary"
                onClick={() => navigate(`/kiosk/${orgId}/id-proof`)}
                disabled={!capturedUrl}
                style={{
                  flex: 2,
                  minHeight: 48,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 800,
                  background: capturedUrl ? `linear-gradient(135deg, ${primary}, #0F172A)` : '#E2E8F0',
                  color: capturedUrl ? '#FFFFFF' : '#94A3B8',
                }}
              >
                Next: ID Verification <ArrowRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default PhotoCapturePage;

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
      <KioskHeader />
      <ProgressStepper currentStep={3} />

      <div className="kiosk-page">
        <div className="kiosk-content kiosk-content-md" style={{ margin: '0 auto' }}>

          <button
            className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
            onClick={() => navigate(`/kiosk/${orgId}/employee`)}
            style={{ marginBottom: 24 }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="kiosk-page-title">
            <Camera size={30} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
            Photo Capture
          </div>
          <p className="kiosk-page-sub">Your photo will be used to generate a secure visitor pass.</p>

          {/* Info Card */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: '#F0F9FF', border: '1px solid #BAE6FD',
            borderRadius: 14, padding: '14px 18px', marginBottom: 28,
          }}>
            <Info size={18} style={{ color: '#0369A1', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 14, color: '#0369A1', fontWeight: 500 }}>
              <strong>Tips for a good photo:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Look directly at the camera</li>
                <li>Remove sunglasses or hat</li>
                <li>Ensure good lighting on your face</li>
                <li>Keep a neutral expression</li>
              </ul>
            </div>
          </div>

          {/* Camera */}
          <CameraCapture
            onCapture={handleCapture}
            onRetake={handleRetake}
            capturedUrl={capturedUrl}
            showFaceGuide={!capturedUrl}
            label="Position your face inside the oval frame and tap Capture"
          />

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={() => navigate(`/kiosk/${orgId}/id-proof`)}
              disabled={!capturedUrl}
              style={{ minWidth: 220 }}
            >
              Next: ID Verification <ArrowRight size={22} />
            </button>
          </div>

          {!capturedUrl && (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 12 }}>
              Please capture your photo to continue
            </p>
          )}
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default PhotoCapturePage;

/**
 * IdentityVerificationPage — Screen 3: Identity Verification (4-Screen Kiosk Flow)
 * Features:
 * - Section A: Visitor Face webcam live preview -> Capture -> Preview -> Retake / Accept
 * - Section B: ID Document capture (Aadhaar, PAN, DL, Passport, Other) -> Preview -> Retake / Accept
 * - Continue button enables ONLY after both face and ID images are explicitly accepted.
 * - Step 3 of 4 Header Progress
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Shield, Camera, CheckCircle, RefreshCw, Sparkles, User, FileText } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import CameraCapture from '../components/Camera/CameraCapture';
import { useVisitor } from '../context/VisitorContext';
import { ID_TYPES } from '../services/kioskApi';
import '../styles/kiosk.css';

const IdentityVerificationPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  // Section A: Face Capture State
  const [faceUrl, setFaceUrl] = useState(visitor.photoDataUrl || null);
  const [faceAccepted, setFaceAccepted] = useState(Boolean(visitor.photoDataUrl));

  // Section B: ID Capture State
  const [selectedIdType, setSelectedIdType] = useState(visitor.idType || 'aadhaar');
  const [idUrl, setIdUrl] = useState(visitor.idImageUrl || null);
  const [idAccepted, setIdAccepted] = useState(Boolean(visitor.idImageUrl));

  const [error, setError] = useState('');

  const handleFaceCapture = (url) => {
    setFaceUrl(url);
    setFaceAccepted(false);
  };

  const handleFaceAccept = () => {
    setFaceAccepted(true);
    updateVisitor({ photoDataUrl: faceUrl });
  };

  const handleFaceRetake = () => {
    setFaceUrl(null);
    setFaceAccepted(false);
    updateVisitor({ photoDataUrl: null });
  };

  const handleIdCapture = (url) => {
    setIdUrl(url);
    setIdAccepted(false);
  };

  const handleIdAccept = () => {
    setIdAccepted(true);
    updateVisitor({ idType: selectedIdType, idImageUrl: idUrl });
  };

  const handleIdRetake = () => {
    setIdUrl(null);
    setIdAccepted(false);
    updateVisitor({ idImageUrl: null });
  };

  const handleContinue = () => {
    if (!faceAccepted || !idAccepted) {
      setError('Please capture and ACCEPT both your Face Photo and ID Proof before continuing.');
      return;
    }
    updateVisitor({
      photoDataUrl: faceUrl,
      idType: selectedIdType,
      idImageUrl: idUrl,
    });
    navigate(`/kiosk/${orgId}/gate-pass`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <KioskHeader currentStep={3} />

      <div className="kiosk-page">
        <div className="kiosk-content kiosk-content-md" style={{ margin: '0 auto', maxWidth: 880 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
              onClick={() => navigate(`/kiosk/${orgId}/details`)}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div style={{ fontSize: 14, fontWeight: 700, color: primary, background: `${primary}15`, padding: '6px 14px', borderRadius: 999 }}>
              Identity & Photo Verification
            </div>
          </div>

          <div className="kiosk-page-title">
            <Shield size={32} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
            Identity Verification
          </div>
          <p className="kiosk-page-sub">Capture your photo and scan your ID document. Confirm both images to continue.</p>

          {/* ── SECTION A: VISITOR FACE CAPTURE ──────────────────────────────── */}
          <div className="kiosk-section-card" style={{ marginBottom: 28 }}>
            <div className="kiosk-section-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={20} style={{ color: primary }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>SECTION A — Visitor Face Photo</span>
              </div>
              {faceAccepted && (
                <span style={{ background: '#F0FDF4', color: '#2E7D32', border: '1px solid #BBF7D0', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={14} /> FACE CONFIRMED
                </span>
              )}
            </div>
            <div className="kiosk-section-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CameraCapture
                mode="visitor"
                onCapture={handleFaceCapture}
                onRetake={handleFaceRetake}
                capturedUrl={faceUrl}
                label="Look directly at the webcam inside the oval frame"
              />

              {faceUrl && !faceAccepted && (
                <div style={{ display: 'flex', gap: 14, marginTop: 16, width: '100%', maxWidth: 440 }}>
                  <button
                    className="kiosk-btn kiosk-btn-secondary"
                    onClick={handleFaceRetake}
                    style={{ flex: 1 }}
                  >
                    <RefreshCw size={18} /> Retake Face Photo
                  </button>
                  <button
                    className="kiosk-btn kiosk-btn-primary"
                    onClick={handleFaceAccept}
                    style={{ flex: 1, background: '#2E7D32' }}
                  >
                    <CheckCircle size={18} /> Accept Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION B: IDENTITY DOCUMENT CAPTURE ────────────────────────── */}
          <div className="kiosk-section-card" style={{ marginBottom: 28 }}>
            <div className="kiosk-section-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} style={{ color: primary }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>SECTION B — Identity Document Verification</span>
              </div>
              {idAccepted && (
                <span style={{ background: '#F0FDF4', color: '#2E7D32', border: '1px solid #BBF7D0', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={14} /> ID CONFIRMED
                </span>
              )}
            </div>
            <div className="kiosk-section-card-body">
              {/* ID Type Selection */}
              <div style={{ marginBottom: 20 }}>
                <label className="kiosk-input-label" style={{ marginBottom: 10, display: 'block' }}>Select Document Type</label>
                <div className="kiosk-id-grid">
                  {ID_TYPES.map(id => (
                    <div
                      key={id.id}
                      className={`kiosk-id-card ${selectedIdType === id.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedIdType(id.id); setError(''); }}
                    >
                      <div className="kiosk-id-icon" style={{ background: `${id.color}18`, fontSize: 24 }}>
                        {id.icon}
                      </div>
                      <div className="kiosk-id-label">{id.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ID Camera Scanner */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CameraCapture
                  mode="document"
                  onCapture={handleIdCapture}
                  onRetake={handleIdRetake}
                  capturedUrl={idUrl}
                  label={`Hold ${ID_TYPES.find(t => t.id === selectedIdType)?.label || 'ID'} flat inside the camera frame`}
                />

                {idUrl && !idAccepted && (
                  <div style={{ display: 'flex', gap: 14, marginTop: 16, width: '100%', maxWidth: 440 }}>
                    <button
                      className="kiosk-btn kiosk-btn-secondary"
                      onClick={handleIdRetake}
                      style={{ flex: 1 }}
                    >
                      <RefreshCw size={18} /> Retake ID Scan
                    </button>
                    <button
                      className="kiosk-btn kiosk-btn-primary"
                      onClick={handleIdAccept}
                      style={{ flex: 1, background: '#2E7D32' }}
                    >
                      <CheckCircle size={18} /> Accept ID Scan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p style={{ color: '#D32F2F', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 20 }}>{error}</p>
          )}

          {/* Continue CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={handleContinue}
              disabled={!faceAccepted || !idAccepted}
              style={{
                background: faceAccepted && idAccepted ? `linear-gradient(135deg, ${primary}, #0F172A)` : undefined,
                color: '#FFFFFF',
                minWidth: 260,
              }}
            >
              Generate Visitor Pass <ArrowRight size={22} />
            </button>
          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default IdentityVerificationPage;


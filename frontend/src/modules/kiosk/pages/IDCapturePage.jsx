/**
 * IdentityVerificationPage — Screen 3: Identity Verification (4-Screen Kiosk Flow)
 * Features:
 * - Single combined box with Visitor Photo (Left) and Identity Camera (Right)
 * - Verification category dropdown without emojis
 * - Small camera spaces
 * - After capture: Retake and Next options only
 * - Back button at bottom inside the box
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Shield, User, FileText } from 'lucide-react';
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

  // Section B: ID Capture State
  const [selectedIdType, setSelectedIdType] = useState(visitor.idType || 'aadhaar');
  const [idUrl, setIdUrl] = useState(visitor.idImageUrl || null);

  const [error, setError] = useState('');

  const handleFaceCapture = (url) => {
    setFaceUrl(url);
    setError('');
  };

  const handleFaceRetake = () => {
    setFaceUrl(null);
    updateVisitor({ photoDataUrl: null });
  };

  const handleIdCapture = (url) => {
    setIdUrl(url);
    setError('');
  };

  const handleIdRetake = () => {
    setIdUrl(null);
    updateVisitor({ idImageUrl: null });
  };

  const handleContinue = () => {
    if (!faceUrl || !idUrl) {
      setError('Please capture both your Photo and ID Proof before continuing.');
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
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content" style={{ margin: '0 auto', maxWidth: 820, width: '100%', padding: 0 }}>

          {/* Single Container Box for Both Cameras */}
          <div className="kiosk-section-card" style={{ padding: '24px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>

            {/* In-Box Header (Dual Logos + Step 3/4 Counter) */}
            <KioskHeader currentStep={3} />

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Shield size={22} style={{ color: primary }} />
                Identity & Photo Verification
              </div>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                Capture your photo and scan your ID document below.
              </p>
            </div>

            {/* Verification Category Dropdown (No Emojis) */}
            <div className="kiosk-field" style={{ maxWidth: 380, margin: '0 auto 20px' }}>
              <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569', textAlign: 'center', display: 'block' }}>
                VERIFICATION CATEGORY / DOCUMENT TYPE *
              </label>
              <div className="kiosk-input-card" style={{ borderColor: '#E2E8F0', minHeight: 44, padding: '0 12px' }}>
                <FileText size={18} style={{ color: primary, flexShrink: 0 }} />
                <select
                  value={selectedIdType}
                  onChange={(e) => { setSelectedIdType(e.target.value); setError(''); }}
                  style={{ fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 38 }}
                >
                  {ID_TYPES.map(id => (
                    <option key={id.id} value={id.id}>
                      {id.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side by Side Dual Camera Box (Left: Visitor Face, Right: ID Camera) */}
            <div className="kiosk-camera-dual-box" style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              alignItems: 'stretch',
              flexWrap: 'wrap',
              marginBottom: 20
            }}>

              {/* LEFT: VISITOR PHOTO CAMERA */}
              <div style={{
                flex: 1,
                minWidth: 260,
                maxWidth: 360,
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} style={{ color: primary }} /> Visitor Photo
                </div>
                <CameraCapture
                  mode="visitor"
                  onCapture={handleFaceCapture}
                  onRetake={handleFaceRetake}
                  capturedUrl={faceUrl}
                  label="Position face inside oval frame"
                />
              </div>

              {/* RIGHT: IDENTITY DOCUMENT CAMERA */}
              <div style={{
                flex: 1,
                minWidth: 260,
                maxWidth: 360,
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} style={{ color: primary }} /> ID Document Scan
                </div>
                <CameraCapture
                  mode="document"
                  onCapture={handleIdCapture}
                  onRetake={handleIdRetake}
                  capturedUrl={idUrl}
                  label={`Hold ${ID_TYPES.find(t => t.id === selectedIdType)?.label || 'ID'} flat inside frame`}
                />
              </div>

            </div>

            {error && (
              <p style={{ color: '#D32F2F', fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>{error}</p>
            )}

            {/* Bottom Action Bar inside Box */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
                onClick={() => navigate(`/kiosk/${orgId}/details`)}
                style={{ flex: 1, minHeight: 48 }}
              >
                <ArrowLeft size={18} /> Back
              </button>

              <button
                className="kiosk-btn kiosk-btn-primary"
                onClick={handleContinue}
                disabled={!faceUrl || !idUrl}
                style={{
                  flex: 2,
                  minHeight: 48,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 800,
                  background: faceUrl && idUrl ? `linear-gradient(135deg, ${primary}, #0F172A)` : '#E2E8F0',
                  color: faceUrl && idUrl ? '#FFFFFF' : '#94A3B8',
                  boxShadow: faceUrl && idUrl ? `0 8px 24px ${primary}35` : 'none',
                }}
              >
                Generate Visitor Pass <ArrowRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default IdentityVerificationPage;


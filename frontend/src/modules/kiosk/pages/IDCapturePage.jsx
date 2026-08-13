/**
 * IDCapturePage (Identity Capture) — Step 3.
 * Compact layout: Visitor Photo + ID Proof side-by-side.
 * Laptop Question (YES/NO) included here.
 * Camera is OFF by default — starts only on Capture click.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, Laptop, AlertCircle } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import CameraCapture from '../components/Camera/CameraCapture';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';

const IdentityCapturePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const [photoUrl, setPhotoUrl]   = useState(visitor.photoDataUrl || null);
  const [idUrl, setIdUrl]         = useState(visitor.idImageUrl || null);
  const [laptop, setLaptop]       = useState(visitor.laptop || 'NO');
  const [error, setError]         = useState('');

  const canContinue = !!photoUrl && !!idUrl;

  const handleNext = () => {
    if (!photoUrl) { setError('Please capture your photo.'); return; }
    if (!idUrl)    { setError('Please capture your ID proof.'); return; }

    updateVisitor({
      photoDataUrl: photoUrl,
      idImageUrl: idUrl,
      laptop,
    });

    if (laptop === 'YES') {
      navigate(`/kiosk/${orgId}/luggage`);
    } else {
      navigate(`/kiosk/${orgId}/vehicle`);
    }
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page">
        <div className="kiosk-panel">
          <KioskHeader currentStep={3} />

          {/* Title */}
          <div className="kiosk-section-title">
            <Shield size={18} style={{ color: primary }} />
            <span>Image &amp; Identity Capture</span>
          </div>
          <p className="kiosk-section-sub">Capture photo and scan ID document below. Camera activates only after clicking Capture.</p>

          {/* Dual Camera Layout */}
          <div className="kiosk-camera-grid">
            {/* LEFT: VISITOR PHOTO */}
            <div className="kiosk-camera-section">
              <div className="kiosk-camera-section-title">Visitor Photo</div>
              <CameraCapture
                mode="visitor"
                onAccept={url => { setPhotoUrl(url); setError(''); }}
                onCapture={url => { setPhotoUrl(url); setError(''); }}
                capturedUrl={photoUrl}
              />
            </div>

            {/* RIGHT: ID PROOF */}
            <div className="kiosk-camera-section">
              <div className="kiosk-camera-section-title">ID Proof</div>
              <CameraCapture
                mode="document"
                onAccept={url => { setIdUrl(url); setError(''); }}
                onCapture={url => { setIdUrl(url); setError(''); }}
                capturedUrl={idUrl}
              />
            </div>
          </div>

          {/* Laptop Checkbox */}
          <div style={{ marginTop: 16, marginBottom: 12 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                background: laptop === 'YES' ? `${primary}0D` : '#F8FAFC',
                border: `1.5px solid ${laptop === 'YES' ? primary : '#CBD5E1'}`,
                padding: '12px 16px',
                borderRadius: 12,
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="checkbox"
                checked={laptop === 'YES'}
                onChange={(e) => setLaptop(e.target.checked ? 'YES' : 'NO')}
                style={{
                  width: 20,
                  height: 20,
                  accentColor: primary,
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <Laptop size={18} style={{ color: primary }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  Carrying a Laptop
                </span>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="kiosk-error-banner">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Navigation */}
          <div className="kiosk-action-row">
            <button className="kiosk-btn kiosk-btn-back" onClick={() => navigate(`/kiosk/${orgId}/details`)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className={`kiosk-btn kiosk-btn-primary ${canContinue ? '' : 'disabled'}`}
              onClick={handleNext}
              disabled={!canContinue}
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCapturePage;

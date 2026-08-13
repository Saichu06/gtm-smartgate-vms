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

          {/* Laptop Question */}
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <label className="kiosk-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Laptop size={15} style={{ color: primary }} /> Carrying a Laptop?
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['YES', 'NO'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLaptop(val)}
                  className={`kiosk-segment-btn ${laptop === val ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    borderColor: laptop === val ? primary : '#E2E8F0',
                    background: laptop === val ? primary : '#fff',
                    color: laptop === val ? '#fff' : '#0F172A',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
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

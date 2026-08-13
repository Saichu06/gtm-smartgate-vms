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

          {/* Laptop Checkboxes (YES / NO) */}
          <div style={{ marginTop: 14, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '10px 14px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <label className="kiosk-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 13 }}>
              <Laptop size={16} style={{ color: primary }} /> Carrying a Laptop?
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {['YES', 'NO'].map(val => (
                <label
                  key={val}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: laptop === val ? `${primary}12` : 'transparent',
                    border: `1px solid ${laptop === val ? primary : '#CBD5E1'}`,
                    fontWeight: 700,
                    fontSize: 13,
                    color: laptop === val ? primary : '#334155',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={laptop === val}
                    onChange={() => setLaptop(val)}
                    style={{
                      width: 15,
                      height: 15,
                      accentColor: primary,
                      cursor: 'pointer',
                    }}
                  />
                  <span>{val}</span>
                </label>
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

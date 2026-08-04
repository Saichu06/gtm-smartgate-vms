/**
 * IDCapturePage — Screen 6. Camera-First Document Scanner Flow.
 * Select ID type -> Open camera automatically -> Capture Frame -> Preview -> Confirm -> Upload fallback.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Shield, Camera, Upload, CheckCircle, RefreshCw } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import CameraCapture from '../components/Camera/CameraCapture';
import { useVisitor } from '../context/VisitorContext';
import { ID_TYPES } from '../services/kioskApi';
import '../styles/kiosk.css';

const IDCapturePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const [selectedType, setSelectedType] = useState(visitor.idType || 'aadhaar');
  const [idImageUrl, setIdImageUrl] = useState(visitor.idImageUrl || null);
  const [error, setError] = useState('');

  const handleCapture = (url) => {
    setIdImageUrl(url);
    updateVisitor({ idType: selectedType, idImageUrl: url });
  };

  const handleRetake = () => {
    setIdImageUrl(null);
    updateVisitor({ idImageUrl: null });
  };

  const handleNext = () => {
    if (!selectedType || !idImageUrl) {
      setError('Please scan or upload your ID proof to continue.');
      return;
    }
    updateVisitor({ idType: selectedType, idImageUrl });
    navigate(`/kiosk/${orgId}/review`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <KioskHeader />
      <ProgressStepper currentStep={4} />

      <div className="kiosk-page">
        <div className="kiosk-content kiosk-content-md" style={{ margin: '0 auto', maxWidth: 740 }}>

          <button
            className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
            onClick={() => navigate(`/kiosk/${orgId}/photo`)}
            style={{ marginBottom: 20 }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="kiosk-page-title">
            <Shield size={32} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
            Identity Verification
          </div>
          <p className="kiosk-page-sub">Select document type and scan your ID flat in front of the camera scanner.</p>

          {/* Document Type Cards */}
          <div className="kiosk-section-card" style={{ marginBottom: 24 }}>
            <div className="kiosk-section-card-header">
              <span style={{ fontWeight: 700, fontSize: 15 }}>1. Select Document Type</span>
            </div>
            <div className="kiosk-section-card-body">
              <div className="kiosk-id-grid">
                {ID_TYPES.map(id => (
                  <div
                    key={id.id}
                    className={`kiosk-id-card ${selectedType === id.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedType(id.id); setError(''); }}
                  >
                    <div className="kiosk-id-icon" style={{ background: `${id.color}18`, fontSize: 26 }}>
                      {id.icon}
                    </div>
                    <div className="kiosk-id-label">{id.label}</div>
                    <div className="kiosk-id-sub">{id.description}</div>
                    {selectedType === id.id && (
                      <div style={{ marginTop: 4 }}>
                        <CheckCircle size={18} style={{ color: primary }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Camera-First Document Scanner */}
          {selectedType && (
            <div className="kiosk-section-card" style={{ marginBottom: 24 }}>
              <div className="kiosk-section-card-header">
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  2. Scan {ID_TYPES.find(t => t.id === selectedType)?.label} Document
                </span>
              </div>
              <div className="kiosk-section-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CameraCapture
                  mode="document"
                  onCapture={handleCapture}
                  onRetake={handleRetake}
                  capturedUrl={idImageUrl}
                  label="Hold ID document flat inside the rectangular frame and tap Capture"
                />
              </div>
            </div>
          )}

          {error && (
            <p style={{ color: '#D32F2F', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>{error}</p>
          )}

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              className="kiosk-btn kiosk-btn-secondary kiosk-btn-sm"
              onClick={() => navigate(`/kiosk/${orgId}/review`)}
            >
              Skip ID Step
            </button>
            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={handleNext}
              disabled={!idImageUrl}
              style={{
                background: `linear-gradient(135deg, ${primary}, #0F172A)`,
                color: '#FFFFFF',
                minWidth: 220,
              }}
            >
              Review & Confirm <ArrowRight size={22} />
            </button>
          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default IDCapturePage;

/**
 * CameraCapture — Universal Multi-Mode Camera Component.
 * Supports modes:
 * - mode="visitor" : Oval face guide frame for visitor photo capture
 * - mode="document": Rectangular alignment frame for ID proof / document capture
 * - mode="badge"   : Square alignment frame for QR / barcode scanning
 *
 * Includes Future AI Hook placeholders:
 * - faceMatch()
 * - idOcr()
 * - livenessDetection()
 * - blacklistDetection()
 * - anpr()
 */
import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle, VideoOff, Shield, Scan, Sparkles } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';

const FALLBACK_IMGS = {
  visitor: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  document: 'https://picsum.photos/seed/idcard/600/380',
  badge: 'https://picsum.photos/seed/badge/400/400',
};

const CameraCapture = ({
  mode = 'visitor', // 'visitor', 'document', 'badge'
  onCapture,
  onRetake,
  capturedUrl,
  label,
  // Future AI Hook Props (architecture placeholders)
  aiHooks = {
    faceMatch: false,
    idOcr: false,
    livenessDetection: false,
    blacklistDetection: false,
    anpr: false,
  },
}) => {
  const { org } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraState, setCameraState] = useState(capturedUrl ? 'captured' : 'initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState(capturedUrl || null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Default labels based on mode
  const defaultLabel = mode === 'document'
    ? 'Place ID card flat inside the rectangular frame'
    : mode === 'badge'
      ? 'Align QR code inside the square scanner box'
      : 'Position your face inside the oval frame and tap Capture';

  const activeLabel = label || defaultLabel;

  // Request browser webcam stream
  const startCamera = async () => {
    setCameraState('initializing');
    setErrorMessage('');
    setAiAnalysis(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode === 'document' ? 'environment' : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraState('streaming');
      } else {
        throw new Error('Camera API not supported');
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setErrorMessage('Live camera feed unavailable or denied. Simulation active.');
      setCameraState('error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (!capturedUrl && cameraState !== 'captured') {
      startCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Future AI Hook Execution Simulation Placeholder
  const runAiHooks = (dataUrl) => {
    if (mode === 'visitor') {
      setAiAnalysis({
        liveness: '99.8% Passed',
        faceMatch: 'Verified Unique Visitor',
        blacklistCheck: 'Clear (0 Flags)',
      });
    } else if (mode === 'document') {
      setAiAnalysis({
        idOcr: 'Name & DOB Extracted',
        tamperCheck: 'Authentic Document',
      });
    }
  };

  const handleTakeSnapshot = () => {
    let dataUrl = FALLBACK_IMGS[mode] || FALLBACK_IMGS.visitor;

    if (cameraState === 'streaming' && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    }

    setCapturedImage(dataUrl);
    setCameraState('captured');
    runAiHooks(dataUrl);
    stopCamera();
    if (onCapture) onCapture(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAiAnalysis(null);
    if (onRetake) onRetake();
    startCamera();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Main Camera Frame */}
      <div className="kiosk-camera-wrap" style={{
        borderColor: primary,
        aspectRatio: mode === 'document' ? '16 / 10' : mode === 'badge' ? '1 / 1' : '4 / 3',
        maxWidth: mode === 'badge' ? 240 : 300,
        borderRadius: 14,
      }}>

        {cameraState === 'captured' ? (
          <>
            <img
              className="kiosk-camera-captured-img"
              src={capturedImage}
              alt="Captured Frame"
            />
            <div className="kiosk-camera-success-badge" style={{ fontSize: 12, padding: '4px 12px' }}>
              <CheckCircle size={14} /> {mode === 'document' ? 'ID Captured' : 'Photo Captured'}
            </div>
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: cameraState === 'streaming' ? 'block' : 'none',
              }}
            />

            {cameraState === 'initializing' && (
              <div className="kiosk-camera-placeholder">
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `3px solid ${primary}30`,
                  borderTopColor: primary,
                  animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>
                  Initializing camera feed...
                </p>
              </div>
            )}

            {cameraState === 'error' && (
              <div className="kiosk-camera-placeholder" style={{ background: '#0F172A', padding: 12 }}>
                <VideoOff size={32} style={{ color: '#EF4444' }} />
                <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 700, margin: '2px 0' }}>
                  Camera Feed Unavailable
                </p>
                <p style={{ color: '#94A3B8', fontSize: 11, margin: 0 }}>
                  {errorMessage}
                </p>
                <button
                  className="kiosk-btn kiosk-btn-sm"
                  onClick={handleTakeSnapshot}
                  style={{
                    marginTop: 8, background: primary, color: '#fff', fontSize: 12, minHeight: 34, padding: '0 14px', borderRadius: 8
                  }}
                >
                  <Camera size={13} /> Sample Frame
                </button>
              </div>
            )}

            {/* Mode-Based Overlays */}
            {cameraState === 'streaming' && (
              <div className="kiosk-camera-overlay">
                {mode === 'visitor' && (
                  <div className="kiosk-face-guide" style={{ borderColor: primary, width: 140, height: 180, borderRadius: 90 }} />
                )}
                {mode === 'document' && (
                  <div style={{
                    width: '85%', height: '70%',
                    border: `2px dashed ${primary}`,
                    borderRadius: 10,
                    boxShadow: '0 0 0 9999px rgba(15,23,42,0.5)',
                  }} />
                )}
                {mode === 'badge' && (
                  <div style={{
                    width: '65%', height: '65%',
                    border: `2px solid ${primary}`,
                    borderRadius: 12,
                    boxShadow: '0 0 0 9999px rgba(15,23,42,0.6)',
                  }} />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Helper Text */}
      {cameraState === 'streaming' && (
        <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', margin: 0, fontWeight: 500 }}>
          {activeLabel}
        </p>
      )}

      {/* Buttons — Only Retake (when captured) or Capture (when streaming) */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {cameraState === 'captured' ? (
          <button className="kiosk-btn kiosk-btn-secondary kiosk-btn-sm" onClick={handleRetake} style={{ minHeight: 38, fontSize: 13, padding: '0 16px' }}>
            <RefreshCw size={15} /> Retake
          </button>
        ) : (
          <button
            className="kiosk-btn kiosk-btn-primary kiosk-btn-sm"
            onClick={handleTakeSnapshot}
            disabled={cameraState === 'initializing'}
            style={{
              background: `linear-gradient(135deg, ${primary}, #0F172A)`,
              color: '#FFFFFF',
              boxShadow: `0 6px 18px ${primary}35`,
              minWidth: 160,
              minHeight: 40,
              fontSize: 14
            }}
          >
            <Camera size={16} /> Capture
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;

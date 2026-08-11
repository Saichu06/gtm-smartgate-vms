/**
 * CameraCapture — Universal Multi-Mode Camera Component for Visitor Kiosk.
 * 
 * CAMERA LIFECYCLE REQUIREMENTS:
 * - Camera MUST NOT start on page load (Initial state: 'idle').
 * - Clicking 'Capture' initializes and opens camera ('requesting' -> 'streaming').
 * - Taking snapshot stops active video tracks and shows preview ('preview').
 * - 'Accept' finalizes capture and calls onAccept(dataUrl).
 * - 'Retake' re-enables camera stream.
 * - Leaving page / unmount stops ALL MediaStreamTracks (track.stop()).
 */
import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, CheckCircle2, VideoOff, ScanLine, User, CreditCard } from 'lucide-react';
import { useVisitor } from '../../context/VisitorContext';

const CameraCapture = ({
  mode = 'visitor', // 'visitor' (photo) or 'document' (ID proof)
  onCapture,        // Callback when photo/ID is accepted or captured
  onAccept,         // Callback on explicit accept
  onRetake,         // Callback on retake
  capturedUrl = null,
  label = '',
}) => {
  const { org } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  // States: 'idle' | 'requesting' | 'streaming' | 'preview' | 'accepted' | 'error'
  const [cameraState, setCameraState] = useState(capturedUrl ? 'accepted' : 'idle');
  const [capturedImage, setCapturedImage] = useState(capturedUrl || null);
  const [errorMessage, setErrorMessage] = useState('');

  // Stop all camera tracks
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  // Cleanup tracks on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  // Update captured image if prop changes externally
  useEffect(() => {
    if (capturedUrl) {
      setCapturedImage(capturedUrl);
      setCameraState('accepted');
    }
  }, [capturedUrl]);

  // Request browser webcam stream ONLY when triggered by user action
  const startCamera = async () => {
    stopCamera();
    setCameraState('requesting');
    setErrorMessage('');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const facingMode = mode === 'document' ? 'environment' : 'user';
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
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
        throw new Error('Camera API not supported in this browser environment');
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      setErrorMessage('Camera access denied or unavailable. Using sample capture simulation.');
      setCameraState('error');
    }
  };

  // Take snapshot from video element or fallback simulation
  const handleTakeSnapshot = () => {
    let dataUrl = null;

    if (cameraState === 'streaming' && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        }
      } catch (err) {
        console.error('Error drawing canvas snapshot:', err);
      }
    }

    // Fallback placeholder if canvas fails or simulation active
    if (!dataUrl) {
      dataUrl = mode === 'document'
        ? 'https://picsum.photos/seed/idproof/600/380'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
    }

    setCapturedImage(dataUrl);
    setCameraState('preview');
    stopCamera();
    if (onCapture) onCapture(dataUrl);
  };

  const handleAccept = () => {
    setCameraState('accepted');
    stopCamera();
    if (onAccept) onAccept(capturedImage);
    else if (onCapture) onCapture(capturedImage);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCameraState('idle');
    if (onRetake) onRetake();
    startCamera();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera / Image Container Card */}
      <div
        className="kiosk-camera-wrap"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: mode === 'document' ? 340 : 280,
          aspectRatio: mode === 'document' ? '16 / 10' : '4 / 3',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#0F172A',
          border: `2px solid ${cameraState === 'accepted' ? '#2E7D32' : primary}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
        }}
      >
        {/* IDLE STATE: CAMERA IS OFF — CLEAN LUCIDE PLACEHOLDER */}
        {cameraState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16, textAlign: 'center', color: '#94A3B8' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary }}>
              {mode === 'document' ? <CreditCard size={28} /> : <User size={28} />}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
              {mode === 'document' ? 'ID Proof Document' : 'Visitor Photo'}
            </div>
            <div style={{ fontSize: 11, color: '#64748B' }}>
              Tap Capture to start camera
            </div>
          </div>
        )}

        {/* REQUESTING / INITIALIZING STATE */}
        {cameraState === 'requesting' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#F8FAFC' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `3px solid ${primary}40`, borderTopColor: primary,
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Opening camera...</span>
          </div>
        )}

        {/* LIVE STREAMING STATE */}
        {cameraState === 'streaming' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="kiosk-camera-overlay">
              {mode === 'visitor' ? (
                <div style={{ width: 130, height: 160, borderRadius: '50%', border: `2px dashed ${primary}`, boxShadow: '0 0 0 9999px rgba(15,23,42,0.4)' }} />
              ) : (
                <div style={{ width: '85%', height: '70%', borderRadius: 8, border: `2px dashed ${primary}`, boxShadow: '0 0 0 9999px rgba(15,23,42,0.4)' }} />
              )}
            </div>
          </>
        )}

        {/* PREVIEW & ACCEPTED STATES */}
        {(cameraState === 'preview' || cameraState === 'accepted') && capturedImage && (
          <>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {cameraState === 'accepted' && (
              <div style={{
                position: 'absolute', bottom: 8, right: 8,
                background: '#2E7D32', color: '#fff',
                borderRadius: 20, padding: '4px 10px',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                <CheckCircle2 size={13} /> {mode === 'document' ? 'ID Accepted' : 'Photo Accepted'}
              </div>
            )}
          </>
        )}

        {/* ERROR STATE */}
        {cameraState === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, textAlign: 'center' }}>
            <VideoOff size={28} style={{ color: '#EF4444' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>Camera Feed Unavailable</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>{errorMessage}</span>
            <button
              type="button"
              className="kiosk-btn kiosk-btn-sm"
              onClick={handleTakeSnapshot}
              style={{ marginTop: 4, minHeight: 32, padding: '0 12px', fontSize: 11, background: primary, color: '#fff' }}
            >
              Use Sample Capture
            </button>
          </div>
        )}
      </div>

      {/* CONTROL BUTTONS BASED ON STATE */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {/* IDLE / START CAMERA BUTTON */}
        {cameraState === 'idle' && (
          <button
            type="button"
            className="kiosk-btn kiosk-btn-primary kiosk-btn-sm"
            onClick={startCamera}
            style={{ minHeight: 40, padding: '0 20px', fontSize: 13 }}
          >
            <Camera size={16} /> {mode === 'document' ? 'Capture ID' : 'Capture Photo'}
          </button>
        )}

        {/* STREAMING: TAKE SNAPSHOT BUTTON */}
        {cameraState === 'streaming' && (
          <button
            type="button"
            className="kiosk-btn kiosk-btn-primary kiosk-btn-sm"
            onClick={handleTakeSnapshot}
            style={{ minHeight: 40, padding: '0 20px', fontSize: 13, background: `linear-gradient(135deg, ${primary}, #0F172A)` }}
          >
            <Camera size={16} /> Take Snapshot
          </button>
        )}

        {/* PREVIEW: RETAKE & ACCEPT BUTTONS */}
        {cameraState === 'preview' && (
          <>
            <button
              type="button"
              className="kiosk-btn kiosk-btn-secondary kiosk-btn-sm"
              onClick={handleRetake}
              style={{ minHeight: 38, padding: '0 14px', fontSize: 12 }}
            >
              <RefreshCw size={14} /> Retake
            </button>
            <button
              type="button"
              className="kiosk-btn kiosk-btn-primary kiosk-btn-sm"
              onClick={handleAccept}
              style={{ minHeight: 38, padding: '0 18px', fontSize: 12, background: '#2E7D32' }}
            >
              <Check size={14} /> Accept
            </button>
          </>
        )}

        {/* ACCEPTED: OPTION TO RETAKE IF NEEDED */}
        {cameraState === 'accepted' && (
          <button
            type="button"
            className="kiosk-btn kiosk-btn-secondary kiosk-btn-sm"
            onClick={handleRetake}
            style={{ minHeight: 32, padding: '0 12px', fontSize: 11, height: 32 }}
          >
            <RefreshCw size={13} /> Change
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;

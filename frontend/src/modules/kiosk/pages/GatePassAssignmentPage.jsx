/**
 * GatePassAssignmentPage — Step 6 (or 5 when Laptop=NO).
 * Compact selection of available physical gate passes.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tag, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import { useVisitor } from '../context/VisitorContext';
import { getAvailablePasses, assignGatePass } from '../services/gatePassApi';
import '../styles/kiosk.css';

const GatePassAssignmentPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';
  const isLaptop  = visitor.laptop === 'YES';
  const stepNumber = isLaptop ? 6 : 5;

  const [availablePasses, setAvailablePasses] = useState([]);
  const [selectedPass, setSelectedPass]       = useState(null);
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState('');

  useEffect(() => {
    const passes = getAvailablePasses(orgId);
    setAvailablePasses(passes);
    if (passes.length > 0) setSelectedPass(passes[0]);
    setIsLoading(false);
  }, [orgId]);

  const handleBack = () => {
    navigate(`/kiosk/${orgId}/vehicle`);
  };

  const handleContinue = () => {
    if (!selectedPass) { setError('Please select a gate pass to continue.'); return; }
    assignGatePass(orgId, selectedPass.id, visitor.visitId);
    updateVisitor({ assignedPass: selectedPass });
    navigate(`/kiosk/${orgId}/pass`);
  };

  const refreshPasses = () => {
    setIsLoading(true);
    setTimeout(() => {
      const passes = getAvailablePasses(orgId);
      setAvailablePasses(passes);
      if (passes.length > 0) setSelectedPass(passes[0]);
      else setSelectedPass(null);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page">
        <div className="kiosk-panel">
          <KioskHeader currentStep={stepNumber} />

          <div className="kiosk-section-title">
            <Tag size={18} style={{ color: primary }} />
            <span>Gate Pass Number</span>
          </div>
          <p className="kiosk-section-sub">Select the physical gate pass being issued to you by security.</p>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Loading available passes...</span>
            </div>
          ) : availablePasses.length === 0 ? (
            <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
              <AlertTriangle size={24} style={{ color: '#F59E0B', marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 15, color: '#92400E', marginBottom: 4 }}>No Passes Available</div>
              <div style={{ fontSize: 12, color: '#B45309', marginBottom: 12 }}>All gate passes are currently assigned. Contact the security desk.</div>
              <button type="button" className="kiosk-btn kiosk-btn-back" onClick={refreshPasses} style={{ minHeight: 36, fontSize: 12 }}>Refresh</button>
            </div>
          ) : (
            <div className="kiosk-form-stack">
              {/* Dropdown select */}
              <div className="kiosk-field">
                <label className="kiosk-label">Gate Pass Number * ({availablePasses.length} available)</label>
                <div className="kiosk-input-wrap">
                  <Tag size={16} style={{ color: primary, marginRight: 8 }} />
                  <select
                    className="kiosk-input"
                    value={selectedPass?.id || ''}
                    onChange={e => {
                      const pass = availablePasses.find(p => p.id === e.target.value);
                      setSelectedPass(pass);
                      setError('');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {availablePasses.map(pass => (
                      <option key={pass.id} value={pass.id}>
                        {pass.name} ({pass.gate}) — Available
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pass tiles (compact) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {availablePasses.map(pass => (
                  <button
                    key={pass.id}
                    type="button"
                    onClick={() => { setSelectedPass(pass); setError(''); }}
                    className="kiosk-pass-tile"
                    style={{
                      borderColor: selectedPass?.id === pass.id ? primary : '#E2E8F0',
                      background: selectedPass?.id === pass.id ? `${primary}12` : '#F8FAFC',
                      color: selectedPass?.id === pass.id ? primary : '#475569',
                    }}
                  >
                    {selectedPass?.id === pass.id && <CheckCircle2 size={13} style={{ color: primary }} />}
                    {pass.name}
                  </button>
                ))}
              </div>

              {/* Selected confirmation */}
              {selectedPass && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <CheckCircle2 size={16} style={{ color: '#2E7D32', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 800, color: '#166534' }}>{selectedPass.name}</span>
                    <span style={{ color: '#15803D' }}> — {selectedPass.gate} — Ready to assign</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="kiosk-error-banner">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div className="kiosk-action-row">
            <button className="kiosk-btn kiosk-btn-back" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={handleContinue}
              disabled={!selectedPass || availablePasses.length === 0}
            >
              Generate Pass <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatePassAssignmentPage;

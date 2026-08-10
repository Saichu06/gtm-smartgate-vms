import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tag, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import { getAvailablePasses, assignGatePass } from '../services/gatePassApi';
import '../styles/kiosk.css';

const GatePassAssignmentPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';

  const [availablePasses, setAvailablePasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPass, setSelectedPass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const passes = getAvailablePasses(orgId);
    setAvailablePasses(passes);
    if (passes.length > 0) {
      setSelectedPass(passes[0]);
    }
    setIsLoading(false);
  }, [orgId]);

  const filteredPasses = availablePasses.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.gate && p.gate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleContinue = () => {
    if (!selectedPass) {
      setError('Please select a gate pass to continue.');
      return;
    }
    assignGatePass(orgId, selectedPass.id, visitor.visitId);
    updateVisitor({ assignedPass: selectedPass });
    navigate(`/kiosk/${orgId}/pass`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <div
        className="kiosk-page"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: 640, width: '100%' }}>

          {/* Main Card */}
          <div
            className="kiosk-section-card"
            style={{ padding: '24px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
          >
            {/* In-Box Header (Dual Logos + Step 4/4 Counter) */}
            <KioskHeader currentStep={4} />

            {/* Title Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `${primary}15`,
                border: `2px solid ${primary}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Tag size={24} style={{ color: primary }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Gate Pass Assignment
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', maxWidth: 440, margin: 0 }}>
                Select the physical gate pass being issued to you by security.
              </p>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: 14 }}>
                Loading available passes...
              </div>
            ) : availablePasses.length === 0 ? (
              <div style={{
                background: '#FFF7ED', border: '2px solid #FED7AA', borderRadius: 14,
                padding: '20px 24px', textAlign: 'center',
              }}>
                <AlertTriangle size={30} style={{ color: '#F59E0B', marginBottom: 8 }} />
                <div style={{ fontWeight: 800, fontSize: 16, color: '#92400E', marginBottom: 4 }}>
                  No Passes Available
                </div>
                <div style={{ fontSize: 13, color: '#B45309' }}>
                  All gate passes are currently assigned. Please contact the security desk.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Search Bar */}
                <div className="kiosk-field">
                  <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>
                    SEARCH GATE PASS
                  </label>
                  <div className="kiosk-input-card" style={{ minHeight: 44, padding: '0 12px' }}>
                    <Search size={18} style={{ color: primary, flexShrink: 0, marginRight: 8 }} />
                    <input
                      type="text"
                      placeholder="Type pass number or gate name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ fontSize: 15, fontWeight: 700, minHeight: 38 }}
                    />
                  </div>
                </div>

                {/* Searchable Select Dropdown */}
                <div className="kiosk-field">
                  <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>
                    SELECT GATE PASS ({filteredPasses.length} AVAILABLE) *
                  </label>
                  <div className="kiosk-input-card" style={{ borderColor: primary, minHeight: 46, padding: '0 12px' }}>
                    <Tag size={18} style={{ color: primary, flexShrink: 0, marginRight: 8 }} />
                    <select
                      value={selectedPass?.id || ''}
                      onChange={e => {
                        const pass = availablePasses.find(p => p.id === e.target.value);
                        setSelectedPass(pass);
                        setError('');
                      }}
                      style={{ fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 40, width: '100%' }}
                    >
                      {filteredPasses.map(pass => (
                        <option key={pass.id} value={pass.id}>
                          {pass.name} — ({pass.gate}) [AVAILABLE]
                        </option>
                      ))}
                      {filteredPasses.length === 0 && (
                        <option value="" disabled>No passes matching "{searchQuery}"</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Selected Confirmation Banner */}
                {selectedPass && (
                  <div style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    animation: 'kioskFadeIn 0.2s ease',
                  }}>
                    <CheckCircle2 size={20} style={{ color: '#2E7D32', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#166534' }}>
                        {selectedPass.name} ({selectedPass.gate}) Selected
                      </div>
                      <div style={{ fontSize: 12, color: '#15803D' }}>
                        Pass will be marked assigned to your visitor record.
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {error && (
              <div style={{ color: '#D32F2F', fontSize: 12, fontWeight: 700, marginTop: 12 }}>
                {error}
              </div>
            )}

            {/* Bottom Action Bar inside Box */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
                onClick={() => navigate(`/kiosk/${orgId}/identity`)}
                style={{ flex: 1, minHeight: 48 }}
              >
                <ArrowLeft size={18} /> Back
              </button>

              <button
                className="kiosk-btn kiosk-btn-primary"
                onClick={handleContinue}
                disabled={!selectedPass || availablePasses.length === 0}
                style={{
                  flex: 2,
                  minHeight: 48,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 800,
                  background: selectedPass
                    ? `linear-gradient(135deg, ${primary}, ${secondary})`
                    : '#E2E8F0',
                  color: selectedPass ? '#FFFFFF' : '#94A3B8',
                  boxShadow: selectedPass ? `0 8px 24px ${primary}35` : 'none',
                }}
              >
                Generate Visitor Badge <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default GatePassAssignmentPage;

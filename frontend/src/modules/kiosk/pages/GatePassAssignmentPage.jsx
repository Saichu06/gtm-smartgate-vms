/**
 * GatePassAssignmentPage — Screen 4A: Gate Pass Assignment (4-Screen Kiosk Flow)
 *
 * Shows available physical gate passes as large tap-to-select tiles.
 * No floating dropdowns — all passes visible inline, page scrolls naturally.
 * The kiosk NEVER generates or creates pass numbers.
 *
 * Flow:
 *  Tap Available Gate Pass tile → Continue enabled → Assign (available → assigned)
 *  → Navigate to /kiosk/:orgId/pass (badge + print)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tag, CheckCircle2, AlertTriangle } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import { gatePassApi } from '@services/vmsApi';
import '../styles/kiosk.css';

const GatePassAssignmentPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';

  const [availablePasses, setAvailablePasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPasses = async () => {
      setIsLoading(true);
      try {
        const res = await gatePassApi.getGatePasses(orgId, 'available');
        if (res.success && Array.isArray(res.data)) {
          setAvailablePasses(res.data.filter(p => p.status === 'available'));
        }
      } catch (err) {
        console.error('Failed to load gate passes:', err);
        setAvailablePasses([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadPasses();
  }, [orgId]);

  const handleSelectPass = (pass) => {
    setSelectedPass(prev => prev?.id === pass.id ? null : pass);
    setError('');
  };

  const handleContinue = () => {
    if (!selectedPass) {
      setError('Please select a gate pass to continue.');
      return;
    }
    // Store selected pass in kiosk context — actual DB assignment happens
    // atomically when the visitor is registered (POST /visitors with gatePassId)
    updateVisitor({ assignedPass: selectedPass });
    navigate(`/kiosk/${orgId}/pass`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <KioskHeader currentStep={4} />

      {/* Scrollable page area */}
      <div
        className="kiosk-page"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: 700, width: '100%' }}>

          {/* Back Nav */}
          <div style={{ marginBottom: 20 }}>
            <button
              className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
              onClick={() => navigate(`/kiosk/${orgId}/identity`)}
              style={{ minHeight: 48 }}
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>

          {/* Main Card */}
          <div
            className="kiosk-section-card"
            style={{ padding: '36px 40px', boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
          >

            {/* Icon + Title */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, textAlign: 'center' }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: `${primary}15`,
                border: `2px solid ${primary}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <Tag size={30} style={{ color: primary }} />
              </div>
              <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
                Gate Pass Assignment
              </h2>
              <p style={{ fontSize: 16, color: '#64748B', maxWidth: 440, margin: 0, lineHeight: 1.6 }}>
                Select the physical gate pass being issued to you by security.
              </p>
            </div>

            {/* Pass Tiles */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: 15 }}>
                Loading available passes...
              </div>
            ) : availablePasses.length === 0 ? (
              <div style={{
                background: '#FFF7ED', border: '2px solid #FED7AA', borderRadius: 16,
                padding: '28px 32px', textAlign: 'center',
              }}>
                <AlertTriangle size={36} style={{ color: '#F59E0B', marginBottom: 10 }} />
                <div style={{ fontWeight: 800, fontSize: 18, color: '#92400E', marginBottom: 8 }}>
                  No Passes Available
                </div>
                <div style={{ fontSize: 14, color: '#B45309' }}>
                  All gate passes are currently assigned. Please contact the security desk.
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: '#94A3B8',
                  letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
                }}>
                  {availablePasses.length} Available Pass{availablePasses.length !== 1 ? 'es' : ''}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {availablePasses.map((pass) => {
                    const isSelected = selectedPass?.id === pass.id;
                    return (
                      <button
                        key={pass.id}
                        onClick={() => handleSelectPass(pass)}
                        style={{
                          width: '100%',
                          minHeight: 76,
                          background: isSelected ? `${primary}08` : '#FAFAFA',
                          border: `2.5px solid ${isSelected ? primary : '#E2E8F0'}`,
                          borderRadius: 18,
                          padding: '16px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          outline: 'none',
                          boxShadow: isSelected ? `0 0 0 4px ${primary}20` : 'none',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                          <div style={{
                            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                            background: isSelected
                              ? `linear-gradient(135deg, ${primary}, ${secondary})`
                              : `${primary}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.18s ease',
                          }}>
                            <Tag size={22} color={isSelected ? '#fff' : primary} />
                          </div>
                          <div>
                            <div style={{
                              fontSize: 20, fontWeight: 800,
                              color: isSelected ? primary : '#0F172A',
                              lineHeight: 1.2,
                            }}>
                              {pass.name}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                              {pass.gate}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                            padding: '5px 14px', borderRadius: 999,
                            background: '#F0FDF4', color: '#2E7D32', border: '1.5px solid #BBF7D0',
                          }}>
                            AVAILABLE
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={26} style={{ color: primary }} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div style={{ color: '#D32F2F', fontSize: 13, fontWeight: 700, marginTop: 14 }}>
                {error}
              </div>
            )}

            {/* Selected Pass Confirmation */}
            {selectedPass && (
              <div style={{
                marginTop: 20,
                background: '#F0FDF4',
                border: '2px solid #BBF7D0',
                borderRadius: 16,
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                animation: 'kioskFadeIn 0.2s ease',
              }}>
                <CheckCircle2 size={24} style={{ color: '#2E7D32', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#166534' }}>
                    {selectedPass.name} selected
                  </div>
                  <div style={{ fontSize: 12, color: '#15803D' }}>
                    This pass will be marked <strong>Assigned</strong> when you continue.
                  </div>
                </div>
              </div>
            )}

            {/* Continue CTA */}
            <button
              className="kiosk-btn kiosk-btn-primary kiosk-btn-full"
              onClick={handleContinue}
              disabled={!selectedPass || availablePasses.length === 0}
              style={{
                marginTop: 28,
                minHeight: 70,
                borderRadius: 20,
                fontSize: 21,
                fontWeight: 800,
                background: selectedPass
                  ? `linear-gradient(135deg, ${primary}, ${secondary})`
                  : '#E2E8F0',
                color: selectedPass ? '#FFFFFF' : '#94A3B8',
                boxShadow: selectedPass ? `0 12px 36px ${primary}40` : 'none',
                cursor: selectedPass ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              Continue — Generate Visitor Badge <ArrowRight size={22} />
            </button>

          </div>
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default GatePassAssignmentPage;

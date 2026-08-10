/**
 * EmployeeSelectionPage — Screen 4. Search & select host from org employee directory.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, Users, CheckCircle, AlertCircle } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';
import { searchEmployees } from '../services/kioskApi';

const AVAIL_COLORS = { available: '#2E7D32', busy: '#ED6C02', away: '#94A3B8' };
const AVAIL_LABELS = { available: 'Available', busy: 'In a Meeting', away: 'Away' };

const EmployeeCard = ({ emp, selected, onSelect }) => (
  <div
    className={`kiosk-emp-card ${selected ? 'selected' : ''}`}
    onClick={() => onSelect(emp)}
  >
    <div className="kiosk-emp-avatar" style={{ background: emp.color }}>
      {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
    </div>
    <div className="kiosk-emp-info" style={{ flex: 1, minWidth: 0 }}>
      <h4>{emp.name}</h4>
      <p>{emp.designation}</p>
      <p style={{ color: '#94A3B8' }}>{emp.department}</p>
      <div className="kiosk-avail" style={{ color: AVAIL_COLORS[emp.availability] }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: AVAIL_COLORS[emp.availability], display: 'inline-block' }} />
        {AVAIL_LABELS[emp.availability]}
      </div>
      <div className="kiosk-emp-floor">{emp.floor}</div>
    </div>
    {selected && (
      <CheckCircle size={24} style={{ color: '#2E7D32', flexShrink: 0 }} />
    )}
  </div>
);

const EmployeeSelectionPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(visitor.host || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchEmployees(query, orgId);
      setResults(res);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, orgId]);

  const handleNext = () => {
    updateVisitor({ host: selected });
    navigate(`/kiosk/${orgId}/photo`);
  };

  const handleSkip = () => {
    updateVisitor({ host: null });
    navigate(`/kiosk/${orgId}/photo`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content" style={{ margin: '0 auto', maxWidth: 740, padding: 0 }}>

          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>

            {/* In-Box Header (Dual Logos + Step 2/4 Counter) */}
            <KioskHeader currentStep={2} />

            <div style={{ marginBottom: 16 }}>
              <div className="kiosk-page-title" style={{ fontSize: 22, margin: '0 0 4px' }}>
                <Users size={24} style={{ color: primary, verticalAlign: 'middle', marginRight: 8 }} />
                Who are you visiting?
              </div>
              <p className="kiosk-page-sub" style={{ fontSize: 13, margin: 0 }}>
                Optionally select a host from <strong>{org?.displayName || org?.name}</strong> employee directory, or skip for walk-in visits.
              </p>
            </div>

            <div className="kiosk-input-card" style={{ marginBottom: 16, minHeight: 44, padding: '0 12px' }}>
              <div className="kiosk-input-icon"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Search by name, department..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ fontSize: 15, fontWeight: 700, minHeight: 38 }}
                autoFocus
              />
            </div>

            {selected && (
              <div style={{
                background: '#F0FDF4', border: '1.5px solid #BBF7D0',
                borderRadius: 12, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 16, animation: 'kioskFadeUp 0.3s ease',
              }}>
                <CheckCircle size={18} style={{ color: '#2E7D32', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                  Selected: <span style={{ color: '#2E7D32' }}>{selected.name}</span>
                  <span style={{ color: '#64748B', fontWeight: 500, fontSize: 12 }}> · {selected.designation} · {selected.floor}</span>
                </span>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: primary, animation: 'spin 0.9s linear infinite', margin: '0 auto 10px' }} />
                Loading {org?.displayName || 'organization'} employees...
              </div>
            ) : results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8', fontSize: 14 }}>
                <AlertCircle size={40} style={{ opacity: 0.4, marginBottom: 10, color: '#F57C00' }} />
                <p style={{ fontWeight: 600, color: '#334155', margin: 0 }}>No employees found</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>
                  {query
                    ? `No match for "${query}" in directory.`
                    : 'No active employees in directory. Continue as walk-in.'}
                </p>
              </div>
            ) : (
              <div className="kiosk-emp-grid" style={{ gap: 12 }}>
                {results.map(emp => (
                  <EmployeeCard
                    key={emp.id}
                    emp={emp}
                    selected={selected?.id === emp.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            )}

            {/* Bottom Action Bar inside Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12, flexWrap: 'wrap' }}>
              <button
                className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
                onClick={() => navigate(`/kiosk/${orgId}/details`)}
                style={{ minHeight: 44, padding: '0 16px' }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="kiosk-btn kiosk-btn-secondary kiosk-btn-sm"
                  onClick={handleSkip}
                  style={{ minHeight: 44, fontSize: 14 }}
                >
                  Skip — Walk-in
                </button>
                <button
                  className="kiosk-btn kiosk-btn-primary kiosk-btn-sm"
                  onClick={handleNext}
                  disabled={!selected}
                  style={{ minHeight: 44, fontSize: 14, minWidth: 160 }}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default EmployeeSelectionPage;

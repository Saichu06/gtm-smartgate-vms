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
      <KioskHeader />
      <ProgressStepper currentStep={2} />

      <div className="kiosk-page">
        <div className="kiosk-content" style={{ margin: '0 auto' }}>

          <button
            className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
            onClick={() => navigate(`/kiosk/${orgId}/details`)}
            style={{ marginBottom: 24 }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
            <div>
              <div className="kiosk-page-title">
                <Users size={30} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
                Who are you visiting?
              </div>
              <p className="kiosk-page-sub">
                Optionally select a host from <strong>{org?.displayName || org?.name}</strong> employee directory, or skip for walk-in visits.
              </p>
            </div>
            {selected && (
              <button
                className="kiosk-btn kiosk-btn-primary"
                onClick={handleNext}
                style={{ flexShrink: 0 }}
              >
                Continue <ArrowRight size={22} />
              </button>
            )}
          </div>

          <div className="kiosk-input-card" style={{ marginBottom: 24 }}>
            <div className="kiosk-input-icon"><Search size={22} /></div>
            <input
              type="text"
              placeholder="Search by name, department..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {selected && (
            <div style={{
              background: '#F0FDF4', border: '2px solid #BBF7D0',
              borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 20, animation: 'kioskFadeUp 0.3s ease',
            }}>
              <CheckCircle size={20} style={{ color: '#2E7D32', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>
                Selected: <span style={{ color: '#2E7D32' }}>{selected.name}</span>
                <span style={{ color: '#64748B', fontWeight: 500, fontSize: 13 }}> · {selected.designation} · {selected.floor}</span>
              </span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: primary, animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
              Loading {org?.displayName || 'organization'} employees...
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 16 }}>
              <AlertCircle size={48} style={{ opacity: 0.4, marginBottom: 12, color: '#F57C00' }} />
              <p style={{ fontWeight: 600, color: '#334155' }}>No employees found</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                {query
                  ? `No match for "${query}" in this organization's directory.`
                  : 'No active employees in this organization. You can continue as a walk-in visitor.'}
              </p>
              {!query && (
                <button
                  className="kiosk-btn kiosk-btn-secondary"
                  onClick={handleSkip}
                  style={{ marginTop: 16 }}
                >
                  Continue without host <ArrowRight size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="kiosk-emp-grid">
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, gap: 12 }}>
            <button
              className="kiosk-btn kiosk-btn-secondary kiosk-btn-sm"
              onClick={handleSkip}
            >
              Skip — Walk-in / No Host
            </button>
            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={handleNext}
              disabled={!selected}
              style={{ minWidth: 200 }}
            >
              Continue with Host <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default EmployeeSelectionPage;

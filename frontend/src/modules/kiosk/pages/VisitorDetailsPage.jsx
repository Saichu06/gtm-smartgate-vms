/**
 * VisitorDetailsPage — Screen 2: Visitor Details (Fast Enterprise Kiosk Terminal)
 * Optimized for < 20 seconds check-in.
 * Contains ONLY 4 Inputs:
 * 1. Visitor Name (Required - single full name)
 * 2. Coming From (Required - company / organization)
 * 3. Person To Meet (Optional - searchable employee dropdown, auto-assigns "Reception Desk" if skipped)
 * 4. Visitor Type (Required - Business Visitor, Vendor, Interview, Contractor, Delivery, Guest)
 *
 * Automatically derives purpose from Visitor Type:
 * - Business Visitor -> Business Meeting
 * - Vendor -> Vendor Visit
 * - Interview -> Interview
 * - Contractor -> Contractor Work
 * - Delivery -> Material Delivery
 * - Guest -> Guest Visit
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Building2, Tag, Search, CheckCircle, UserCheck } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import { searchEmployees } from '../services/kioskApi';
import '../styles/kiosk.css';

const VISITOR_TYPE_OPTIONS = [
  'Business Visitor',
  'Vendor',
  'Interview',
  'Contractor',
  'Delivery',
  'Guest',
];

const PURPOSE_MAP = {
  'Business Visitor': 'Business Meeting',
  'Vendor': 'Vendor Visit',
  'Interview': 'Interview',
  'Contractor': 'Contractor Work',
  'Delivery': 'Material Delivery',
  'Guest': 'Guest Visit',
};

const VisitorDetailsPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';

  // Construct full name if stored as separate or single
  const initialName = visitor.name || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim();

  const [visitorName, setVisitorName] = useState(initialName);
  const [comingFrom, setComingFrom] = useState(visitor.company || '');
  const [visitorType, setVisitorType] = useState(visitor.visitorType || 'Business Visitor');

  // Person To Meet Search
  const [hostQuery, setHostQuery] = useState('');
  const [hostResults, setHostResults] = useState([]);
  const [selectedHost, setSelectedHost] = useState(visitor.host || null);
  const [showHostDropdown, setShowHostDropdown] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hostQuery.trim()) {
      const timer = setTimeout(async () => {
        const res = await searchEmployees(hostQuery, orgId);
        setHostResults(res);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setHostResults([]);
    }
  }, [hostQuery, orgId]);

  const validate = () => {
    const e = {};
    if (!visitorName.trim()) e.visitorName = 'Visitor Name is required';
    if (!comingFrom.trim()) e.comingFrom = 'Company / Organization is required';
    if (!visitorType) e.visitorType = 'Visitor Type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    // Split single full name into firstName/lastName for backward context compatibility
    const parts = visitorName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    // Auto-assign Reception Desk if person to meet is skipped
    const finalHost = selectedHost || { name: 'Reception Desk', department: 'Front Desk', floor: 'Main Lobby' };
    const autoPurpose = PURPOSE_MAP[visitorType] || 'General Visit';

    updateVisitor({
      firstName,
      lastName,
      name: visitorName.trim(),
      company: comingFrom.trim(),
      visitorType,
      purpose: autoPurpose,
      host: finalHost,
    });

    navigate(`/kiosk/${orgId}/identity`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content" style={{ maxWidth: 820, width: '100%', padding: 0 }}>

          {/* Single Clean Enterprise Terminal Card */}
          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
            
            {/* In-Box Header (Dual Logos + Step 2/4 Counter) */}
            <KioskHeader currentStep={2} />

            <div style={{ marginBottom: 20, textAlignment: 'left' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                Visitor Registration
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                Please fill in the details below to continue.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 1. VISITOR NAME (REQUIRED) */}
              <div className="kiosk-field">
                <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>
                  1. VISITOR NAME *
                </label>
                <div className="kiosk-input-card" style={{ borderColor: errors.visitorName ? '#D32F2F' : primary, minHeight: 46, padding: '0 14px' }}>
                  <div className="kiosk-input-icon"><User size={18} style={{ color: primary }} /></div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={visitorName}
                    onChange={(e) => { setVisitorName(e.target.value); setErrors(prev => ({ ...prev, visitorName: '' })); }}
                    style={{ fontSize: 15, fontWeight: 700, minHeight: 40 }}
                    autoFocus
                  />
                </div>
                {errors.visitorName && <span style={{ color: '#D32F2F', fontSize: 11, fontWeight: 600 }}>{errors.visitorName}</span>}
              </div>

              {/* 2. COMING FROM (REQUIRED) */}
              <div className="kiosk-field">
                <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>
                  2. COMING FROM (COMPANY / ORGANIZATION) *
                </label>
                <div className="kiosk-input-card" style={{ borderColor: errors.comingFrom ? '#D32F2F' : '#E2E8F0', minHeight: 46, padding: '0 14px' }}>
                  <div className="kiosk-input-icon"><Building2 size={18} style={{ color: primary }} /></div>
                  <input
                    type="text"
                    placeholder="Company or Organization Name"
                    value={comingFrom}
                    onChange={(e) => { setComingFrom(e.target.value); setErrors(prev => ({ ...prev, comingFrom: '' })); }}
                    style={{ fontSize: 15, fontWeight: 700, minHeight: 40 }}
                  />
                </div>
                {errors.comingFrom && <span style={{ color: '#D32F2F', fontSize: 11, fontWeight: 600 }}>{errors.comingFrom}</span>}
              </div>

              {/* 3. PERSON TO MEET (OPTIONAL SEARCHABLE DROPDOWN) */}
              <div className="kiosk-field" style={{ position: 'relative' }}>
                <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>
                  3. PERSON TO MEET <span style={{ color: '#94A3B8', fontWeight: 500 }}>(Optional — Defaults to "Reception Desk")</span>
                </label>
                <div
                  className="kiosk-input-card"
                  style={{ borderColor: selectedHost ? '#2E7D32' : '#E2E8F0', minHeight: 46, padding: '0 14px' }}
                  onClick={() => setShowHostDropdown(true)}
                >
                  <div className="kiosk-input-icon"><Search size={18} style={{ color: primary }} /></div>
                  <input
                    type="text"
                    placeholder="Search employee by name..."
                    value={selectedHost ? selectedHost.name : hostQuery}
                    onChange={(e) => {
                      setSelectedHost(null);
                      setHostQuery(e.target.value);
                      setShowHostDropdown(true);
                    }}
                    style={{ fontSize: 15, fontWeight: 700, minHeight: 40 }}
                  />
                  {selectedHost && (
                    <CheckCircle size={18} style={{ color: '#2E7D32', flexShrink: 0 }} />
                  )}
                </div>

                {/* Host Search Dropdown */}
                {showHostDropdown && hostResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: '#fff', border: '2px solid #E2E8F0', borderRadius: 12,
                    boxShadow: '0 10px 28px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto', marginTop: 4
                  }}>
                    {hostResults.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedHost(emp);
                          setHostQuery('');
                          setShowHostDropdown(false);
                        }}
                        style={{
                          padding: '10px 14px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: selectedHost?.id === emp.id ? '#F0F9FF' : '#fff'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{emp.name}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{emp.designation} · {emp.department}</div>
                        </div>
                        <span style={{ fontSize: 11, background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#475569' }}>
                          {emp.floor}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. VISITOR TYPE (REQUIRED DROPDOWN) */}
              <div className="kiosk-field">
                <label className="kiosk-input-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>
                  4. VISITOR TYPE *
                </label>
                <div className="kiosk-input-card" style={{ borderColor: '#E2E8F0', minHeight: 46, padding: '0 14px' }}>
                  <div className="kiosk-input-icon"><Tag size={18} style={{ color: primary }} /></div>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value)}
                    style={{ fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 40 }}
                  >
                    {VISITOR_TYPE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Bottom Action Bar inside Box */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
                onClick={() => navigate(`/kiosk/${orgId}`)}
                style={{ flex: 1, minHeight: 48 }}
              >
                <ArrowLeft size={18} /> Back
              </button>

              <button
                className="kiosk-btn kiosk-btn-primary"
                onClick={handleNext}
                style={{
                  flex: 2,
                  minHeight: 48,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  color: '#FFFFFF',
                  boxShadow: `0 8px 24px ${primary}35`,
                }}
              >
                Continue to Identity Verification <ArrowRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default VisitorDetailsPage;


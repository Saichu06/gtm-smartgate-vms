/**
 * VisitorDetailsPage — Step 2: Compact Visitor Details
 * Fields: Visitor Name, Coming From, Person To Meet (optional), Visitor Type
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Building2, Tag, Search, CheckCircle } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
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

const VisitorDetailsPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';

  const initialName = visitor.visitorName || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim();

  const [visitorName, setVisitorName]   = useState(initialName);
  const [comingFrom, setComingFrom]     = useState(visitor.comingFrom || visitor.company || '');
  const [visitorType, setVisitorType]   = useState(visitor.visitorType || 'Business Visitor');
  const [hostQuery, setHostQuery]       = useState('');
  const [hostResults, setHostResults]   = useState([]);
  const [selectedHost, setSelectedHost] = useState(visitor.personToMeet && visitor.personToMeet !== 'Reception Desk' ? { name: visitor.personToMeet } : null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors]             = useState({});

  useEffect(() => {
    if (!hostQuery.trim()) { setHostResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await searchEmployees(hostQuery, orgId);
      setHostResults(res);
      setShowDropdown(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [hostQuery, orgId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setShowDropdown(false);
    if (showDropdown) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showDropdown]);

  const validate = () => {
    const e = {};
    if (!visitorName.trim()) e.visitorName = 'Visitor Name is required';
    if (!comingFrom.trim())  e.comingFrom  = 'Coming From is required';
    if (!visitorType)        e.visitorType = 'Visitor Type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    const parts     = visitorName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ') || '';
    const personToMeet = selectedHost?.name || 'Reception Desk';

    updateVisitor({
      visitorName: visitorName.trim(),
      firstName,
      lastName,
      comingFrom: comingFrom.trim(),
      company: comingFrom.trim(),
      visitorType,
      personToMeet,
      host: selectedHost || { name: 'Reception Desk', department: 'Front Desk', floor: 'Main Lobby' },
    });

    navigate(`/kiosk/${orgId}/identity`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <div className="kiosk-page">
        <div className="kiosk-panel">
          <KioskHeader currentStep={2} />

          <div className="kiosk-section-title">
            <User size={18} style={{ color: primary }} />
            <span>Visitor Details</span>
          </div>
          <p className="kiosk-section-sub">Fill in the details below to continue.</p>

          <div className="kiosk-form-stack">

            {/* 1. Visitor Name */}
            <div className="kiosk-field">
              <label className="kiosk-label">Visitor Name *</label>
              <div className={`kiosk-input-wrap ${errors.visitorName ? 'error' : ''}`}>
                <User size={16} style={{ color: primary, flexShrink: 0 }} />
                <input
                  type="text"
                  className="kiosk-input"
                  placeholder="Enter your full name"
                  value={visitorName}
                  onChange={e => { setVisitorName(e.target.value); setErrors(p => ({ ...p, visitorName: '' })); }}
                  autoFocus
                />
              </div>
              {errors.visitorName && <span className="kiosk-field-error">{errors.visitorName}</span>}
            </div>

            {/* 2. Coming From */}
            <div className="kiosk-field">
              <label className="kiosk-label">Coming From *</label>
              <div className={`kiosk-input-wrap ${errors.comingFrom ? 'error' : ''}`}>
                <Building2 size={16} style={{ color: primary, flexShrink: 0 }} />
                <input
                  type="text"
                  className="kiosk-input"
                  placeholder="Company or Organization"
                  value={comingFrom}
                  onChange={e => { setComingFrom(e.target.value); setErrors(p => ({ ...p, comingFrom: '' })); }}
                />
              </div>
              {errors.comingFrom && <span className="kiosk-field-error">{errors.comingFrom}</span>}
            </div>

            {/* 3. Person To Meet (optional) */}
            <div className="kiosk-field" style={{ position: 'relative' }}>
              <label className="kiosk-label">
                Person To Meet
                <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: 6, fontSize: 10 }}>Optional — defaults to Reception Desk</span>
              </label>
              <div
                className={`kiosk-input-wrap ${selectedHost ? 'success' : ''}`}
                onClick={e => { e.stopPropagation(); if (hostQuery.trim()) setShowDropdown(true); }}
              >
                <Search size={16} style={{ color: primary, flexShrink: 0 }} />
                <input
                  type="text"
                  className="kiosk-input"
                  placeholder="Search by name..."
                  value={selectedHost ? selectedHost.name : hostQuery}
                  onChange={e => { setSelectedHost(null); setHostQuery(e.target.value); }}
                />
                {selectedHost && <CheckCircle size={16} style={{ color: '#2E7D32', flexShrink: 0 }} />}
              </div>

              {showDropdown && hostResults.length > 0 && (
                <div className="kiosk-dropdown" onClick={e => e.stopPropagation()}>
                  {hostResults.slice(0, 6).map(emp => (
                    <div
                      key={emp.id}
                      className="kiosk-dropdown-item"
                      onClick={() => { setSelectedHost(emp); setHostQuery(''); setShowDropdown(false); }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{emp.designation} · {emp.department}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Visitor Type */}
            <div className="kiosk-field">
              <label className="kiosk-label">Visitor Type *</label>
              <div className={`kiosk-input-wrap ${errors.visitorType ? 'error' : ''}`}>
                <Tag size={16} style={{ color: primary, flexShrink: 0 }} />
                <select
                  className="kiosk-input"
                  value={visitorType}
                  onChange={e => setVisitorType(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {VISITOR_TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="kiosk-action-row">
            <button className="kiosk-btn kiosk-btn-back" onClick={() => navigate(`/kiosk/${orgId}`)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="kiosk-btn kiosk-btn-primary" onClick={handleNext}>
              Next <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDetailsPage;

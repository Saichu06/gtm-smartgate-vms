/**
 * LuggagePage — Step 4 (only shown when Laptop = YES).
 * Compact: Laptop Model + Serial Number fields.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Laptop, AlertCircle } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';

const LuggagePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const [model, setModel]   = useState(visitor.laptopModel || '');
  const [serial, setSerial] = useState(visitor.laptopSerial || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!model.trim())  e.model  = 'Laptop model is required';
    if (!serial.trim()) e.serial = 'Serial number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    updateVisitor({ laptopModel: model.trim(), laptopSerial: serial.trim() });
    navigate(`/kiosk/${orgId}/vehicle`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page">
        <div className="kiosk-panel">
          <KioskHeader currentStep={4} />

          <div className="kiosk-section-title">
            <Laptop size={18} style={{ color: primary }} />
            <span>Visitors — Luggage</span>
          </div>
          <p className="kiosk-section-sub">Please provide your laptop details.</p>

          <div className="kiosk-form-stack">
            {/* Model */}
            <div className="kiosk-field">
              <label className="kiosk-label">Laptop Model *</label>
              <div className={`kiosk-input-wrap ${errors.model ? 'error' : ''}`}>
                <input
                  type="text"
                  className="kiosk-input"
                  placeholder="e.g. Dell XPS 15, MacBook Pro"
                  value={model}
                  onChange={e => { setModel(e.target.value); setErrors(p => ({ ...p, model: '' })); }}
                  autoFocus
                />
              </div>
              {errors.model && <span className="kiosk-field-error">{errors.model}</span>}
            </div>

            {/* Serial Number */}
            <div className="kiosk-field">
              <label className="kiosk-label">Serial Number *</label>
              <div className={`kiosk-input-wrap ${errors.serial ? 'error' : ''}`}>
                <input
                  type="text"
                  className="kiosk-input"
                  placeholder="e.g. C02X1234"
                  value={serial}
                  onChange={e => { setSerial(e.target.value); setErrors(p => ({ ...p, serial: '' })); }}
                />
              </div>
              {errors.serial && <span className="kiosk-field-error">{errors.serial}</span>}
            </div>
          </div>

          <div className="kiosk-action-row">
            <button className="kiosk-btn kiosk-btn-back" onClick={() => navigate(`/kiosk/${orgId}/identity`)}>
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

export default LuggagePage;

/**
 * VisitorDetailsPage — Screen 3. Full form: name, company, email, purpose, host, type, duration.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Building2, Mail, Tag, Clock, Car, FileText } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';
import { VISITOR_TYPES, PURPOSE_OPTIONS } from '../services/kioskApi';

const Field = ({ label, icon: Icon, children }) => (
  <div className="kiosk-field">
    <label className="kiosk-input-label">{label}</label>
    <div className="kiosk-input-card">
      {Icon && <div className="kiosk-input-icon"><Icon size={22} /></div>}
      {children}
    </div>
  </div>
);

const VisitorDetailsPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary   = org?.primaryColor   || '#1565C0';
  const secondary = org?.secondaryColor || '#0D47A1';

  const [form, setForm] = useState({
    firstName:       visitor.firstName       || '',
    lastName:        visitor.lastName        || '',
    company:         visitor.company         || '',
    email:           visitor.email           || '',
    purpose:         visitor.purpose         || '',
    vehicleNumber:   visitor.vehicleNumber   || '',
    visitorType:     visitor.visitorType     || '',
    expectedDuration:visitor.expectedDuration|| '',
  });

  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.purpose.trim())   e.purpose   = 'Required';
    if (!form.visitorType)      e.visitorType = 'Required';
    if (!form.expectedDuration.trim()) e.expectedDuration = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    updateVisitor(form);
    navigate(`/kiosk/${orgId}/employee`);
  };

  const inputStyle = (key) => ({
    borderColor: errors[key] ? '#D32F2F' : undefined,
    boxShadow: errors[key] ? '0 0 0 3px rgba(211,47,47,0.1)' : undefined,
  });

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <KioskHeader />
      <ProgressStepper currentStep={1} />

      <div className="kiosk-page">
        <div className="kiosk-content kiosk-content-md" style={{ margin: '0 auto' }}>

          <button
            className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
            onClick={() => navigate(`/kiosk/${orgId}/mobile`)}
            style={{ marginBottom: 24 }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="kiosk-page-title">
            <FileText size={30} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
            Visitor Details
          </div>
          <p className="kiosk-page-sub">Fill in your information below. Fields marked * are required.</p>

          <div className="kiosk-section-card">
            <div className="kiosk-section-card-header">
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Personal Information</span>
            </div>
            <div className="kiosk-section-card-body">
              <div className="kiosk-form-grid" style={{ marginBottom: 20 }}>
                <div className="kiosk-field">
                  <label className="kiosk-input-label">First Name *</label>
                  <div className="kiosk-input-card" style={inputStyle('firstName')}>
                    <div className="kiosk-input-icon"><User size={22} /></div>
                    <input type="text" placeholder="Rajesh" value={form.firstName} onChange={set('firstName')} />
                  </div>
                  {errors.firstName && <span style={{ color: '#D32F2F', fontSize: 12 }}>{errors.firstName}</span>}
                </div>
                <div className="kiosk-field">
                  <label className="kiosk-input-label">Last Name *</label>
                  <div className="kiosk-input-card" style={inputStyle('lastName')}>
                    <div className="kiosk-input-icon"><User size={22} /></div>
                    <input type="text" placeholder="Kumar" value={form.lastName} onChange={set('lastName')} />
                  </div>
                  {errors.lastName && <span style={{ color: '#D32F2F', fontSize: 12 }}>{errors.lastName}</span>}
                </div>
              </div>

              <div className="kiosk-form-grid" style={{ marginBottom: 20 }}>
                <div className="kiosk-field">
                  <label className="kiosk-input-label">Company / Organization</label>
                  <div className="kiosk-input-card">
                    <div className="kiosk-input-icon"><Building2 size={22} /></div>
                    <input type="text" placeholder="Infosys Ltd" value={form.company} onChange={set('company')} />
                  </div>
                </div>
                <div className="kiosk-field">
                  <label className="kiosk-input-label">Email Address</label>
                  <div className="kiosk-input-card">
                    <div className="kiosk-input-icon"><Mail size={22} /></div>
                    <input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} />
                  </div>
                </div>
              </div>

              <div className="kiosk-field" style={{ marginBottom: 20 }}>
                <label className="kiosk-input-label">Vehicle Number (Optional)</label>
                <div className="kiosk-input-card">
                  <div className="kiosk-input-icon"><Car size={22} /></div>
                  <input type="text" placeholder="TN 01 AB 1234" value={form.vehicleNumber} onChange={set('vehicleNumber')} style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="kiosk-section-card" style={{ marginTop: 20 }}>
            <div className="kiosk-section-card-header">
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Visit Information</span>
            </div>
            <div className="kiosk-section-card-body">
              <div className="kiosk-form-grid" style={{ marginBottom: 20 }}>
                <div className="kiosk-field">
                  <label className="kiosk-input-label">Purpose of Visit *</label>
                  <div className="kiosk-input-card" style={inputStyle('purpose')}>
                    <div className="kiosk-input-icon"><Tag size={22} /></div>
                    <select value={form.purpose} onChange={set('purpose')}>
                      <option value="">Select purpose...</option>
                      {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  {errors.purpose && <span style={{ color: '#D32F2F', fontSize: 12 }}>{errors.purpose}</span>}
                </div>
                <div className="kiosk-field">
                  <label className="kiosk-input-label">Visitor Type *</label>
                  <div className="kiosk-input-card" style={inputStyle('visitorType')}>
                    <div className="kiosk-input-icon"><Tag size={22} /></div>
                    <select value={form.visitorType} onChange={set('visitorType')}>
                      <option value="">Select type...</option>
                      {VISITOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {errors.visitorType && <span style={{ color: '#D32F2F', fontSize: 12 }}>{errors.visitorType}</span>}
                </div>
              </div>

              <div className="kiosk-field">
                <label className="kiosk-input-label">Expected Visit Duration *</label>
                <div className="kiosk-input-card" style={inputStyle('expectedDuration')}>
                  <div className="kiosk-input-icon"><Clock size={22} /></div>
                  <input
                    type="text"
                    placeholder="e.g., 2 hours, 30 minutes, half day"
                    value={form.expectedDuration}
                    onChange={set('expectedDuration')}
                  />
                </div>
                {errors.expectedDuration && <span style={{ color: '#D32F2F', fontSize: 12 }}>{errors.expectedDuration}</span>}
                <span style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, display: 'block' }}>
                  Enter how long you expect to stay (e.g., 1 hour, 3 hours, full day).
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
            <button
              className="kiosk-btn kiosk-btn-primary"
              onClick={handleNext}
              style={{ minWidth: 240 }}
            >
              Next: Select Host <span style={{ fontWeight: 500, opacity: 0.85 }}>(Optional)</span> <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default VisitorDetailsPage;

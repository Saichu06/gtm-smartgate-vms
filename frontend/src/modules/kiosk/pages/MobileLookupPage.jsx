/**
 * MobileLookupPage — Screen 2. Large phone input + interactive numeric touch keypad + returning visitor detection.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, ArrowRight, ArrowLeft, User, RefreshCw, Delete } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import { useVisitor } from '../context/VisitorContext';
import { searchVisitorByPhone } from '../services/kioskApi';
import '../styles/kiosk.css';

const COUNTRY_CODES = ['+91 🇮🇳', '+1 🇺🇸', '+44 🇬🇧', '+971 🇦🇪', '+65 🇸GRect'];

const MobileLookupPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();

  const primary = org?.primaryColor || '#1565C0';

  const [phone, setPhone] = useState(visitor.phone || '');
  const [countryCode, setCountryCode] = useState(visitor.countryCode || '+91 🇮🇳');
  const [searching, setSearching] = useState(false);
  const [returningVisitor, setReturningVisitor] = useState(null);
  const [error, setError] = useState('');

  const handleKeyPress = (num) => {
    if (phone.length < 10) {
      const nextPhone = phone + num;
      setPhone(nextPhone);
      setError('');
      if (nextPhone.length === 10) performLookup(nextPhone);
    }
  };

  const handleBackspace = () => {
    setPhone(prev => prev.slice(0, -1));
    setReturningVisitor(null);
    setError('');
  };

  const handleClear = () => {
    setPhone('');
    setReturningVisitor(null);
    setError('');
  };

  const performLookup = async (phoneNum) => {
    setSearching(true);
    const result = await searchVisitorByPhone(phoneNum);
    setSearching(false);
    if (result.found) {
      setReturningVisitor(result.visitor);
    }
  };

  const handleNext = () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (returningVisitor) {
      updateVisitor({ ...returningVisitor, phone, countryCode });
    } else {
      updateVisitor({ phone, countryCode });
    }
    navigate(`/kiosk/${orgId}/details`);
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content kiosk-content-sm" style={{ margin: '0 auto', maxWidth: 540, padding: 0 }}>

          {/* SINGLE ENCLOSING CARD BOX */}
          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>

            {/* In-Box Header (Dual Logos + Mobile Step Badge 1/4) */}
            <KioskHeader currentStep={1} />

            <div className="kiosk-page-title" style={{ textAlign: 'center', fontSize: 22, marginBottom: 4 }}>
              <Phone size={24} style={{ color: primary, verticalAlign: 'middle', marginRight: 8 }} />
              Enter Mobile Number
            </div>
            <p className="kiosk-page-sub" style={{ textAlign: 'center', fontSize: 13, marginBottom: 20 }}>
              We'll use your mobile number to look up your details or register a new pass.
            </p>

            {/* Clean Phone Input Box */}
            <div className="kiosk-input-card" style={{ marginBottom: 16, borderColor: phone.length === 10 ? '#2E7D32' : error ? '#D32F2F' : primary, padding: '4px 14px', minHeight: 46 }}>
              <Phone size={18} style={{ color: primary, flexShrink: 0, marginRight: 8 }} />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                  if (val.length === 10) performLookup(val);
                }}
                style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, border: 'none', outline: 'none', flex: 1, minHeight: 40 }}
                readOnly
              />

              {/* GREEN TICK ICON WHEN 10 DIGITS ENTERED */}
              {phone.length === 10 && !searching && (
                <CheckCircle2 size={20} style={{ color: '#2E7D32', flexShrink: 0 }} />
              )}

              {searching && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2.5px solid ${primary}30`, borderTopColor: primary, animation: 'spin 0.8s linear infinite' }} />
              )}
            </div>

            {error && (
              <p style={{ color: '#D32F2F', fontSize: 12, fontWeight: 600, textAlign: 'center', margin: '-6px 0 14px' }}>{error}</p>
            )}

            {/* Returning Visitor Banner */}
            {returningVisitor && (
              <div style={{
                background: '#F0FDF4', border: '1.5px solid #BBF7D0',
                borderRadius: 14, padding: '12px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 12,
                animation: 'kioskFadeUp 0.3s ease',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2E7D32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                    Welcome back, {returningVisitor.firstName}!
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {returningVisitor.company} · {returningVisitor.email}
                  </div>
                </div>
              </div>
            )}

            {/* Touch Numeric Keypad */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20
            }}>
              {['1','2','3','4','5','6','7','8','9','CLEAR','0','BACK'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === 'CLEAR') handleClear();
                    else if (btn === 'BACK') handleBackspace();
                    else handleKeyPress(btn);
                  }}
                  style={{
                    minHeight: 48,
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    background: btn === 'CLEAR' || btn === 'BACK' ? '#F8FAFC' : '#FFFFFF',
                    color: btn === 'CLEAR' || btn === 'BACK' ? '#64748B' : '#0F172A',
                    fontSize: btn.length > 1 ? 12 : 18,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {btn === 'BACK' ? <Delete size={18} /> : btn}
                </button>
              ))}
            </div>

            {/* Bottom Action Bar inside Box */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
                disabled={phone.length < 10}
                style={{
                  flex: 2,
                  minHeight: 48,
                  background: phone.length === 10 ? `linear-gradient(135deg, ${primary}, #0F172A)` : '#E2E8F0',
                  color: phone.length === 10 ? '#FFFFFF' : '#94A3B8',
                  boxShadow: phone.length === 10 ? `0 6px 20px ${primary}35` : 'none',
                }}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MobileLookupPage;

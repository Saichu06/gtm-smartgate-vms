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
      <KioskHeader />
      <ProgressStepper currentStep={0} />

      <div className="kiosk-page">
        <div className="kiosk-content kiosk-content-sm" style={{ margin: '0 auto', maxWidth: 580 }}>

          <button
            className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm"
            onClick={() => navigate(`/kiosk/${orgId}`)}
            style={{ marginBottom: 20 }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="kiosk-page-title" style={{ textAlign: 'center' }}>
            <Phone size={32} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
            Enter Mobile Number
          </div>
          <p className="kiosk-page-sub" style={{ textAlign: 'center' }}>
            We'll use your mobile number to look up your details or register a new pass.
          </p>

          {/* Large Phone Input */}
          <div className="kiosk-input-card" style={{ marginBottom: 20, borderColor: error ? '#D32F2F' : primary, padding: '12px 20px' }}>
            <select
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
              style={{
                border: 'none', background: 'transparent', fontSize: 18,
                fontWeight: 700, cursor: 'pointer', outline: 'none', marginRight: 8
              }}
            >
              {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div style={{ height: 28, width: 1, background: '#E2E8F0', margin: '0 12px' }} />

            <input
              type="tel"
              placeholder="00000 00000"
              value={phone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(val);
                if (val.length === 10) performLookup(val);
              }}
              style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, border: 'none', outline: 'none', flex: 1 }}
              readOnly
            />

            {searching && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `3px solid ${primary}30`, borderTopColor: primary, animation: 'spin 0.8s linear infinite' }} />
            )}
          </div>

          {error && (
            <p style={{ color: '#D32F2F', fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '-10px 0 16px' }}>{error}</p>
          )}

          {/* Returning Visitor Banner */}
          {returningVisitor && (
            <div style={{
              background: '#F0FDF4', border: '2px solid #BBF7D0',
              borderRadius: 16, padding: '16px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 14,
              animation: 'kioskFadeUp 0.3s ease',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2E7D32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                  Welcome back, {returningVisitor.firstName}!
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {returningVisitor.company} · {returningVisitor.email}
                </div>
              </div>
            </div>
          )}

          {/* Touch Numeric Keypad */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24
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
                  minHeight: 60,
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  background: btn === 'CLEAR' || btn === 'BACK' ? '#F8FAFC' : '#FFFFFF',
                  color: btn === 'CLEAR' || btn === 'BACK' ? '#64748B' : '#0F172A',
                  fontSize: btn.length > 1 ? 13 : 22,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {btn === 'BACK' ? <Delete size={20} /> : btn}
              </button>
            ))}
          </div>

          {/* Next CTA */}
          <button
            className="kiosk-btn kiosk-btn-primary kiosk-btn-full"
            onClick={handleNext}
            disabled={phone.length < 10}
            style={{
              background: `linear-gradient(135deg, ${primary}, #0F172A)`,
              color: '#FFFFFF',
              boxShadow: `0 8px 24px ${primary}40`,
            }}
          >
            Continue <ArrowRight size={22} />
          </button>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default MobileLookupPage;

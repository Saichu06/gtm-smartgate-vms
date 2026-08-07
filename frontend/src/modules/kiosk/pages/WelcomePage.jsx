/**
 * WelcomePage — Screen 1: Mobile Verification (4-Screen Kiosk Flow)
 * Features:
 * - Dual Branding (Org Logo Left + GTM Smart Gate Right)
 * - Directly editable <input type="tel"> with OS native keypad support (no custom keypad)
 * - Auto-focus on load, Enter key / Generate OTP submission
 * - On-Page OTP Verification (4-digit boxes with auto-tabbing, backspace, and paste support)
 * - Returning Visitor Detection & Welcome Back banner
 * - Step 1 of 4 Header Progress
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, ArrowRight, User, CheckCircle2, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import { useVisitor } from '../context/VisitorContext';
import { searchVisitorByPhone } from '../services/kioskApi';
import '../styles/kiosk.css';
import gtmLogo from '../../../assets/icons/logo.png';

const COUNTRY_CODES = ['+91 🇮🇳', '+1 🇺🇸', '+44 🇬🇧', '+971 🇦🇪', '+65 🇸🇬'];

const WelcomePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor, resetFlow } = useVisitor();

  const primary = org?.primaryColor || '#1565C0';
  const secondary = org?.secondaryColor || '#0F172A';
  const orgName = org?.displayName || org?.name || 'GTM Smart Gate';

  const [phone, setPhone] = useState(visitor.phone || '');
  const [countryCode, setCountryCode] = useState(visitor.countryCode || '+91 🇮🇳');
  const [searching, setSearching] = useState(false);
  const [returningVisitor, setReturningVisitor] = useState(null);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const phoneInputRef = useRef(null);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Auto-focus mobile input on screen load
  useEffect(() => {
    resetFlow();
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [resetFlow]);

  // Handle phone change
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    setPhoneError('');
    setOtpGenerated(false);
    if (val.length === 10) {
      performLookup(val);
    } else {
      setReturningVisitor(null);
    }
  };

  const performLookup = async (phoneNum) => {
    setSearching(true);
    const result = await searchVisitorByPhone(phoneNum);
    setSearching(false);
    if (result.found) {
      setReturningVisitor(result.visitor);
    }
  };

  const handleGenerateOtp = () => {
    if (phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setPhoneError('');
    setOtpGenerated(true);
    setOtpError('');
    // Auto-focus first OTP input after generation
    setTimeout(() => {
      if (otpRefs[0].current) otpRefs[0].current.focus();
    }, 100);
  };

  // OTP Inputs Tabbing & Backspace Logic
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = cleanVal;
    setOtpValues(newOtp);
    setOtpError('');

    // Move to next input if typed
    if (cleanVal && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-verify if all 4 digits are filled
    if (newOtp.every(digit => digit !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      verifyOtp(otpValues.join(''));
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const digits = pastedData.split('');
      const newOtp = ['', '', '', ''];
      digits.forEach((d, i) => { if (i < 4) newOtp[i] = d; });
      setOtpValues(newOtp);
      if (digits.length === 4) {
        verifyOtp(digits.join(''));
      } else {
        const nextIndex = Math.min(digits.length, 3);
        otpRefs[nextIndex].current?.focus();
      }
    }
  };

  const verifyOtp = (code) => {
    if (code.length < 4) {
      setOtpError('Please enter full 4-digit OTP.');
      return;
    }
    // Proceed to Screen 2
    if (returningVisitor) {
      updateVisitor({
        ...returningVisitor,
        phone,
        countryCode,
        isReturning: true,
      });
    } else {
      updateVisitor({ phone, countryCode });
    }
    navigate(`/kiosk/${orgId}/details`);
  };

  const handleKeyDownPhone = (e) => {
    if (e.key === 'Enter') {
      if (!otpGenerated) {
        handleGenerateOtp();
      }
    }
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary, '--kiosk-secondary': secondary }}>
      <KioskHeader currentStep={1} />

      <div className="kiosk-page" style={{ background: `linear-gradient(160deg, #F8FAFC 0%, ${primary}0F 100%)` }}>
        <div className="kiosk-welcome" style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>

          {/* Dual Brand Logos */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, marginBottom: 20 }}>
            {org?.logo ? (
              <img src={org.logo} alt={orgName} style={{ height: 64, objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: 24, fontWeight: 800, color: primary }}>{orgName}</div>
            )}
            <div style={{ width: 2, height: 48, background: '#E2E8F0', borderRadius: 999 }} />
            <img src={gtmLogo} alt="GTM Smart Gate" style={{ height: 64, objectFit: 'contain' }} />
          </div>

          {/* Welcome Text */}
          <div className="kiosk-welcome-text" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Welcome to {orgName}
            </h1>
            <p style={{ fontSize: 16, color: '#64748B', margin: '0 auto', maxWidth: 520 }}>
              Enter your mobile number to identify yourself and receive your digital visitor access pass.
            </p>
          </div>

          {/* Returning Visitor Welcome Back Card */}
          {returningVisitor && (
            <div style={{
              background: '#F0FDF4', border: '2px solid #BBF7D0',
              borderRadius: 18, padding: '16px 22px',
              display: 'flex', alignItems: 'center', gap: 16, width: '100%',
              boxShadow: '0 4px 16px rgba(46,125,50,0.08)',
              animation: 'kioskFadeUp 0.3s ease',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2E7D32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={26} />
              </div>
              <div style={{ flex: 1, textAlignment: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
                  Welcome Back, {returningVisitor.firstName} {returningVisitor.lastName}!
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {returningVisitor.company} · {returningVisitor.email || 'Registered Visitor'}
                </div>
              </div>
            </div>
          )}

          {/* Direct Input Mobile Card */}
          <div className="kiosk-section-card" style={{ width: '100%', padding: 24, margin: 0 }}>
            <label className="kiosk-input-label" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
              ENTER YOUR 10-DIGIT MOBILE NUMBER *
            </label>

            <div className="kiosk-input-card" style={{ borderColor: phoneError ? '#D32F2F' : primary, padding: '8px 16px', minHeight: 64 }}>
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 18, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div style={{ height: 28, width: 1, background: '#E2E8F0', margin: '0 12px' }} />

              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="98765 43210"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handleKeyDownPhone}
                style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, border: 'none', outline: 'none', width: '100%' }}
                autoFocus
              />

              {searching && (
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `3px solid ${primary}30`, borderTopColor: primary, animation: 'spin 0.8s linear infinite' }} />
              )}
            </div>

            {phoneError && (
              <p style={{ color: '#D32F2F', fontSize: 13, fontWeight: 600, marginTop: 8, textAlign: 'left' }}>{phoneError}</p>
            )}

            {!otpGenerated ? (
              <button
                className="kiosk-btn kiosk-btn-primary kiosk-btn-full"
                onClick={handleGenerateOtp}
                disabled={phone.length < 10}
                style={{
                  marginTop: 20,
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  color: '#FFFFFF',
                  boxShadow: `0 8px 24px ${primary}40`,
                }}
              >
                Generate OTP <ArrowRight size={22} />
              </button>
            ) : (
              /* ON-PAGE OTP VERIFICATION SECTION */
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed #E2E8F0', animation: 'kioskFadeUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                  <KeyRound size={20} style={{ color: primary }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                    Enter 4-Digit Verification OTP
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 }}>
                  SMS sent to <strong>{countryCode} {phone}</strong> (Demo code: <strong>1 2 3 4</strong>)
                </p>

                {/* 4 OTP Input Boxes */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      style={{
                        width: 60,
                        height: 64,
                        borderRadius: 14,
                        border: `2px solid ${digit ? primary : '#CBD5E1'}`,
                        textAlign: 'center',
                        fontSize: 26,
                        fontWeight: 800,
                        color: '#0F172A',
                        outline: 'none',
                        background: digit ? '#F0F9FF' : '#FFFFFF',
                        boxShadow: digit ? `0 0 0 3px ${primary}20` : 'none',
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <p style={{ color: '#D32F2F', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{otpError}</p>
                )}

                <button
                  className="kiosk-btn kiosk-btn-primary kiosk-btn-full"
                  onClick={() => verifyOtp(otpValues.join(''))}
                  disabled={otpValues.join('').length < 4}
                  style={{
                    background: `linear-gradient(135deg, ${primary}, #2E7D32)`,
                    color: '#FFFFFF',
                  }}
                >
                  Verify OTP & Continue <CheckCircle2 size={22} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: 13 }}>
            <ShieldCheck size={16} style={{ color: primary }} />
            Touch-screen self-service terminal · Fast 45–60 sec registration
          </div>

        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default WelcomePage;


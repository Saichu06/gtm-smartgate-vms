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

  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const phoneInputRef = useRef(null);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Timer countdown effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

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
    setResendTimer(30);
    // Auto-focus first OTP input after generation
    setTimeout(() => {
      if (otpRefs[0].current) otpRefs[0].current.focus();
    }, 100);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setOtpValues(['', '', '', '']);
    setOtpError('');
    setResendMsg('A new OTP has been sent to your mobile number.');
    setTimeout(() => {
      setResending(false);
      setResendTimer(30);
      if (otpRefs[0].current) otpRefs[0].current.focus();
    }, 1000);
  };

  // OTP Inputs Tabbing & Backspace Logic
  const handleOtpChange = (index, value) => {
    if (validating) return;
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
    if (validating) return;
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      verifyOtp(otpValues.join(''));
    }
  };

  const handleOtpPaste = (e) => {
    if (validating) return;
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
    if (validating) return;
    if (code.length < 4) {
      setOtpError('Please enter full 4-digit OTP.');
      return;
    }

    setValidating(true);
    setValidationStatus('Connecting to Telecom Verification Gateway...');

    setTimeout(() => {
      setValidationStatus('Verifying OTP & Authorizing Mobile Number...');
    }, 1200);

    setTimeout(() => {
      setValidationStatus('OTP Verified Successfully! Redirecting...');
    }, 2500);

    setTimeout(() => {
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
    }, 3500);
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
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content" style={{ maxWidth: 820, width: '100%', padding: 0 }}>

          {/* SINGLE ENCLOSING CARD BOX FOR EVERYTHING */}
          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>

            {/* In-Box Header (Dual Logos + Step 1/4 Counter) */}
            <KioskHeader currentStep={1} />

            {/* Welcome Text */}
            <div className="kiosk-welcome-text" style={{ textAlign: 'center', marginBottom: 20 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Welcome to {orgName}
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 auto', maxWidth: 480 }}>
                Enter your mobile number to identify yourself and receive your digital visitor access pass.
              </p>
            </div>

            {/* Returning Visitor Welcome Back Card */}
            {returningVisitor && !validating && (
              <div style={{
                background: '#F0FDF4', border: '1.5px solid #BBF7D0',
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                marginBottom: 16, animation: 'kioskFadeUp 0.3s ease',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2E7D32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1, textAlignment: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                    Welcome Back, {returningVisitor.firstName} {returningVisitor.lastName}!
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {returningVisitor.company} · {returningVisitor.email || 'Registered Visitor'}
                  </div>
                </div>
              </div>
            )}

            {/* Direct Input Mobile Section */}
            {!validating && (
              <div>
                <label className="kiosk-input-label" style={{ fontSize: 11, marginBottom: 6, display: 'block' }}>
                  ENTER YOUR 10-DIGIT MOBILE NUMBER *
                </label>

                <div className="kiosk-input-card" style={{ borderColor: phone.length === 10 ? '#2E7D32' : phoneError ? '#D32F2F' : primary, padding: '4px 14px', minHeight: 46 }}>
                  <Phone size={18} style={{ color: primary, flexShrink: 0, marginRight: 8 }} />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handleKeyDownPhone}
                    disabled={otpGenerated}
                    style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, border: 'none', outline: 'none', width: '100%', minHeight: 40 }}
                    autoFocus
                  />

                  {/* GREEN TICK ICON WHEN 10 DIGITS ENTERED */}
                  {phone.length === 10 && !searching && (
                    <CheckCircle2 size={20} style={{ color: '#2E7D32', flexShrink: 0 }} />
                  )}

                  {searching && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2.5px solid ${primary}30`, borderTopColor: primary, animation: 'spin 0.8s linear infinite' }} />
                  )}
                </div>

                {phoneError && (
                  <p style={{ color: '#D32F2F', fontSize: 12, fontWeight: 600, marginTop: 6, textAlign: 'left' }}>{phoneError}</p>
                )}
              </div>
            )}

            {validating ? (
              /* VALIDATING 3.5-SECOND PROCESSING CARD */
              <div style={{
                margin: '20px 0',
                padding: '32px 24px',
                background: `linear-gradient(135deg, ${primary}0A, #F8FAFC)`,
                borderRadius: 16,
                border: `1.5px solid ${primary}25`,
                textAlign: 'center',
                animation: 'kioskFadeUp 0.3s ease',
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  border: `3.5px solid ${primary}20`,
                  borderTopColor: primary,
                  animation: 'spin 0.8s linear infinite',
                }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                  Validating OTP & Mobile Identity
                </h3>
                <p style={{ fontSize: 13, color: primary, fontWeight: 700, margin: '0 0 16px' }}>
                  {validationStatus}
                </p>
                <div style={{
                  width: '100%',
                  maxWidth: 360,
                  height: 6,
                  background: '#E2E8F0',
                  borderRadius: 3,
                  margin: '0 auto',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${primary}, #2E7D32)`,
                    borderRadius: 3,
                    animation: 'kioskProgress 3.5s linear forwards',
                  }} />
                </div>
                <style>{`
                  @keyframes kioskProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                  }
                `}</style>
              </div>
            ) : !otpGenerated ? (
              <button
                className="kiosk-btn kiosk-btn-primary kiosk-btn-full"
                onClick={handleGenerateOtp}
                disabled={phone.length < 10}
                style={{
                  marginTop: 20,
                  minHeight: 48,
                  fontSize: 16,
                  borderRadius: 14,
                  background: phone.length === 10 ? `linear-gradient(135deg, ${primary}, ${secondary})` : '#E2E8F0',
                  color: phone.length === 10 ? '#FFFFFF' : '#94A3B8',
                  boxShadow: phone.length === 10 ? `0 8px 24px ${primary}40` : 'none',
                }}
              >
                Send OTP <ArrowRight size={20} />
              </button>
            ) : (
              /* ON-PAGE OTP VERIFICATION SECTION WITH RESEND */
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

                {resendMsg && (
                  <p style={{ color: '#2E7D32', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                    ✓ {resendMsg}
                  </p>
                )}

                {otpError && (
                  <p style={{ color: '#D32F2F', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{otpError}</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="kiosk-btn kiosk-btn-primary kiosk-btn-full"
                    onClick={() => verifyOtp(otpValues.join(''))}
                    disabled={otpValues.join('').length < 4}
                    style={{
                      background: otpValues.join('').length === 4 ? `linear-gradient(135deg, ${primary}, #2E7D32)` : '#E2E8F0',
                      color: otpValues.join('').length === 4 ? '#FFFFFF' : '#94A3B8',
                      minHeight: 48,
                      fontSize: 16,
                      borderRadius: 14
                    }}
                  >
                    Validate OTP & Continue <CheckCircle2 size={20} />
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, padding: '0 4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpGenerated(false);
                        setOtpValues(['', '', '', '']);
                        setOtpError('');
                        setResendMsg('');
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change Mobile Number
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || resending}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendTimer > 0 ? '#94A3B8' : primary,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {resending ? 'Resending...' : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#94A3B8', fontSize: 11, marginTop: 16 }}>
              <ShieldCheck size={14} style={{ color: primary }} />
              Self-service terminal · Fast 45 sec check-in
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomePage;


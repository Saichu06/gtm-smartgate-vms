/**
 * Login Page Component
 * Premium Enterprise SaaS Split Screen Login Experience (Enhanced with Bootstrap utilities).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, Server, Users, Activity, Lock, ArrowRight, Eye, EyeOff, Smartphone } from 'lucide-react';
import logoImg from '../assets/icons/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-shell min-vh-100 w-100 d-flex overflow-hidden">
      {/* 65% Left Branding Panel */}
      <div className="login-branding-panel d-none d-md-flex flex-column justify-content-between p-4 p-lg-5 position-relative">
        <div className="branding-content-wrapper my-auto py-3 d-flex flex-column" style={{ maxWidth: '680px' }}>
          {/* Content Hierarchy: 1. Heading */}
          <h1 className="branding-tagline fw-bold text-dark mb-2" style={{ fontSize: '30px', lineHeight: 1.25 }}>
            Enterprise Visitor Management Platform
          </h1>
          
          {/* Content Hierarchy: 2. Short Description */}
          <p className="branding-subtext text-secondary mb-4" style={{ fontSize: '15px', lineHeight: 1.6, maxWidth: '600px' }}>
            Architected for secure enterprise environments, cloud deployment, real-time visitor governance, and scalable access management.
          </p>

          {/* Content Hierarchy: 3. Large SVG Illustration */}
          <div className="branding-illustration-container w-100 mb-4 d-flex align-items-center justify-content-center" style={{ maxWidth: '620px' }}>
            <svg 
              className="branding-svg-illustration w-100 h-auto" 
              viewBox="0 0 540 300" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ maxHeight: '340px' }}
            >
              {/* Cloud Network & Building Grid Background */}
              <path d="M20 270 H520" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="40" y="120" width="95" height="150" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
              <rect x="58" y="142" width="20" height="22" rx="3" fill="#1565C0" opacity="0.8" />
              <rect x="96" y="142" width="20" height="22" rx="3" fill="#1565C0" opacity="0.3" />
              <rect x="58" y="178" width="20" height="22" rx="3" fill="#1565C0" opacity="0.4" />
              <rect x="96" y="178" width="20" height="22" rx="3" fill="#1565C0" opacity="0.8" />
              <rect x="58" y="214" width="20" height="22" rx="3" fill="#1565C0" opacity="0.6" />
              <rect x="96" y="214" width="20" height="22" rx="3" fill="#1565C0" opacity="0.2" />

              {/* Main HQ Enterprise Gate Tower */}
              <rect x="175" y="60" width="160" height="210" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2.5" />
              <rect x="200" y="88" width="26" height="26" rx="4" fill="#1565C0" />
              <rect x="242" y="88" width="26" height="26" rx="4" fill="#1565C0" opacity="0.8" />
              <rect x="284" y="88" width="26" height="26" rx="4" fill="#1565C0" opacity="0.3" />
              <rect x="200" y="130" width="26" height="26" rx="4" fill="#1565C0" opacity="0.4" />
              <rect x="242" y="130" width="26" height="26" rx="4" fill="#1565C0" opacity="0.9" />
              <rect x="284" y="130" width="26" height="26" rx="4" fill="#1565C0" opacity="0.6" />
              <rect x="200" y="172" width="26" height="26" rx="4" fill="#1565C0" opacity="0.7" />
              <rect x="242" y="172" width="26" height="26" rx="4" fill="#1565C0" opacity="0.2" />
              <rect x="284" y="172" width="26" height="26" rx="4" fill="#1565C0" opacity="0.9" />

              {/* Digital Access Smart Shield / Gate Gateway */}
              <rect x="237" y="218" width="36" height="52" rx="4" fill="#1565C0" />
              <circle cx="255" cy="238" r="5" fill="#FFFFFF" />
              <line x1="255" y1="243" x2="255" y2="253" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

              {/* Secondary Tech Hub Building */}
              <rect x="375" y="135" width="110" height="135" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
              <rect x="396" y="158" width="22" height="22" rx="3" fill="#1565C0" opacity="0.5" />
              <rect x="440" y="158" width="22" height="22" rx="3" fill="#1565C0" opacity="0.8" />
              <rect x="396" y="194" width="22" height="22" rx="3" fill="#1565C0" opacity="0.3" />
              <rect x="440" y="194" width="22" height="22" rx="3" fill="#1565C0" opacity="0.7" />

              {/* Cloud Security Connection Arc & Central Shield Node */}
              <path d="M85 120 Q 255 10 430 135" stroke="#1565C0" strokeWidth="2.5" strokeDasharray="6 6" fill="none" opacity="0.6" />
              <circle cx="255" cy="55" r="32" fill="#FFFFFF" stroke="#1565C0" strokeWidth="2.5" />
              <path d="M245 55 L252 62 L266 48" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              <circle cx="85" cy="120" r="7" fill="#1565C0" />
              <circle cx="430" cy="135" r="7" fill="#1565C0" />
              <circle cx="255" cy="15" r="5" fill="#2E7D32" />
            </svg>
          </div>

          {/* Content Hierarchy: 4. Enterprise Feature Cards — pure CSS 3-col grid, no Bootstrap row conflict */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { icon: <ShieldCheck size={16} />, label: 'Secure' },
              { icon: <Cpu size={16} />, label: 'Scalable' },
              { icon: <Server size={16} />, label: 'Cloud Native' },
              { icon: <Users size={16} />, label: 'Multi-Tenant' },
              { icon: <Lock size={16} />, label: 'Role-Based AC' },
              { icon: <Activity size={16} />, label: 'Real-Time' },
            ].map(({ icon, label }) => (
              <div key={label} className="highlight-chip">
                <div className="highlight-icon-wrapper">{icon}</div>
                <span className="highlight-text">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="branding-footer-badge d-inline-flex align-items-center gap-2 small text-secondary fw-medium">
          <span className="dot rounded-circle bg-success" style={{ width: '7px', height: '7px' }}></span>
          <span>Trusted by Enterprise Organizations</span>
        </div>
      </div>

      {/* 35% Right Login Panel */}
      <div className="login-form-panel">
        <div className="login-form-container w-100" style={{ maxWidth: '420px' }}>
          <div className="login-form-header mb-4">
            {/* Single Primary Logo Asset */}
            <img 
              src={logoImg} 
              alt="GTM Smart Gate Logo" 
              className="login-form-logo mb-4"
              style={{ height: '44px', objectFit: 'contain' }}
            />
            <h2 className="login-title fw-bold text-dark h3 mb-2">Welcome Back</h2>
            <p className="login-subtitle text-secondary small mb-0">
              Sign in to the GTM Smart Gate Super Admin Portal.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="enterprise-form-group mb-3">
              <label className="enterprise-form-label form-label fw-semibold small text-dark mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="enterprise-input form-control"
                defaultValue="superadmin@gtm.com"
                required
                placeholder="name@company.com"
                style={{ height: '48px', borderRadius: '10px' }}
              />
            </div>

            <div className="enterprise-form-group mb-3">
              <label className="enterprise-form-label form-label fw-semibold small text-dark mb-2" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrapper position-relative d-flex align-items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="enterprise-input form-control pe-5"
                  defaultValue="••••••••••••"
                  required
                  style={{ height: '48px', borderRadius: '10px' }}
                />
                <button
                  type="button"
                  className="password-toggle-btn btn btn-link position-absolute end-0 text-secondary p-2 text-decoration-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options-row d-flex align-items-center justify-content-between mb-4 small">
              <label className="remember-me-label form-check-label d-flex align-items-center gap-2 text-secondary cursor-pointer">
                <input 
                  type="checkbox" 
                  className="remember-me-checkbox form-check-input mt-0" 
                  defaultChecked 
                />
                <span>Remember Me</span>
              </label>

              <a 
                href="#forgot-password" 
                className="forgot-password-link text-primary fw-semibold text-decoration-none"
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="enterprise-btn-primary btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2" style={{ height: '48px', borderRadius: '10px', backgroundColor: '#1565C0', borderColor: '#1565C0' }}>
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Subtle Divider */}
          <div className="login-divider position-relative text-center my-4 text-uppercase small text-muted">
            <span className="bg-white px-3 text-secondary" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Or continue with</span>
          </div>

          {/* Secondary Auth Methods (Google & OTP) — centered, compact */}
          <div className="d-flex justify-content-center gap-2 mb-3">
            <button 
              type="button" 
              className="secondary-auth-btn btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 text-dark bg-white border"
              style={{ height: '44px', borderRadius: '10px', padding: '0 20px' }}
              onClick={() => {}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>

            <button 
              type="button" 
              className="secondary-auth-btn btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 text-dark bg-white border"
              style={{ height: '44px', borderRadius: '10px', padding: '0 20px' }}
              onClick={() => {}}
            >
              <Smartphone size={18} className="text-primary" />
              <span>OTP</span>
            </button>
          </div>

          <div className="login-footer-info mt-4 pt-3 border-top text-center small text-secondary">
            <div>Version 2.4.0 Enterprise</div>
            <div className="copyright text-muted">© 2026 GTM Solutions Pvt. Ltd. All Rights Reserved.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;




/**
 * Login Page Component
 * Premium Enterprise SaaS Split Screen Login Experience.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, Server, Users, Activity, Lock, ArrowRight, Eye, EyeOff, Smartphone } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-shell">
      {/* 65% Left Branding Panel */}
      <div className="login-branding-panel">
        <div className="branding-content-wrapper">
          {/* Content Hierarchy: 1. Heading */}
          <h1 className="branding-tagline">
            Enterprise Visitor Management Platform
          </h1>
          
          {/* Content Hierarchy: 2. Short Description */}
          <p className="branding-subtext">
            Architected for secure enterprise environments, cloud deployment, real-time visitor governance, and scalable access management.
          </p>

          {/* Content Hierarchy: 3. Large SVG Illustration (Increased size ~40%) */}
          <div className="branding-illustration-container">
            <svg 
              className="branding-svg-illustration" 
              viewBox="0 0 540 300" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
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

          {/* Content Hierarchy: 4. Enterprise Feature Cards */}
          <div className="branding-highlights-grid">
            <div className="highlight-chip">
              <div className="highlight-icon-wrapper">
                <ShieldCheck size={18} />
              </div>
              <span className="highlight-text">Secure</span>
            </div>

            <div className="highlight-chip">
              <div className="highlight-icon-wrapper">
                <Cpu size={18} />
              </div>
              <span className="highlight-text">Scalable</span>
            </div>

            <div className="highlight-chip">
              <div className="highlight-icon-wrapper">
                <Server size={18} />
              </div>
              <span className="highlight-text">Cloud Native</span>
            </div>

            <div className="highlight-chip">
              <div className="highlight-icon-wrapper">
                <Users size={18} />
              </div>
              <span className="highlight-text">Multi-Tenant Architecture</span>
            </div>

            <div className="highlight-chip">
              <div className="highlight-icon-wrapper">
                <Lock size={18} />
              </div>
              <span className="highlight-text">Role Based Access Control</span>
            </div>

            <div className="highlight-chip">
              <div className="highlight-icon-wrapper">
                <Activity size={18} />
              </div>
              <span className="highlight-text">Real-Time Monitoring</span>
            </div>
          </div>
        </div>

        <div className="branding-footer-badge">
          <span className="dot"></span>
          <span>Trusted by Enterprise Organizations</span>
        </div>
      </div>

      {/* 35% Right Login Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            {/* Single Primary Logo Asset */}
            <img 
              src="/assets/image.png" 
              alt="GTM Smart Gate Logo" 
              className="login-form-logo" 
            />
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to the GTM Smart Gate Super Admin Portal.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="enterprise-form-group">
              <label className="enterprise-form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="enterprise-input"
                defaultValue="superadmin@gtm.com"
                required
                placeholder="name@company.com"
              />
            </div>

            <div className="enterprise-form-group">
              <label className="enterprise-form-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="enterprise-input"
                  defaultValue="••••••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="remember-me-label">
                <input 
                  type="checkbox" 
                  className="remember-me-checkbox" 
                  defaultChecked 
                />
                <span>Remember Me</span>
              </label>

              <a 
                href="#forgot-password" 
                className="forgot-password-link"
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="enterprise-btn-primary">
              <span>Sign In to GTM Portal</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Subtle Divider */}
          <div className="login-divider">
            <span>Or continue with</span>
          </div>

          {/* Secondary Auth Methods (Google & OTP) */}
          <div className="secondary-auth-grid">
            <button 
              type="button" 
              className="secondary-auth-btn"
              onClick={() => {}}
            >
              {/* Official Google G SVG Icon */}
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
              className="secondary-auth-btn"
              onClick={() => {}}
            >
              <Smartphone size={18} className="text-primary" />
              <span>Sign in with OTP</span>
            </button>
          </div>

          <div className="login-footer-info">
            <span>Version 2.4.0 Enterprise</span>
            <span className="copyright">© 2026 GTM Solutions Pvt. Ltd. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



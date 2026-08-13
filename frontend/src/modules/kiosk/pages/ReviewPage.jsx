/**
 * ReviewPage — Screen 7. Full summary of all collected visitor data before submission.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User, Mail, Tag, Clock, Car, Shield, Edit } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';
import { submitRegistration } from '../services/kioskApi';

const ReviewRow = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  return (
    <div className="kiosk-review-item">
      <span className="kiosk-review-label">{label}</span>
      <span className="kiosk-review-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />}
        {value}
      </span>
    </div>
  );
};

const ReviewPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (submitting || visitor.submitted) return;
    setSubmitting(true);

    const visitId = visitor.visitId || `VIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const approvalRequired = org?.kioskConfig?.approvalRequired !== false;

    const result = await submitRegistration(
      { ...visitor, visitId },
      orgId,
      { approvalRequired, siteName: 'Gate A — Self-Service Kiosk' }
    );

    updateVisitor({ visitId, passInfo: result, submitted: true });

    if (approvalRequired) {
      navigate(`/kiosk/${orgId}/waiting`);
    } else {
      navigate(`/kiosk/${orgId}/pass`);
    }
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content kiosk-content-md" style={{ margin: '0 auto', maxWidth: 820, width: '100%', padding: 0 }}>

          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>

            {/* In-Box Header (Dual Logos + Step 4/4 Counter) */}
            <KioskHeader currentStep={4} />

            <div className="kiosk-page-title" style={{ textAlign: 'center', marginBottom: 4, fontSize: 22 }}>
              <CheckCircle size={24} style={{ color: primary, verticalAlign: 'middle', marginRight: 8 }} />
              Review Your Details
            </div>
          <p className="kiosk-page-sub" style={{ textAlign: 'center', fontSize: 13, marginBottom: 20 }}>Please confirm all information before submitting your registration.</p>

          {/* Photo + Name */}
          <div className="kiosk-section-card" style={{ marginBottom: 16 }}>
            <div className="kiosk-section-card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {visitor.photoDataUrl
                  ? <img src={visitor.photoDataUrl} alt="Visitor" className="kiosk-review-photo" style={{ width: 80, height: 96 }} />
                  : <div className="kiosk-review-photo-placeholder" style={{ width: 80, height: 96 }}><User size={30} /></div>
                }
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                    {visitor.firstName || 'Visitor'} {visitor.lastName || ''}
                  </div>
                  <div style={{ fontSize: 14, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{visitor.company || 'Walk-in'}</div>
                  {visitor.phone && <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{visitor.phone}</div>}
                  <div style={{ marginTop: 8 }}>
                    <span className="kiosk-badge kiosk-badge-info" style={{ fontSize: 12, padding: '4px 12px' }}>
                      {visitor.visitorType || 'Visitor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="kiosk-section-card" style={{ marginBottom: 16 }}>
            <div className="kiosk-section-card-header" style={{ padding: '12px 20px' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Visit Details</span>
              <button className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm" onClick={() => navigate(`/kiosk/${orgId}/details`)} style={{ minHeight: 32, padding: '0 12px', borderRadius: 8, fontSize: 12 }}>
                <Edit size={13} /> Edit
              </button>
            </div>
            <div className="kiosk-section-card-body" style={{ padding: '16px 20px' }}>
              <div className="kiosk-review-grid" style={{ gap: 14 }}>
                <ReviewRow label="Email"    value={visitor.email}            icon={Mail}   />
                <ReviewRow label="Purpose"  value={visitor.purpose}          icon={Tag}    />
                <ReviewRow label="Duration" value={visitor.expectedDuration} icon={Clock}  />
                <ReviewRow label="Vehicle"  value={visitor.vehicleNumber}    icon={Car}    />
              </div>
            </div>
          </div>

          {/* Host */}
          {visitor.host && (
            <div className="kiosk-section-card" style={{ marginBottom: 16 }}>
              <div className="kiosk-section-card-header" style={{ padding: '12px 20px' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Host Employee</span>
                <button className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm" onClick={() => navigate(`/kiosk/${orgId}/employee`)} style={{ minHeight: 32, padding: '0 12px', borderRadius: 8, fontSize: 12 }}>
                  <Edit size={13} /> Change
                </button>
              </div>
              <div className="kiosk-section-card-body" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="kiosk-emp-avatar" style={{ background: visitor.host.color, width: 44, height: 44, fontSize: 16 }}>
                    {visitor.host.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{visitor.host.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{visitor.host.designation} · {visitor.host.department}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{visitor.host.floor}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ID Preview */}
          {visitor.idImageUrl && (
            <div className="kiosk-section-card" style={{ marginBottom: 16 }}>
              <div className="kiosk-section-card-header" style={{ padding: '12px 20px' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>ID Proof</span>
              </div>
              <div className="kiosk-section-card-body" style={{ textAlign: 'center', padding: '14px' }}>
                <img src={visitor.idImageUrl} alt="ID" style={{ maxWidth: '100%', height: 130, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #E5E7EB' }} />
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm" onClick={() => navigate(`/kiosk/${orgId}/identity`)} style={{ flex: 1, minHeight: 48 }}>
              <ArrowLeft size={18} /> Back
            </button>

            <button className="kiosk-btn kiosk-btn-primary" onClick={handleSubmit} disabled={submitting} style={{ flex: 2, minHeight: 48, fontSize: 16 }}>
              {submitting ? (
                <>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <> <CheckCircle size={20} /> Submit Registration </>
              )}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 16 }}>
            By submitting, your information will be used only for this visit.
          </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;

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
import { ID_TYPES, submitRegistration } from '../services/kioskApi';

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
  const idLabel = ID_TYPES.find(t => t.id === visitor.idType)?.label;

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
      <KioskHeader />
      <ProgressStepper currentStep={5} />

      <div className="kiosk-page">
        <div className="kiosk-content kiosk-content-md" style={{ margin: '0 auto' }}>

          <button className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm" onClick={() => navigate(`/kiosk/${orgId}/id-proof`)} style={{ marginBottom: 24 }}>
            <ArrowLeft size={18} /> Back
          </button>

          <div className="kiosk-page-title">
            <CheckCircle size={30} style={{ color: primary, verticalAlign: 'middle', marginRight: 10 }} />
            Review Your Details
          </div>
          <p className="kiosk-page-sub">Please confirm all information before submitting your registration.</p>

          {/* Photo + Name */}
          <div className="kiosk-section-card" style={{ marginBottom: 20 }}>
            <div className="kiosk-section-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                {visitor.photoDataUrl
                  ? <img src={visitor.photoDataUrl} alt="Visitor" className="kiosk-review-photo" />
                  : <div className="kiosk-review-photo-placeholder"><User size={36} /></div>
                }
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>
                    {visitor.firstName || 'Visitor'} {visitor.lastName || ''}
                  </div>
                  <div style={{ fontSize: 15, color: '#64748B', fontWeight: 500, marginTop: 4 }}>{visitor.company || 'Walk-in'}</div>
                  {visitor.phone && <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>{visitor.countryCode} {visitor.phone}</div>}
                  <div style={{ marginTop: 10 }}>
                    <span className="kiosk-badge kiosk-badge-info" style={{ fontSize: 13, padding: '5px 14px' }}>
                      {visitor.visitorType || 'Visitor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="kiosk-section-card" style={{ marginBottom: 20 }}>
            <div className="kiosk-section-card-header">
              <span style={{ fontWeight: 700, fontSize: 15 }}>Visit Details</span>
              <button className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm" onClick={() => navigate(`/kiosk/${orgId}/details`)} style={{ minHeight: 36, padding: '0 14px', borderRadius: 8, fontSize: 13 }}>
                <Edit size={14} /> Edit
              </button>
            </div>
            <div className="kiosk-section-card-body">
              <div className="kiosk-review-grid">
                <ReviewRow label="Email"    value={visitor.email}            icon={Mail}   />
                <ReviewRow label="Purpose"  value={visitor.purpose}          icon={Tag}    />
                <ReviewRow label="Duration" value={visitor.expectedDuration} icon={Clock}  />
                <ReviewRow label="Vehicle"  value={visitor.vehicleNumber}    icon={Car}    />
                <ReviewRow label="ID Type"  value={idLabel}                  icon={Shield} />
              </div>
            </div>
          </div>

          {/* Host */}
          {visitor.host && (
            <div className="kiosk-section-card" style={{ marginBottom: 20 }}>
              <div className="kiosk-section-card-header">
                <span style={{ fontWeight: 700, fontSize: 15 }}>Host Employee</span>
                <button className="kiosk-btn kiosk-btn-ghost kiosk-btn-sm" onClick={() => navigate(`/kiosk/${orgId}/employee`)} style={{ minHeight: 36, padding: '0 14px', borderRadius: 8, fontSize: 13 }}>
                  <Edit size={14} /> Change
                </button>
              </div>
              <div className="kiosk-section-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="kiosk-emp-avatar" style={{ background: visitor.host.color, width: 52, height: 52, fontSize: 18 }}>
                    {visitor.host.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#0F172A' }}>{visitor.host.name}</div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>{visitor.host.designation} · {visitor.host.department}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{visitor.host.floor}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ID Preview */}
          {visitor.idImageUrl && (
            <div className="kiosk-section-card" style={{ marginBottom: 20 }}>
              <div className="kiosk-section-card-header">
                <span style={{ fontWeight: 700, fontSize: 15 }}>ID Proof — {idLabel}</span>
              </div>
              <div className="kiosk-section-card-body" style={{ textAlign: 'center' }}>
                <img src={visitor.idImageUrl} alt="ID" style={{ maxWidth: '100%', height: 160, objectFit: 'cover', borderRadius: 12, border: '2px solid #E5E7EB' }} />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
            <button className="kiosk-btn kiosk-btn-secondary" onClick={() => navigate(`/kiosk/${orgId}/details`)}>
              <Edit size={18} /> Edit
            </button>
            <button className="kiosk-btn kiosk-btn-primary kiosk-btn-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <> <CheckCircle size={22} /> Submit Registration </>
              )}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 16 }}>
            By submitting, your information will be used only for this visit.
          </p>
        </div>
      </div>

      <KioskFooter />
    </div>
  );
};

export default ReviewPage;

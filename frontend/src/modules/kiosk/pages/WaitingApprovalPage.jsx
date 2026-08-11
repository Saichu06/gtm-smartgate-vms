/**
 * WaitingApprovalPage — Polls portal approval queue until admin approves or rejects.
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Bell, UserCheck } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import KioskFooter from '../components/Common/KioskFooter';
import ProgressStepper from '../components/Common/ProgressStepper';
import { useVisitor } from '../context/VisitorContext';
import { checkApprovalStatus } from '../services/kioskApi';
import '../styles/kiosk.css';

const TIMELINE_STEPS = [
  { id: 0, label: 'Registration Submitted', sub: 'Details recorded at Gate A kiosk' },
  { id: 1, label: 'Host Notified',          sub: 'SMS & App notification sent to host' },
  { id: 2, label: 'Host Reviewing',         sub: 'Security desk reviewing your request' },
  { id: 3, label: 'Approved & Access Granted', sub: 'Security gate clearance granted' },
];

const WaitingApprovalPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const [phase, setPhase] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    const visitId = visitor.visitId;
    if (!visitId) {
      navigate(`/kiosk/${orgId}/review`);
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1800);

    const poll = async () => {
      const result = await checkApprovalStatus(orgId, visitId);

      if (result.approved === true) {
        clearInterval(pollRef.current);
        setPhase(3);
        updateVisitor({
          passInfo: {
            passId: result.passId || result.record?.passId,
            visitId: result.visitId || visitId,
            gate: result.gate || result.record?.site,
            validUntil: result.validUntil,
          },
        });
        setTimeout(() => navigate(`/kiosk/${orgId}/pass`), 1200);
        return;
      }

      if (result.approved === false) {
        clearInterval(pollRef.current);
        setTimeout(() => navigate(`/kiosk/${orgId}/rejected`), 800);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orgId, visitor.visitId, navigate, updateVisitor]);

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '16px 12px' }}>
        <div className="kiosk-content" style={{ margin: '0 auto', maxWidth: 820, width: '100%', padding: 0 }}>
          <div className="kiosk-section-card" style={{ padding: '24px 28px', margin: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
            <KioskHeader currentStep={4} />

          <div className="kiosk-waiting-spinner">
            <div className="kiosk-waiting-spinner-outer" style={{ borderColor: `${primary}30`, borderTopColor: primary }} />
            <div className="kiosk-waiting-spinner-inner" style={{ borderColor: `${primary}20`, borderBottomColor: primary }} />
            <div className="kiosk-waiting-icon" style={{ color: primary }}>
              <Bell size={40} strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <h2 className="kiosk-waiting-title">Awaiting Host Approval</h2>
            <p className="kiosk-waiting-sub">
              {visitor.host
                ? `Notification sent to ${visitor.host.name || visitor.host} (${visitor.host.department || 'Host'}).`
                : 'Security desk officer is reviewing your entry request.'
              }
            </p>
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>
              Your request is in the corporate approval queue. Please wait while an admin reviews it.
            </p>
          </div>

          <div style={{
            background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0',
            padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            width: '100%',
          }}>
            <div className="kiosk-timeline">
              {TIMELINE_STEPS.map((step) => {
                const isDone = phase > step.id;
                const isCurrent = phase === step.id;
                return (
                  <div key={step.id} className={`kiosk-timeline-item ${isDone ? 'done' : ''}`}>
                    <div
                      className={`kiosk-timeline-dot ${isDone ? 'done' : ''} ${isCurrent ? 'pending' : ''}`}
                      style={{
                        background: isDone ? '#2E7D32' : isCurrent ? primary : '#E2E8F0',
                        borderColor: isCurrent ? primary : 'transparent',
                      }}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} style={{ color: '#fff' }} /> : null}
                    </div>
                    <div className="kiosk-timeline-text">
                      <strong style={{ color: isDone ? '#2E7D32' : isCurrent ? primary : '#94A3B8', fontSize: 15 }}>
                        {step.label}
                      </strong>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{step.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: 14 }}>
            <UserCheck size={18} style={{ color: primary }} />
            Please remain in front of the kiosk. Your pass will display once approved.
          </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingApprovalPage;

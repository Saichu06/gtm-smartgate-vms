/**
 * ProgressStepper — Horizontal step progress bar shown on all screens except Welcome/Rejected.
 */
import React from 'react';
import { Check } from 'lucide-react';
import '../../styles/kiosk.css';

const STEPS = [
  { label: 'Mobile' },
  { label: 'Details' },
  { label: 'Host' },
  { label: 'Photo' },
  { label: 'ID' },
  { label: 'Review' },
  { label: 'Approval' },
  { label: 'Pass' },
];

/**
 * @param {number} currentStep — 0-indexed step (0 = Mobile Lookup, 7 = Pass)
 */
const ProgressStepper = ({ currentStep = 0 }) => {
  return (
    <div className="kiosk-stepper">
      {STEPS.map((step, idx) => {
        const done   = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={idx} className="kiosk-step">
            <div className="kiosk-step-item">
              <div className={`kiosk-step-circle ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                {done ? <Check size={16} strokeWidth={3} /> : idx + 1}
              </div>
              <span className={`kiosk-step-label ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`kiosk-step-connector ${done ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStepper;

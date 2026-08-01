/**
 * WizardNavigation — Multi-step wizard progress indicator.
 * Displays steps with status: pending | active | completed.
 * Includes step counter and progress bar.
 */
import React from 'react';
import { Check } from 'lucide-react';

const WizardNavigation = ({ steps = [], currentStep }) => {
  const totalSteps = steps.length;
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="wizard-nav-wrapper">
      {/* Step counter */}
      <div className="wizard-step-counter">
        <span className="wizard-step-current">Step {currentStep}</span>
        <span className="wizard-step-separator"> of </span>
        <span className="wizard-step-total">{totalSteps}</span>
        <span className="wizard-step-label"> — {steps[currentStep - 1]?.label}</span>
      </div>

      {/* Progress track */}
      <div className="wizard-progress-track">
        <div className="wizard-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Step indicators */}
      <div className="wizard-steps-row">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={step.id}
              className={`wizard-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="wizard-step-circle">
                {isCompleted ? <Check size={13} /> : stepNum}
              </div>
              <span className="wizard-step-name">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardNavigation;

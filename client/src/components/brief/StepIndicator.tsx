import React from 'react';

type StepIndicatorProps = {
  currentStep: number;
};

const steps = [
  { number: 1, label: 'Client Details' },
  { number: 2, label: 'Objectives' },
  { number: 3, label: 'Creative' },
  { number: 4, label: 'Review' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-8 px-4 flex justify-between items-center relative max-w-2xl mx-auto">
      {/* Background Connector Line */}
      <div className="absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-[var(--border)] z-0" />

      {/* Active Connector Line - Smooth Width Transition */}
      <div
        className="absolute top-[52px] left-[10%] h-[2px] bg-[var(--primary)] z-0 transition-all duration-500 ease-in-out"
        style={{ width: `${Math.max(0, (currentStep - 1) * 26.6)}%` }}
      />

      {steps.map((step) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex flex-col items-center z-10 relative group">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${isCompleted
                  ? 'bg-blue-600 border-none text-white shadow-lg shadow-blue-600/20'
                  : isActive
                    ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-xl shadow-blue-500/10 ring ring-blue-500/10'
                    : 'bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-muted)]'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`
                mt-3 text-[11px] font-bold uppercase tracking-widest text-center transition-colors duration-200
                ${isActive ? 'text-blue-600' : isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
              `}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  );
};

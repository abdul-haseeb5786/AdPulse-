import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-page)] absolute inset-0 z-50">
      <div className="w-10 h-10 rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)] animate-[spin_0.8s_linear_infinite]" />
      <span className="text-[14px] font-medium tracking-wide text-[var(--text-muted)] mt-5">
        AdPulse
      </span>
    </div>
  );
};

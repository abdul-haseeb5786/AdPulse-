import React from 'react';

type KPICardProps = {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  isNeutral?: boolean;
};

export const KPICard: React.FC<KPICardProps> = ({ label, value, delta, deltaUp, isNeutral }) => {
  return (
    <div className="card card-hover p-5 flex flex-col justify-between group min-h-[120px]">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {label}
        </span>
        <div className="flex items-baseline gap-2 overflow-hidden">
          <h3 className="text-2xl font-mono font-bold text-[var(--text-primary)] leading-none truncate">
            {value}
          </h3>
        </div>
      </div>

      {delta && (
        <div className="mt-4">
          <span className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold
            ${isNeutral
              ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              : deltaUp
                ? 'bg-[var(--success-light)] text-[var(--success)] shadow-sm shadow-green-500/10'
                : 'bg-[var(--danger-light)] text-[var(--danger)] shadow-sm shadow-red-500/10'
            }
          `}>
            <span className="text-[12px] leading-none">
              {isNeutral ? '•' : deltaUp ? '↑' : '↓'}
            </span>
            {delta}
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';

type GeneratorLayoutProps = {
  title: string;
  subtitle: string;
  form: React.ReactNode;
  output: React.ReactNode;
};

export const GeneratorLayout: React.FC<GeneratorLayoutProps> = ({
  title,
  subtitle,
  form,
  output,
}) => {
  return (
    <div className="flex flex-col md:flex-row lg:flex-row gap-6 p-0">
      {/* ── Left: Form ── */}
      <div className="w-full md:w-[45%] lg:w-[40%] shrink-0 flex flex-col">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-6 shadow-sm flex-1 space-y-5">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </p>
          </div>
          {form}
        </div>
      </div>

      {/* ── Right: Output ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-6 shadow-sm flex-1">
          {output}
        </div>
      </div>
    </div>
  );
};

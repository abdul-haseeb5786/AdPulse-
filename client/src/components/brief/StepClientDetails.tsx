import React from 'react';

type StepClientDetailsProps = {
  data: {
    clientName: string;
    industry: string;
    website: string;
    competitors: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
};

const industries = [
  'Beauty', 'Technology', 'Fitness', 'Food & Beverage', 'Fashion', 'Finance', 'Other'
];

export const StepClientDetails: React.FC<StepClientDetailsProps> = ({ data, onChange, errors }) => {
  const inputClass = (field: string) => `
    w-full h-11 px-4 rounded-lg border bg-[var(--bg-surface)] text-sm transition-all duration-200 outline-none
    ${errors[field]
      ? 'border-red-500 bg-red-50/30 animate-shake focus:ring-4 focus:ring-red-500/10'
      : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10'
    }
  `;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
          Client Information
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Tell us about the brand we're promoting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Client Name *</label>
          <input
            type="text"
            className={inputClass('clientName')}
            placeholder="e.g. Lumiere Skincare"
            value={data.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
          />
          {errors.clientName && (
            <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.clientName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Industry</label>
          <div className="relative">
            <select
              className={inputClass('industry')}
              value={data.industry}
              onChange={(e) => onChange('industry', e.target.value)}
            >
              <option value="">Select Industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Website URL</label>
          <input
            type="url"
            className={inputClass('website')}
            placeholder="https://brand.com"
            value={data.website}
            onChange={(e) => onChange('website', e.target.value)}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Key Competitors</label>
          <textarea
            className={`${inputClass('competitors')} min-h-[100px] py-3 resize-none`}
            placeholder="List main competitors (separated by commas)"
            value={data.competitors}
            onChange={(e) => onChange('competitors', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

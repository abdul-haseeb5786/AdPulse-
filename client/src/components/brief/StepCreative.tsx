import React from 'react';

type StepCreativeProps = {
  data: {
    tone: string;
    imageryStyle: string;
    colorDirection: string;
    dos: string;
    donts: string;
  };
  onChange: (field: string, value: string) => void;
};

const tones = ['Professional', 'Playful', 'Minimalist', 'Luxury', 'Bold', 'Friendly', 'Tech-focused'];
const imageryStyles = ['Photographic', 'Illustrated', '3D Render', 'Minimalist Graphics', 'Mixed Media'];

export const StepCreative: React.FC<StepCreativeProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
          Creative Direction
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">How should the brand look and feel?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Tone of Voice</label>
          <select
            className="w-full h-11 px-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
            value={data.tone}
            onChange={(e) => onChange('tone', e.target.value)}
          >
            <option value="">Select Tone</option>
            {tones.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Imagery Style</label>
          <select
            className="w-full h-11 px-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
            value={data.imageryStyle}
            onChange={(e) => onChange('imageryStyle', e.target.value)}
          >
            <option value="">Select Style</option>
            {imageryStyles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Color Direction</label>
          <input
            type="text"
            className="w-full h-11 px-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
            placeholder="Describe preferred colors (hex codes, palette names, or moods)"
            value={data.colorDirection}
            onChange={(e) => onChange('colorDirection', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Must Include (Do's)</label>
          <textarea
            className="w-full h-24 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none"
            placeholder="Important brand elements, specific phrases, or features"
            value={data.dos}
            onChange={(e) => onChange('dos', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Avoid (Don'ts)</label>
          <textarea
            className="w-full h-24 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none"
            placeholder="Visual cliches, sensitive topics, or competitors' slogans"
            value={data.donts}
            onChange={(e) => onChange('donts', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

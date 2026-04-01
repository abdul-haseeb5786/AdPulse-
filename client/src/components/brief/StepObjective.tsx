import React from 'react';

type StepObjectiveProps = {
  data: {
    objective: string;
    targetAudience: string;
    budget: string;
  };
  onChange: (field: string, value: string) => void;
};

const objectives = [
  { id: 'awareness', label: 'Awareness', icon: '📢', desc: 'Reach new audiences and build brand recognition.' },
  { id: 'consideration', label: 'Consideration', icon: '🤝', desc: 'Drive engagement and pique interest in products.' },
  { id: 'conversion', label: 'Conversion', icon: '💰', desc: 'Generate leads and sales for the business.' },
];

export const StepObjective: React.FC<StepObjectiveProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
          Campaign Strategy
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Define your goals and who we're talking to</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {objectives.map((obj) => (
          <button
            key={obj.id}
            onClick={() => onChange('objective', obj.id)}
            className={`
              flex flex-col p-6 rounded-xl border transition-all duration-200 text-left relative group
              ${data.objective === obj.id
                ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20'
                : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]/50'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-full mb-4 flex items-center justify-center text-xl transition-all duration-300
              ${data.objective === obj.id ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-[var(--bg-subtle)]'}
            `}>
              {obj.icon}
            </div>
            <h3 className={`text-md font-bold mb-1 transition-colors ${data.objective === obj.id ? 'text-blue-700' : 'text-[var(--text-primary)]'}`}>
              {obj.label}
            </h3>
            <p className="text-[12px] font-medium leading-relaxed text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {obj.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Target Audience</label>
          <textarea
            className="w-full h-24 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none"
            placeholder="Describe your ideal customers (demographics, interests, behaviors)"
            value={data.targetAudience}
            onChange={(e) => onChange('targetAudience', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Monthly Budget</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">$</span>
            <input
              type="number"
              className="w-full h-11 pl-8 pr-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm font-bold focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
              placeholder="0.00"
              min="1000"
              value={data.budget}
              onChange={(e) => onChange('budget', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

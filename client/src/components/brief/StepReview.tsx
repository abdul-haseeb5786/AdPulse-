import React from 'react';

type StepReviewProps = {
  briefData: {
    clientName: string;
    industry: string;
    website: string;
    competitors: string;
    objective: string;
    targetAudience: string;
    budget: string;
    tone: string;
    imageryStyle: string;
    colorDirection: string;
    dos: string;
    donts: string;
  };
};

export const StepReview: React.FC<StepReviewProps> = ({ briefData }) => {
  const SummarySection = ({ title, children, number }: { title: string; children: React.ReactNode; number: number }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 border-2 border-blue-600 text-blue-600 font-bold text-[11px] rounded-full flex items-center justify-center shrink-0">
          {number}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pl-9">
        {children}
      </div>
    </div>
  );

  const DataPoint = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <p className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
        {value || <span className="italic text-gray-400">Not specified</span>}
      </p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
          Review & Finalize
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Verify all details before generating the AI brief</p>
      </div>

      <div className="space-y-12">
        <SummarySection title="Client Information" number={1}>
          <DataPoint label="Client Name" value={briefData.clientName} />
          <DataPoint label="Industry" value={briefData.industry} />
          <DataPoint label="Website" value={briefData.website} />
          <DataPoint label="Competitors" value={briefData.competitors} />
        </SummarySection>

        <SummarySection title="Campaign Objectives" number={2}>
          <DataPoint label="Objective" value={briefData.objective.toUpperCase()} />
          <DataPoint label="Target Audience" value={briefData.targetAudience} />
          <DataPoint label="Budget" value={`$${briefData.budget}`} />
        </SummarySection>

        <SummarySection title="Creative Direction" number={3}>
          <DataPoint label="Tone of Voice" value={briefData.tone} />
          <DataPoint label="Imagery Style" value={briefData.imageryStyle} />
          <DataPoint label="Color Direction" value={briefData.colorDirection} />
          <DataPoint label="Must Include (Do's)" value={briefData.dos} />
          <DataPoint label="Avoid (Don'ts)" value={briefData.donts} />
        </SummarySection>
      </div>

      <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
        <div className="w-5 h-5 mt-0.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[13px] font-medium text-blue-800 leading-relaxed">
          AI will use these details to generate a structured creative strategy including headlines, channel mix, and visual guidelines.
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StepIndicator } from '../components/brief/StepIndicator';
import { useDarkMode } from '../hooks/useDarkMode';
import { StepClientDetails } from '../components/brief/StepClientDetails';
import { StepObjective } from '../components/brief/StepObjective';
import { StepCreative } from '../components/brief/StepCreative';
import { StepReview } from '../components/brief/StepReview';
import { AIOutputDisplay } from '../components/brief/AIOutputDisplay';
import { useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';

type BriefData = {
  // Step 1
  clientName: string;
  industry: string;
  website: string;
  competitors: string;
  // Step 2
  objective: string;
  targetAudience: string;
  budget: string;
  // Step 3
  tone: string;
  imageryStyle: string;
  colorDirection: string;
  dos: string;
  donts: string;
};

type AIOutput = {
  campaignTitle: string;
  headlines: string[];
  toneGuide: string;
  channels: { name: string; budgetPercent: number }[];
  visualDirection: string;
  keyMessages: string[];
};

export const BriefBuilder: React.FC = () => {
  const { onMenuToggle, showToast } = useOutletContext<{ onMenuToggle: () => void, showToast: (m: string, t: 'success' | 'info') => void }>();
  const [isDark, toggleDark] = useDarkMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [briefData, setBriefData] = useState<BriefData>({
    clientName: '',
    industry: '',
    website: '',
    competitors: '',
    objective: 'awareness',
    targetAudience: '',
    budget: '',
    tone: '',
    imageryStyle: '',
    colorDirection: '',
    dos: '',
    donts: '',
  });

  const handleFieldChange = (field: string, value: string) => {
    setBriefData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!briefData.clientName.trim()) {
        newErrors.clientName = 'Client name is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 4) setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleStartOver = () => {
    setBriefData({
      clientName: '',
      industry: '',
      website: '',
      competitors: '',
      objective: 'awareness',
      targetAudience: '',
      budget: '',
      tone: '',
      imageryStyle: '',
      colorDirection: '',
      dos: '',
      donts: '',
    });
    setAiOutput(null);
    setApiError(null);
    setErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_AI_SERVICE_URL}/generate/brief`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('adpulse-token')}`
        },
        body: JSON.stringify(briefData)
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError("API error: " + (data.error?.message || "Unknown error"));
        return;
      }

      const rawResponse = data.choices[0].message.content;
      let cleanRaw = rawResponse.trim();

      const firstBraceIndex = cleanRaw.indexOf('{');
      const lastBraceIndex = cleanRaw.lastIndexOf('}');

      if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
        cleanRaw = cleanRaw.substring(firstBraceIndex, lastBraceIndex + 1);
      }

      try {
        const parsed = JSON.parse(cleanRaw);
        setAiOutput(parsed);
        setCurrentStep(5);
      } catch (parseErr) {
        setApiError("AI returned unexpected format, please try again");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to API, please check your network';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <StepClientDetails data={briefData} onChange={handleFieldChange} errors={errors} />;
      case 2: return <StepObjective data={briefData} onChange={handleFieldChange} />;
      case 3: return <StepCreative data={briefData} onChange={handleFieldChange} />;
      case 4: return <StepReview briefData={briefData} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] transition-all duration-200">
      <TopBar
        isDark={isDark}
        toggleDark={toggleDark}
        activeDate=""
        onDateChange={() => { }}
        onMenuToggle={onMenuToggle}
        title="Brief Builder"
        subtitle="Generate new campaign briefs with AI"
        showToast={showToast}
      />

      <div className="max-w-3xl mx-auto w-full p-4 lg:p-8 flex-1 flex flex-col">
        {currentStep < 5 && (
          <div className="animate-fadeIn">
            <StepIndicator currentStep={currentStep} />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className={`p-0 flex-1 ${currentStep < 5 ? 'card overflow-hidden shadow-xl mt-6' : ''}`}>
            <div className={`p-6 lg:p-10 ${currentStep < 5 ? 'bg-[var(--bg-surface)]' : ''}`}>
              {apiError && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-3 animate-shake">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold">{apiError}</span>
                </div>
              )}

              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-20">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Analyzing Brief...</h3>
                  <p className="text-[13px] font-medium text-[var(--text-muted)]">Our creative AI is crafting your strategy</p>
                </div>
              ) : currentStep === 5 ? (
                aiOutput && (
                  <AIOutputDisplay
                    briefData={briefData}
                    aiOutput={aiOutput}
                    onStartOver={handleStartOver}
                  />
                )
              ) : (
                renderStepContent()
              )}
            </div>

            {currentStep < 5 && !isLoading && (
              <div className="px-6 lg:px-10 py-6 border-t border-[var(--border)] flex flex-col sm:flex-row gap-3 justify-between items-center bg-[var(--bg-subtle)]/30 backdrop-blur-sm">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`
                    w-full sm:w-auto px-6 h-11 rounded-lg font-bold text-sm transition-all
                    ${currentStep === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  Back
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto px-10 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-lg shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10">Generate Brief</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

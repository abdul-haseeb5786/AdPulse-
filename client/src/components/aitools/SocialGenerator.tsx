import { useState } from 'react';
import { MICROSERVICE_URL } from '../../config/api';
import { useClipboard } from '../../hooks/useClipboard';
import { GeneratorLayout } from './GeneratorLayout';

const platforms = [
  { value: 'instagram', label: 'Instagram',  dot: 'bg-pink-500',   limit: 2200 },
  { value: 'twitter',   label: 'Twitter / X', dot: 'bg-sky-500',    limit: 280  },
  { value: 'linkedin',  label: 'LinkedIn',    dot: 'bg-blue-600',   limit: 3000 },
  { value: 'tiktok',    label: 'TikTok',      dot: 'bg-gray-900',   limit: 2200 },
  { value: 'facebook',  label: 'Facebook',    dot: 'bg-indigo-600', limit: 63206 },
];

// Shimmer skeleton for 5 caption cards
const SkeletonCard = () => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 mb-3 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-5 w-16 bg-[var(--bg-subtle)] rounded-full" />
      <div className="h-5 w-20 bg-[var(--bg-subtle)] rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-[var(--bg-subtle)] rounded" />
      <div className="h-3 w-5/6 bg-[var(--bg-subtle)] rounded" />
      <div className="h-3 w-4/6 bg-[var(--bg-subtle)] rounded" />
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-7 w-14 bg-[var(--bg-subtle)] rounded-lg" />
      <div className="h-7 w-24 bg-[var(--bg-subtle)] rounded-lg" />
    </div>
  </div>
);

const CaptionCard = ({ caption, index, platform }: { caption: any; index: number; platform: string }) => {
  const limit = platforms.find(p => p.value === platform)?.limit || 2200;
  const charCount = caption.text?.length || caption.characterCount || 0;
  const isOver = charCount > limit;
  
  const { copied: isCopied, copy: copyText } = useClipboard();
  const { copied: isUsed, copy: useText } = useClipboard();

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 mb-3
                    hover:border-[var(--primary)]/40 hover:shadow-sm transition-all">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="px-2.5 py-0.5 bg-[var(--bg-subtle)] rounded-full text-[11px] font-bold text-[var(--text-secondary)]">
          Option {index + 1}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          isOver
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {charCount} / {limit.toLocaleString()}
        </span>
      </div>

      {/* Caption text */}
      <p className="text-[14px] text-[var(--text-primary)] leading-[1.6] mb-4">
        {caption.text}
      </p>

      {/* Bottom row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => copyText(caption.text)}
          className="h-7 px-3 text-[11px] font-semibold border border-[var(--border)] rounded-lg
                     text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-all"
        >
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
        <button
          onClick={() => useText(caption.text)}
          className="h-7 px-3 text-[11px] font-semibold border border-[var(--border)] rounded-lg
                     text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-all"
        >
          {isUsed ? '✓ Added to Brief' : 'Use in Brief'}
        </button>
      </div>
    </div>
  );
};

export const SocialGenerator = () => {
  const [form, setForm] = useState({
    platform: 'instagram',
    campaign_goal: '',
    brand_voice: '',
  });
  const [captions, setCaptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const selectedPlatform = platforms.find(p => p.value === form.platform);

  const handleGenerate = async () => {
    setIsLoading(true);
    setHasGenerated(true);
    setCaptions([]);
    setError('');

    try {
      const res = await fetch(`${MICROSERVICE_URL}/generate/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errors?.[0]?.message || err.error || 'Request failed');
      }

      const data = await res.json();
      setCaptions(data.data.captions || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneratorLayout
      title="Social Media Captions"
      subtitle="Generate 5 platform-native caption options"
      form={
        <>

          {/* Platform card grid */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(p => (
                <button
                  key={p.value}
                  onClick={() => setForm(prev => ({ ...prev, platform: p.value }))}
                  className={`
                    flex items-center gap-2.5 h-12 px-3 rounded-lg transition-all cursor-pointer
                    ${form.platform === p.value
                      ? 'border-2 border-[var(--primary)] bg-[var(--primary-light)]'
                      : 'border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/40'
                    }
                  `}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                  <span className={`text-[13px] font-semibold ${
                    form.platform === p.value ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Goal */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Campaign Goal
            </label>
            <textarea
              rows={3}
              value={form.campaign_goal}
              onChange={e => setForm(p => ({ ...p, campaign_goal: e.target.value }))}
              placeholder="e.g. Drive app downloads, Increase brand awareness, Promote summer sale..."
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10
                         resize-none transition-all"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Brand Voice
            </label>
            <input
              type="text"
              value={form.brand_voice}
              onChange={e => setForm(p => ({ ...p, brand_voice: e.target.value }))}
              placeholder="e.g. Fun and energetic, Professional and trustworthy..."
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--danger-light)]
                            border border-[var(--danger)]/20 text-[var(--danger)]">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px] font-medium">Something went wrong: {error}</p>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !form.campaign_goal.trim() || !form.brand_voice.trim()}
            className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                       disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg
                       transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Generating...
              </>
            ) : 'Generate 5 Captions'}
          </button>
        </>
      }
      output={
        <>
          {/* Platform limit hint */}
        {selectedPlatform && (hasGenerated || captions.length > 0) && (
          <p className="text-[12px] text-[var(--text-muted)] mb-3">
            Platform limit: <span className="font-semibold">{selectedPlatform.limit.toLocaleString()} characters</span>
          </p>
        )}

        {/* Placeholder state */}
        {!hasGenerated && captions.length === 0 && !isLoading && (
          <div className="flex items-center justify-center border-2 border-dashed border-[var(--border)]
                          rounded-xl min-h-[300px] text-[var(--text-muted)] text-[13px] font-medium">
            5 caption options will appear here
          </div>
        )}

        {/* Skeleton loading */}
        {isLoading && (
          <div>
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!isLoading && captions.length > 0 && (
          <div className="animate-fadeIn">
            {captions.map((caption, i) => (
              <CaptionCard
                key={caption.id || i}
                caption={caption}
                index={i}
                platform={form.platform}
              />
            ))}

            {/* Regenerate */}
            <button
              onClick={handleGenerate}
              className="w-full h-10 mt-1 border border-[var(--border)] text-[var(--text-secondary)]
                         hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]
                         text-[13px] font-semibold rounded-xl transition-all"
            >
              ↺ Regenerate
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        </>
      }
    />
  );
};

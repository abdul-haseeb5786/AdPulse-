import { useState } from 'react';
import { MICROSERVICE_URL } from '../../config/api';
import { useClipboard } from '../../hooks/useClipboard';
import { GeneratorLayout } from './GeneratorLayout';

const industries = [
  'Beauty', 'Technology', 'Fitness', 'Food & Beverage', 'Fashion',
  'Finance', 'Travel', 'Education', 'Healthcare', 'Real Estate',
  'Entertainment', 'Sports', 'Other',
];

interface Hashtag {
  tag: string;
  volume: 'high' | 'medium' | 'niche';
  relevanceScore: number;
}

interface HashtagResult {
  hashtags: Hashtag[];
  recommendedCombination: string;
}

// CSS-only 3-segment volume indicator
const VolumeBar = ({ filled, color }: { filled: number; color: string }) => (
  <div className="flex items-center gap-[2px]">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: 16, height: 4, borderRadius: 2,
          background: i < filled ? color : 'var(--border)',
          transition: 'background 0.3s',
        }}
      />
    ))}
  </div>
);

const volumeSections = [
  {
    key: 'high',
    label: 'High Volume',
    filled: 3,
    color: '#ef4444',     // red
    description: '1M+ posts',
  },
  {
    key: 'medium',
    label: 'Medium Volume',
    filled: 2,
    color: '#d97706',     // amber
    description: '100K – 1M posts',
  },
  {
    key: 'niche',
    label: 'Niche / Targeted',
    filled: 1,
    color: '#16a34a',     // green
    description: 'Under 100K posts',
  },
];

const getScoreBadge = (score: string | number) => {
  const n = Number(score);
  if (n >= 8) return { bg: 'var(--success-light)', color: 'var(--success)' };
  if (n >= 5) return { bg: 'var(--warning-light)', color: 'var(--warning)' };
  return { bg: 'var(--bg-subtle)', color: 'var(--text-muted)' };
};

const HashtagRow = ({ tag }: { tag: Hashtag }) => {
  const { copied, copy } = useClipboard();
  const badge = getScoreBadge(tag.relevanceScore);

  return (
    <div className="flex items-center gap-3 py-2 px-1 group hover:bg-[var(--bg-subtle)] rounded-lg transition-colors">
      <span className="text-[14px] font-medium text-[var(--text-primary)] flex-1">{tag.tag}</span>
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: badge.bg, color: badge.color }}
      >
        {tag.relevanceScore}/10
      </span>
      <button
        onClick={() => copy(tag.tag)}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center
                   rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
        title="Copy hashtag"
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// Skeleton for loading state
const SkeletonOutput = () => (
  <div className="space-y-6 animate-pulse">
    {/* Recommended combination skeleton */}
    <div className="p-4 rounded-xl border border-[var(--border)]">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-32 bg-[var(--bg-subtle)] rounded" />
        <div className="h-7 w-20 bg-[var(--bg-subtle)] rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-7 w-24 bg-[var(--bg-subtle)] rounded-full" />
        ))}
      </div>
    </div>

    <div className="h-px bg-[var(--border)]" />

    {/* Hashtag rows skeleton */}
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-1">
        <div className="h-4 flex-1 bg-[var(--bg-subtle)] rounded" />
        <div className="h-5 w-10 bg-[var(--bg-subtle)] rounded-full" />
        <div className="h-7 w-7 bg-[var(--bg-subtle)] rounded-md" />
      </div>
    ))}
  </div>
);

export const HashtagGenerator = () => {
  const [form, setForm] = useState({ content: '', industry: 'Beauty' });
  const [result, setResult] = useState<HashtagResult>({ hashtags: [], recommendedCombination: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { copied, copy } = useClipboard();
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setHasGenerated(true);
    setResult({ hashtags: [], recommendedCombination: '' });
    setError('');

    try {
      const res = await fetch(`${MICROSERVICE_URL}/generate/hashtags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errors?.[0]?.message || err.error || 'Request failed');
      }

      const data = await res.json();
      setResult(data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Split hashtags by volume tier
  const byVolume = (volume: 'high' | 'medium' | 'niche') => result.hashtags?.filter((h: Hashtag) => h.volume === volume) || [];

  return (
    <GeneratorLayout
      title="Hashtag Generator"
      subtitle="Get 10 targeted hashtags with volume insights"
      form={
        <>
          {/* Content textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                Content Description
              </label>
              <span className={`text-[10px] font-medium ${form.content.length > 450 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`}>
                {form.content.length} / 500
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Describe your post content, product, or campaign in detail..."
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10
                         resize-none transition-all"
            />
          </div>

          {/* Industry select */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Industry
            </label>
            <select
              value={form.industry}
              onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            >
              {industries.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
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
            disabled={isLoading || !form.content.trim() || !form.industry}
            className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                       disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg
                       transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block', width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Generating...
              </>
            ) : '# Generate Hashtags'}
          </button>
        </>
      }
      output={
        <>
          {/* Placeholder */}
          {!hasGenerated && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-[var(--border)]
                            rounded-xl text-[var(--text-muted)] text-[13px] font-medium">
              Your hashtags will appear here
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && <SkeletonOutput />}

          {/* Results */}
          {!isLoading && result.hashtags?.length > 0 && (
            <div className="animate-fadeIn space-y-5">
              {/* Section 1: Recommended combination */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Best Combination
                  </span>
                  <button
                    onClick={() => copy(result.recommendedCombination)}
                    className="h-7 px-3 text-[11px] font-semibold border border-[var(--border)] rounded-lg
                               text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all"
                  >
                    {copied ? '✓ Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.recommendedCombination
                    ?.split(' ')
                    .filter(t => t.startsWith('#'))
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-[13px] font-medium"
                        style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(37,99,235,0.2)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--border)]" />

              {/* Section 2: All hashtags by volume tier */}
              <div>
                <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">
                  All Hashtags
                </p>
                <div className="space-y-5">
                  {volumeSections.map(section => {
                    const tags = byVolume(section.key as 'high' | 'medium' | 'niche');
                    if (!tags.length) return null;
                    return (
                      <div key={section.key}>
                        {/* Volume section header */}
                        <div className="flex items-center gap-3 mb-2">
                          <VolumeBar filled={section.filled} color={section.color} />
                          <span className="text-[12px] font-bold text-[var(--text-secondary)]">{section.label}</span>
                          <span className="text-[11px] text-[var(--text-muted)]">{section.description}</span>
                        </div>

                        {/* Hashtag rows */}
                        <div className="divide-y divide-[var(--border)]/50">
                          {tags.map((tag, i) => (
                            <HashtagRow key={i} tag={tag} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Regenerate */}
              <button
                onClick={handleGenerate}
                className="w-full h-10 border border-[var(--border)] text-[var(--text-secondary)]
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

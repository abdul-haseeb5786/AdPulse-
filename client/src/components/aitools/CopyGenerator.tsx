import { useState } from 'react';
import { MICROSERVICE_URL } from '../../config/api';
import { useClipboard } from '../../hooks/useClipboard';
import { GeneratorLayout } from './GeneratorLayout';

const tones = [
  'Professional', 'Playful', 'Luxurious', 'Bold',
  'Minimalist', 'Inspirational', 'Urgent', 'Friendly'
];

const platforms = [
  { value: 'instagram', label: '[IG] Instagram' },
  { value: 'facebook',  label: '[FB] Facebook' },
  { value: 'twitter',   label: '[TW] Twitter / X' },
  { value: 'linkedin',  label: '[LI] LinkedIn' },
  { value: 'tiktok',    label: '[TK] TikTok' },
  { value: 'google',    label: '[GG] Google Ads' },
  { value: 'youtube',   label: '[YT] YouTube' },
];

const CopyButton = ({ text }: { text: string }) => {
  const { copied, copy } = useClipboard();
  return (
    <button
      onClick={() => copy(text)}
      className="h-7 px-2.5 text-[11px] font-semibold border border-[var(--border)] rounded-md
                 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-all"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export const CopyGenerator = () => {
  const [form, setForm] = useState({
    product: '',
    tone: 'professional',
    platform: 'instagram',
    word_limit: 150,
  });
  const [output, setOutput] = useState({ headline: '', body: '', cta: '' });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const tryParsePartial = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') setOutput(parsed);
    } catch {
      // Still streaming — ignore
    }
  };

  const parseOutputJSON = (text: string) => {
    try {
      const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        setOutput(JSON.parse(match[0]));
      } else {
        setError('Failed to parse AI response');
      }
    } catch {
      setError('Failed to parse AI response');
    }
  };

  const handleGenerate = async () => {
    setIsStreaming(true);
    setHasStarted(true);
    setStreamedText('');
    setOutput({ headline: '', body: '', cta: '' });
    setError('');

    try {
      const response = await fetch(`${MICROSERVICE_URL}/generate/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tone: form.tone.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || `HTTP ${response.status}`);
        setIsStreaming(false);
        return;
      }

      if (!response.body) throw new Error('No body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', '').trim());

            if (data.done) {
              setIsStreaming(false);
              parseOutputJSON(accumulated);
              return;
            }
            if (data.error) {
              setError(data.error);
              setIsStreaming(false);
              return;
            }
            if (data.chunk) {
              accumulated += data.chunk;
              setStreamedText(accumulated);
              tryParsePartial(accumulated);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err: any) {
      setError('Connection failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsStreaming(false);
    }
  };

  const isDone = !isStreaming && hasStarted && !error;

  return (
    <GeneratorLayout
      title="Ad Copy Generator"
      subtitle="Generate platform-ready advertising copy instantly"
      form={
        <>
          {/* Product */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Product / Service
            </label>
            <textarea
              rows={3}
              value={form.product}
              onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
              placeholder="Describe your product or service in detail..."
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10
                         resize-none transition-all"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Tone of Voice
            </label>
            <select
              value={form.tone}
              onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            >
              {tones.map(t => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Platform
            </label>
            <select
              value={form.platform}
              onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            >
              {platforms.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Word Limit */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
              Word Limit:{' '}
              <span className="text-[var(--primary)] normal-case font-bold">{form.word_limit} words</span>
            </label>
            <input
              type="range" min={50} max={500} step={10}
              value={form.word_limit}
              onChange={e => setForm(p => ({ ...p, word_limit: Number(e.target.value) }))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>50</span><span>500</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-[13px] font-medium">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isStreaming || !form.product.trim()}
            className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50
                       disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all
                       flex items-center justify-center gap-2"
          >
            {isStreaming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating
                <span className="animate-pulse">...</span>
              </>
            ) : 'Generate Copy'}
          </button>
        </>
      }
      output={
        <>
          {!hasStarted ? (
          /* Empty state */
          <div className="flex items-center justify-center border-2 border-dashed border-[var(--border)]
                          rounded-xl min-h-[300px] text-[var(--text-muted)] text-[13px] font-medium">
            Your generated copy will appear here
          </div>
        ) : (
          <div className="space-y-4">
            {/* Headline Card */}
            <div className="rounded-[10px] border p-4"
                 style={{ background: 'var(--primary-light)', borderColor: 'rgba(37,99,235,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Headline</span>
                {isDone && output.headline && <CopyButton text={output.headline} />}
              </div>
              <p className="text-[15px] font-bold text-[var(--text-primary)] leading-snug min-h-[22px]">
                {output.headline || (isStreaming ? '' : '')}
                {isStreaming && !output.headline && (
                  <span style={{ animation: 'blink 1s infinite' }} className="opacity-100">|</span>
                )}
              </p>
            </div>

            {/* Body Card */}
            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Body Copy</span>
                {isDone && output.body && <CopyButton text={output.body} />}
              </div>
              <p className="text-[14px] text-[var(--text-primary)] leading-relaxed min-h-[44px]">
                {output.body}
                {isStreaming && output.headline && !output.body && (
                  <span style={{ animation: 'blink 1s infinite' }}>|</span>
                )}
              </p>
            </div>

            {/* CTA Card */}
            <div className="rounded-[10px] border p-4"
                 style={{ background: 'var(--success-light)', borderColor: 'rgba(22,163,74,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Call to Action</span>
                {isDone && output.cta && <CopyButton text={output.cta} />}
              </div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)] min-h-[22px]">
                {output.cta}
                {isStreaming && output.body && !output.cta && (
                  <span style={{ animation: 'blink 1s infinite' }}>|</span>
                )}
              </p>
            </div>

            {/* Raw stream indicator (while streaming, before JSON parses) */}
            {isStreaming && !output.headline && streamedText && (
              <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]
                              font-mono text-[12px] text-[var(--text-secondary)] max-h-32 overflow-hidden">
                {streamedText}
                <span style={{ animation: 'blink 1s infinite' }}>|</span>
              </div>
            )}

            {/* Regenerate */}
            {isDone && (
              <button
                onClick={handleGenerate}
                className="w-full h-10 border border-[var(--border)] text-[var(--text-secondary)]
                           hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]
                           text-[13px] font-semibold rounded-lg transition-all"
              >
                ↺ Regenerate
              </button>
            )}
          </div>
        )}
        
        {/* Blink keyframe */}
        <style>{`
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        `}</style>
        </>
      }
    />
  );
};

/**
 * EXTRACT PROFILE
 * ===============
 * The visible half of POST /api/extract.
 *
 * The user writes one messy sentence about their work. DeepSeek returns a
 * structured profile, but only with skills and competencies that already exist
 * in the app's vocabulary — the server throws away anything it invented, and
 * this component merges the rest into the form.
 *
 * Nothing is saved: the result lands in the in-page draft, which the user can
 * still edit before building a plan.
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

type ExtractedProfile = {
  currentRole: string;
  yearsExperience: number;
  skills: string[];
  competencies: string[];
  summary: string;
  model: string;
};

type ExtractProfileProps = {
  onApply: (result: ExtractedProfile) => void;
};

const PLACEHOLDER =
  'e.g. I have been a staff nurse for 6 years, mostly on the ward doing patient documentation, scheduling shifts and explaining procedures to families.';

export function ExtractProfile({ onApply }: ExtractProfileProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<ExtractedProfile | null>(null);

  async function extract() {
    setIsLoading(true);
    setError(null);
    setApplied(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const payload = (await response.json().catch(() => null)) as
        | (ExtractedProfile & { message?: string })
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Extraction failed (HTTP ${response.status}).`);
      }
      if (!payload) {
        throw new Error('The model returned an empty response.');
      }

      onApply(payload);
      setApplied(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  const tooShort = text.trim().length < 20;

  return (
    <div
      className="mb-6 rounded-xl border border-border bg-secondary/35 p-4 sm:p-5"
      data-testid="card-extract-profile"
    >
      <div className="flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">
        <Sparkles size={12} className="text-primary" />
        Start from your own words
      </div>

      <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
        Describe your work in one or two sentences — including the parts that never appear in a job
        title. The model maps it onto the skills below, and you can edit anything afterwards.
      </p>

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setApplied(null);
          setError(null);
        }}
        rows={3}
        placeholder={PLACEHOLDER}
        className="focus-ring mt-3 w-full resize-y rounded-lg border border-border bg-card p-3 text-[11px] leading-relaxed outline-none"
        aria-label="Describe your work in your own words"
        data-testid="input-extract-text"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[9px] text-muted-foreground">
          Sent to our API and to DeepSeek for this request only. Not stored.
        </span>
        <button
          type="button"
          onClick={() => { void extract(); }}
          disabled={isLoading || tooShort}
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
          data-testid="button-extract-profile"
        >
          <Sparkles size={12} />
          {isLoading ? 'Reading…' : 'Extract my skills'}
        </button>
      </div>

      {error ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-2.5" data-testid="error-extract">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed">
            {error} You can keep filling the form by hand.
          </p>
        </div>
      ) : null}

      {applied ? (
        <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 p-3" data-testid="result-extract">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
            <CheckCircle2 size={13} />
            Applied to your answers above · {applied.model}
          </div>
          {applied.summary ? (
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{applied.summary}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1">
            {[...applied.skills, ...applied.competencies].slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="rounded bg-secondary px-1.5 py-0.5 text-[8px] text-secondary-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
          {applied.skills.length === 0 && applied.competencies.length === 0 ? (
            <p className="mt-1 text-[9px] text-muted-foreground">
              No listed skill matched. Try naming the tools, tasks or people you work with.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

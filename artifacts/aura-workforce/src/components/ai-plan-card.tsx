/**
 * AI PLAN CARD
 * ============
 * The visible half of the milestone: one button sends the whole profile to
 * POST /api/plan and renders the model's conclusion.
 *
 * What the model decides: the recommended role, why, the gaps, the order of
 * the pathway, and the caveat.
 * What it cannot decide: which roles and modules exist. Those ids are checked
 * server-side against the catalogue before they reach this component.
 */

import { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { WorkforceRole } from '@workspace/api-client-react';
import { type DisruptionMode, type ProfileData, scoreRole } from '@/lib/scoring';

type PlanRankingEntry = {
  roleId: string;
  roleTitle: string;
  fit: number;
  appEstimate: number;
  reason: string;
  gaps: string[];
  sdgTargets: string[];
};

type PlanPathwayStep = {
  moduleId: string;
  title: string;
  order: number;
  hours: number;
  why: string;
};

type BuiltPlan = {
  recommendedRoleId: string;
  recommendedRoleTitle: string;
  headline: string;
  ranking: PlanRankingEntry[];
  pathway: PlanPathwayStep[];
  nextAction: string;
  caveat: string;
  model: string;
  generatedAt: string;
};

type AiPlanCardProps = {
  roles: WorkforceRole[];
  profile: ProfileData;
  mode: DisruptionMode;
};

export function AiPlanCard({ roles, profile, mode }: AiPlanCardProps) {
  const [plan, setPlan] = useState<BuiltPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSomethingToScore =
    profile.currentRole.trim() !== '' || profile.skills.length > 0 || profile.competencies.length > 0;

  async function buildPlan() {
    setIsLoading(true);
    setError(null);

    // The app's own scores travel with the prompt as a prior. The server clamps
    // the model's fit to within 10 points of these, so the AI cannot contradict
    // the number the user already sees without saying so in its reason.
    const candidates = roles.map((role) => ({
      roleId: role.id,
      score: scoreRole(role, profile, mode),
    }));

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile, mode, candidates }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (BuiltPlan & { message?: string })
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `The planner returned HTTP ${response.status}.`);
      }
      if (!payload) {
        throw new Error('The planner returned an empty response.');
      }

      setPlan(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-7 rounded-2xl border border-border bg-card p-5 sm:p-7" data-testid="card-ai-plan">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">
            <Sparkles size={12} className="text-primary" />
            AI planner
          </div>
          <h2 className="font-display mt-2 text-[23px] font-bold tracking-[-.04em]">
            Turn this profile into a plan.
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Sends your answers above to the planner, which recommends the best-fit role and orders the
            learning steps from our curated catalogue. It cannot invent roles, courses or statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { void buildPlan(); }}
          disabled={isLoading || !hasSomethingToScore}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="button-build-plan"
        >
          <Sparkles size={14} />
          {isLoading ? 'Thinking…' : plan ? 'Rebuild plan' : 'Build my plan'}
        </button>
      </div>

      {!hasSomethingToScore ? (
        <p className="mt-4 rounded-lg bg-secondary/40 p-3 text-[11px] text-muted-foreground">
          Add a current role, a skill or a competency above, then build the plan.
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-5 space-y-2" role="status">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <span className="sr-only">Building your plan</span>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3" data-testid="error-ai-plan">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            {error} Your deterministic results above are unchanged.
          </p>
        </div>
      ) : null}

      {plan && !isLoading ? (
        <div className="mt-6 border-t border-border pt-5" data-testid="result-ai-plan">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
              Recommended · {plan.recommendedRoleTitle}
            </span>
            <span className="font-mono-ui text-[10px] uppercase tracking-[.12em] text-muted-foreground">
              {plan.model} · {new Date(plan.generatedAt).toLocaleString('en-GB')}
            </span>
          </div>

          <p className="font-display mt-3 max-w-3xl text-[18px] font-semibold leading-snug tracking-[-.02em]">
            {plan.headline}
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {plan.ranking.map((entry) => (
              <div key={entry.roleId} className="rounded-xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-semibold">{entry.roleTitle}</span>
                  <span className="font-mono-ui text-[14px] font-semibold">{entry.fit}</span>
                </div>
                <div className="mt-0.5 text-right font-mono-ui text-[9px] text-muted-foreground">
                  AI · app estimate {entry.appEstimate}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{entry.reason}</p>
                {entry.gaps.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {entry.gaps.map((gap) => (
                      <span key={gap} className="rounded border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">
                        {gap}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[10px] text-primary">No listed gaps.</p>
                )}
                <p className="mt-2 font-mono-ui text-[9px] text-muted-foreground">
                  SDG {entry.sdgTargets.join(' · ')}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground">
              Learning pathway
            </div>
            <ol className="mt-3 space-y-2">
              {plan.pathway.map((step) => (
                <li key={step.moduleId} className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono-ui text-[10px]">
                    {String(step.order).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold">
                      {step.title}{' '}
                      <span className="font-normal text-muted-foreground">· {step.hours} h</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {plan.nextAction ? (
            <div className="mt-5 flex items-start gap-2 rounded-lg bg-primary/5 p-3">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-semibold">Next step: </span>
                {plan.nextAction}
              </p>
            </div>
          ) : null}

          <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
            <ArrowRight size={11} className="mt-0.5 shrink-0" />
            {plan.caveat || 'Directional guidance only. Always confirm course details with the provider.'}
          </p>
        </div>
      ) : null}
    </section>
  );
}

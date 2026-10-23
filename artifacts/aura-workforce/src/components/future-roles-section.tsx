/**
 * CHECKPOINT 3 — FUTURE ROLES
 * ===========================
 * Everything on this screen comes from the model, using the profile the person
 * submitted in checkpoint 2:
 *
 *   - the plan's ranking of the curated roles, with a reason each
 *   - up to three occupations from outside the catalogue, with a checkable reference
 *
 * Nothing here is a fixed list: if the profile changes, this changes.
 */

import { ArrowUpRight, Sparkles } from 'lucide-react';

type RankingEntry = {
  roleId: string;
  roleTitle: string;
  fit: number;
  appEstimate: number;
  reason: string;
  gaps: string[];
};

type Plan = {
  recommendedRoleId: string;
  recommendedRoleTitle: string;
  headline: string;
  ranking: RankingEntry[];
  model: string;
  generatedAt: string;
};

type ExploredRole = {
  title: string;
  sector: string;
  reason: string;
  skillsToBuild: string[];
  firstStep: string;
  occupationSource: string;
  confidence: 'high' | 'medium' | 'low';
};

type ExploreResult = {
  roles: ExploredRole[];
  note: string;
  model: string;
  generatedAt: string;
};

type FutureRolesSectionProps = {
  plan: Plan | null;
  explored: ExploreResult | null;
  planLoading: boolean;
  exploredLoading: boolean;
};

export function FutureRolesSection({ plan, explored, planLoading, exploredLoading }: FutureRolesSectionProps) {
  const loading = planLoading || exploredLoading;
  const hasContent = (plan && plan.ranking.length > 0) || (explored && explored.roles.length > 0);

  return (
    <section id="roles" className="scroll-mt-24 py-10">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.19em] text-muted-foreground">
          <span className="h-px w-5 bg-accent" />Checkpoint 03 · Future roles
        </div>
        <h2 className="font-display max-w-3xl text-[32px] font-bold leading-[1.1] tracking-[-.055em] sm:text-[40px]">
          What the AI concluded from your profile.
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          One model call ranks the roles we can teach end-to-end; a second looks beyond our catalogue.
          Neither may invent a course, a provider or a statistic.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-6" role="status">
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-muted" />
          <span className="sr-only">Reading your profile</span>
        </div>
      ) : null}

      {!loading && !hasContent ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="future-roles-empty">
          <Sparkles size={20} className="mx-auto text-primary" />
          <p className="font-display mt-3 text-[17px] font-bold">Nothing to rank yet</p>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Fill in checkpoint 2 and press <span className="font-semibold">Apply to role explorer</span> — the
            recommendation is generated from your answers, not from a fixed list.
          </p>
          <a href="#profile" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-primary-foreground">
            Go to your profile <ArrowUpRight size={12} />
          </a>
        </div>
      ) : null}

      {plan && plan.ranking.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 p-5" data-testid="ai-recommendation">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">
              AI recommendation · {plan.model}
            </span>
            <span className="font-mono-ui text-[9px] text-muted-foreground">
              {new Date(plan.generatedAt).toLocaleString('en-GB')}
            </span>
          </div>
          <p className="font-display mt-2 text-[18px] font-semibold leading-snug">{plan.headline}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Recommended first: <span className="font-semibold text-foreground">{plan.recommendedRoleTitle}</span>
          </p>
        </div>
      ) : null}

      {plan && plan.ranking.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2" data-testid="ai-ranking">
          {plan.ranking.map((entry, index) => (
            <article key={entry.roleId} className="rounded-2xl border border-border bg-card p-5" data-testid={`ai-rank-${entry.roleId}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-muted-foreground">
                    Option {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-display mt-1 text-[19px] font-bold leading-tight tracking-[-.04em]">{entry.roleTitle}</h3>
                </div>
                <div className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-[hsl(var(--chart-1)/.18)] bg-[hsl(var(--chart-1)/.07)]">
                  <span className="font-mono-ui text-[16px] font-medium leading-none">{entry.fit}</span>
                  <span className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">fit</span>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{entry.reason}</p>

              {entry.gaps.length > 0 ? (
                <div className="mt-3">
                  <div className="font-mono-ui text-[8px] uppercase tracking-[.14em] text-muted-foreground">Skills to build</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {entry.gaps.map((gap) => (
                      <span key={gap} className="rounded-md border border-border px-2 py-1 text-[9px] text-muted-foreground">{gap}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="mt-3 font-mono-ui text-[8px] text-muted-foreground">
                AI fit {entry.fit} · app estimate {entry.appEstimate}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {explored && explored.roles.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-[20px] font-bold tracking-[-.04em]">Beyond our catalogue</h3>
              <p className="mt-1 max-w-2xl text-[11px] text-muted-foreground">
                Real occupations the model proposed for you, each with a reference you can check — but no
                verified pathway, so they are directions to research.
              </p>
            </div>
            <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-[9px] font-semibold">
              Exploratory · no pathway
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {explored.roles.map((role) => (
              <article key={role.title} className="rounded-2xl border border-dashed border-border bg-card p-4" data-testid={`explored-${role.title}`}>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[12px] font-semibold leading-snug">{role.title}</h4>
                  <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">{role.confidence}</span>
                </div>
                <p className="mt-1 font-mono-ui text-[8px] uppercase tracking-[.1em] text-muted-foreground">{role.sector}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{role.reason}</p>
                {role.skillsToBuild.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {role.skillsToBuild.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">{skill}</span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 text-[9px] leading-relaxed"><span className="font-semibold">This week: </span>{role.firstStep}</p>
                <p className="mt-2 border-t border-border pt-2 text-[8px] leading-relaxed text-muted-foreground">Check it: {role.occupationSource}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

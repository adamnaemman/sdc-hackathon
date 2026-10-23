/**
 * CHECKPOINT 3 — ROLES THE AI CHOSE
 * =================================
 * The list on this screen is produced by the model from the profile submitted in
 * checkpoint 2. There is no fixed set of roles displayed here: what you see is
 * what the model proposed, each with its reasoning, the skills to build, a
 * concrete first step, and an occupational reference the reader can check.
 *
 * These occupations are outside the curated pathway catalogue, so the section
 * says so plainly: no course links, no hours, no invented statistics.
 */

import { ArrowUpRight, Sparkles } from 'lucide-react';

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
  explored: ExploreResult | null;
  exploredLoading: boolean;
  onBuildPathway?: (role: ExploredRole) => void;
  pathwayLoading?: boolean;
  pathwayRoleTitle?: string | null;
};

export function FutureRolesSection({ explored, exploredLoading, onBuildPathway, pathwayLoading, pathwayRoleTitle }: FutureRolesSectionProps) {
  const roles = explored?.roles ?? [];

  return (
    <section id="roles" className="scroll-mt-24 border-t border-border py-10">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.19em] text-muted-foreground">
          <span className="h-px w-5 bg-accent" />Checkpoint 03 · Future roles
        </div>
        <h2 className="font-display max-w-3xl text-[32px] font-bold leading-[1.1] tracking-[-.055em] sm:text-[40px]">
          The roles the AI chose for you.
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Generated from your profile, not picked from a list. Each occupation comes with the model&apos;s
          reasoning, the skills it thinks you would need, and a reference you can check yourself.
        </p>
      </div>

      {exploredLoading ? (
        <div className="rounded-2xl border border-border bg-card p-6" role="status">
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-muted" />
          <span className="sr-only">Reading your profile</span>
        </div>
      ) : null}

      {!exploredLoading && roles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="future-roles-empty">
          <Sparkles size={20} className="mx-auto text-primary" />
          <p className="font-display mt-3 text-[17px] font-bold">Nothing proposed yet</p>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Fill in checkpoint 2 and press <span className="font-semibold">Apply to role explorer</span> — the
            roles are generated from your answers, so there is nothing to show before that.
          </p>
          <a href="#profile" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-primary-foreground">
            Go to your profile <ArrowUpRight size={12} />
          </a>
        </div>
      ) : null}

      {roles.length > 0 ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">
              {roles.length} occupations · proposed by <span className="font-semibold text-foreground">{explored?.model}</span>{' '}
              · {explored ? new Date(explored.generatedAt).toLocaleString('en-GB') : ''}
            </p>
            <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-[9px] font-semibold">
              AI-selected · no verified pathway
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-3" data-testid="ai-role-cards">
            {roles.map((role) => (
              <article
                key={role.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-5"
                data-testid={`ai-role-${role.title}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-muted-foreground">
                      {role.sector || 'Occupation'}
                    </div>
                    <h3 className="font-display mt-1 text-[18px] font-bold leading-tight tracking-[-.035em]">
                      {role.title}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">
                    {role.confidence}
                  </span>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{role.reason}</p>

                {role.skillsToBuild.length > 0 ? (
                  <div className="mt-3">
                    <div className="font-mono-ui text-[8px] uppercase tracking-[.14em] text-muted-foreground">
                      Skills to build
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {role.skillsToBuild.slice(0, 5).map((skill) => (
                        <span key={skill} className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {role.firstStep ? (
                  <p className="mt-3 rounded-lg bg-primary/5 px-2.5 py-2 text-[10px] leading-relaxed">
                    <span className="font-semibold">This week: </span>{role.firstStep}
                  </p>
                ) : null}

                <p className="mt-auto border-t border-border pt-2 text-[8px] leading-relaxed text-muted-foreground">
                  Check it yourself: {role.occupationSource}
                </p>
                {onBuildPathway ? (
                  <button
                    type="button"
                    onClick={() => onBuildPathway(role)}
                    disabled={pathwayLoading}
                    className="focus-ring mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[9px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    data-testid={`button-pathway-${role.title}`}
                  >
                    <Sparkles size={11} />
                    {pathwayLoading && pathwayRoleTitle === role.title ? 'Building pathway…' : 'Build verified pathway'}
                  </button>
                ) : null}
              </article>
            ))}
          </div>

          {explored?.note ? (
            <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">{explored.note}</p>
          ) : null}

          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            No salary, growth figure or course link is shown for these occupations, because we could not
            source one. The study plan in checkpoint 04 is built only from courses we have verified.
          </p>
        </>
      ) : null}
    </section>
  );
}

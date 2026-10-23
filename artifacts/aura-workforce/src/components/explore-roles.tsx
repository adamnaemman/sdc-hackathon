/**
 * EXPLORE ROLES
 * =============
 * The visible half of POST /api/explore: occupations the AI proposes that are
 * NOT in the five-role curated catalogue.
 *
 * This block is deliberately styled differently from the sourced plan, because
 * it makes a weaker promise: no verified pathway, no checked course links, and
 * no statistics. What it does offer is a checkable occupational reference, so
 * the user can verify the role exists before acting on it.
 */

import { useState } from 'react';
import { AlertTriangle, Compass, ExternalLink } from 'lucide-react';
import type { ProfileData } from '@/lib/scoring';

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

type ExploreRolesProps = {
  profile: ProfileData;
};

export function ExploreRoles({ profile }: ExploreRolesProps) {
  const [result, setResult] = useState<ExploreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canExplore =
    profile.currentRole.trim() !== '' || profile.skills.length > 0 || profile.competencies.length > 0;

  async function explore() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          profile: {
            currentRole: profile.currentRole,
            industry: profile.industry,
            yearsExperience: profile.yearsExperience,
            skills: profile.skills,
            competencies: profile.competencies,
            targetSectors: profile.targetSectors,
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (ExploreResult & { message?: string })
        | null;

      if (!response.ok) throw new Error(payload?.message ?? `Exploration failed (HTTP ${response.status}).`);
      if (!payload) throw new Error('The model returned an empty response.');

      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-dashed border-border bg-card p-5 sm:p-7" data-testid="card-explore">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">
            <Compass size={12} className="text-primary" />
            Beyond the catalogue
          </div>
          <h2 className="font-display mt-2 text-[20px] font-bold tracking-[-.04em]">
            Not seeing your occupation?
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Our verified catalogue covers five roles. Ask the model to look wider — it will propose real
            occupations with a reference you can check, but no verified pathway and no statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { void explore(); }}
          disabled={isLoading || !canExplore}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary/40 px-4 py-2.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-45"
          data-testid="button-explore"
        >
          <Compass size={13} />
          {isLoading ? 'Looking…' : result ? 'Look again' : 'Explore more roles'}
        </button>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3" data-testid="error-explore">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed">{error}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5 space-y-2" role="status">
          <div className="h-3 w-52 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <span className="sr-only">Exploring roles</span>
        </div>
      ) : null}

      {result && !isLoading ? (
        <div className="mt-5 border-t border-border pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-[9px] font-semibold">
              Exploratory · unverified demand
            </span>
            <span className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-muted-foreground">
              {result.model} · {new Date(result.generatedAt).toLocaleString('en-GB')}
            </span>
          </div>

          {result.roles.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              The model did not propose an occupation it could reference. That is the correct answer here:
              it would rather say nothing than invent a job title.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {result.roles.map((role) => (
                <div key={role.title} className="rounded-xl border border-border/70 bg-secondary/25 p-4" data-testid={`explored-${role.title}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[11px] font-semibold leading-snug">{role.title}</h3>
                    <span className="shrink-0 rounded bg-card px-1.5 py-0.5 text-[8px] text-muted-foreground">
                      {role.confidence}
                    </span>
                  </div>
                  {role.sector ? (
                    <p className="mt-0.5 font-mono-ui text-[8px] uppercase tracking-[.1em] text-muted-foreground">
                      {role.sector}
                    </p>
                  ) : null}

                  <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{role.reason}</p>

                  {role.skillsToBuild.length > 0 ? (
                    <div className="mt-3">
                      <div className="font-mono-ui text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                        Skills to build
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {role.skillsToBuild.map((skill) => (
                          <span key={skill} className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {role.firstStep ? (
                    <p className="mt-3 text-[9px] leading-relaxed">
                      <span className="font-semibold">This week: </span>
                      {role.firstStep}
                    </p>
                  ) : null}

                  <p className="mt-3 flex items-start gap-1 border-t border-border/70 pt-2 text-[8px] leading-relaxed text-muted-foreground">
                    <ExternalLink size={9} className="mt-0.5 shrink-0" />
                    Check it yourself: {role.occupationSource}
                  </p>
                </div>
              ))}
            </div>
          )}

          {result.note ? (
            <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">{result.note}</p>
          ) : null}

          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            These are directions to research, not a plan. No salary, growth figure or course link is shown
            here because we could not source one for these occupations.
          </p>
        </div>
      ) : null}
    </section>
  );
}

/**
 * LIVE TREND STRIP
 * ================
 * Shows where the demand numbers come from, when they were fetched, and how
 * many job postings they are based on — then the per-role demand.
 *
 * This component exists because of one sentence in the domain brief:
 * "Show the source and its date. Hard-coded lists alone do not count."
 * So the source, the date and the sample size are always visible, and the
 * failure state says so honestly instead of hiding behind fake numbers.
 */

import { ExternalLink, RefreshCw } from 'lucide-react';
import type { WorkforceRole } from '@workspace/api-client-react';
import type { TrendSnapshot } from '@/lib/live-trends';
import { formatFetchedAt } from '@/lib/live-trends';

type LiveTrendStripProps = {
  snapshot: TrendSnapshot | undefined;
  roles: WorkforceRole[];
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function LiveTrendStrip({
  snapshot,
  roles,
  isLoading,
  isError,
  isRefreshing,
  onRefresh,
}: LiveTrendStripProps) {
  const roleTrends = snapshot?.roles ?? [];

  return (
    <section
      className="mb-7 rounded-2xl border border-border bg-card p-4 sm:p-5"
      data-testid="card-live-trends"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isError ? 'bg-accent' : snapshot?.stale ? 'bg-accent' : 'bg-[hsl(var(--chart-1))]'
              }`}
            />
            <span className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">
              Live trend layer
            </span>
            {snapshot?.cached && !snapshot.stale ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-secondary-foreground">
                cached
              </span>
            ) : null}
            {snapshot?.stale ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[8px] text-foreground">
                last good snapshot
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <p className="mt-2 text-[11px] text-muted-foreground">Checking the public job feed…</p>
          ) : isError ? (
            <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
              The live source could not be reached just now. The curated snapshot below still works;
              nothing here is being replaced with invented numbers.
            </p>
          ) : snapshot ? (
            <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{snapshot.source}</span>
              {' · '}
              {snapshot.sampleSize} postings from the last {snapshot.windowDays} days
              {' · '}
              fetched {formatFetchedAt(snapshot.fetchedAt)}
              {' · '}
              <a
                href={snapshot.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2"
                data-testid="link-trend-source"
              >
                source <ExternalLink size={10} />
              </a>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-[10px] font-semibold transition-colors hover:border-primary/40 disabled:opacity-50"
          data-testid="button-refresh-trends"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {snapshot && roleTrends.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {roleTrends.map((trend) => {
            const role = roles.find((candidate) => candidate.id === trend.roleId);
            const percent = Math.round(trend.share * 100);

            return (
              <div
                key={trend.roleId}
                className="rounded-xl border border-border/70 bg-secondary/35 p-3"
                data-testid={`trend-${trend.roleId}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[10px] font-semibold" title={role?.title ?? trend.roleId}>
                    {role?.title ?? trend.roleId}
                  </span>
                  <span className="font-mono-ui text-[13px] font-semibold" data-testid={`trend-share-${trend.roleId}`}>
                    {percent}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--chart-1))]"
                    style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
                  />
                </div>

                <div className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                  {trend.matchedPostings} postings ·{' '}
                  {trend.topSkills
                    .slice(0, 2)
                    .map((skill) => `${skill.skill} (${skill.mentions})`)
                    .join(', ') || 'no skill matches yet'}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
        Demand = share of recent public job postings mentioning at least one of a role's required
        skills. It signals direction, not local vacancy counts, and it is not a forecast for any
        individual.
      </p>
    </section>
  );
}

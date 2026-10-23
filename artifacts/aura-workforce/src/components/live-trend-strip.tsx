/**
 * LIVE MARKET TREND
 * =================
 * Checkpoint 01. Shows what the live job data actually says, independent of the
 * roles we happen to have curated: the most-mentioned skills across the recent
 * postings, the source, the fetch time and the sample size.
 *
 * No catalogue is involved in this chart. If the feed changes, the bars change.
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
  isLoading,
  isError,
  isRefreshing,
  onRefresh,
}: LiveTrendStripProps) {
  const skills = snapshot?.topSkills ?? [];

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
                isError || snapshot?.stale ? 'bg-accent' : 'bg-[hsl(var(--chart-1))]'
              }`}
            />
            <span className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">
              Live skill demand
            </span>
            {snapshot?.cached && !snapshot.stale ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-secondary-foreground">cached</span>
            ) : null}
            {snapshot?.stale ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[8px] text-foreground">last good snapshot</span>
            ) : null}
          </div>

          {isLoading ? (
            <p className="mt-2 text-[11px] text-muted-foreground">Reading the public job feed…</p>
          ) : isError ? (
            <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
              The live source could not be reached just now. The curated signals below still work; nothing
              here is replaced with invented numbers.
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

      {skills.length > 0 ? (
        <>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-muted-foreground">
              Most requested skills right now
            </span>
            <span className="font-mono-ui text-[9px] text-muted-foreground">top {skills.length}</span>
          </div>

          <div className="mt-3 space-y-2" data-testid="chart-top-skills">
            {skills.map((skill) => {
              const percent = Math.round(skill.share * 100);
              return (
                <div key={skill.name} className="grid grid-cols-[minmax(96px,168px)_1fr_44px] items-center gap-3">
                  <span className="truncate text-[10px] font-medium" title={skill.name}>
                    {skill.name}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full bg-[hsl(var(--chart-1))]"
                      style={{ width: `${Math.max(3, percent)}%` }}
                    />
                  </span>
                  <span className="text-right font-mono-ui text-[9px] text-muted-foreground">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <p className="mt-4 text-[9px] leading-relaxed text-muted-foreground">
        Share of recent public job postings that list each skill. This is the whole feed, not a shortlist of
        our roles — it signals direction, not Malaysian vacancy counts, and it is not a forecast for any
        individual.
      </p>
    </section>
  );
}

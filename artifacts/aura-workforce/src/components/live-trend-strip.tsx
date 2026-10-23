/**
 * LIVE MARKET TREND — line chart
 * ==============================
 * Checkpoint 01. A weekly trend of the most-requested skills across the recent
 * public postings. No catalogue is involved: the lines are the whole feed.
 *
 * Four weekly buckets, mentions per week, oldest on the left. The chart is plain
 * SVG so it stays light and matches the palette.
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

const WIDTH = 620;
const HEIGHT = 190;
const LEFT = 10;
const RIGHT = 610;
const TOP = 12;
const BOTTOM = 156;

function weekLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
}

export function LiveTrendStrip({ snapshot, isLoading, isError, isRefreshing, onRefresh }: LiveTrendStripProps) {
  const skills = (snapshot?.topSkills ?? []).filter((skill) => skill.series.some((value) => value > 0));
  const weeks = snapshot?.weeks ?? [];

  const maxValue = Math.max(1, ...skills.flatMap((skill) => skill.series));
  const xFor = (index: number) => LEFT + (index * (RIGHT - LEFT)) / Math.max(1, weeks.length - 1);
  const yFor = (value: number) => BOTTOM - (value / maxValue) * (BOTTOM - TOP);

  return (
    <section className="mb-7 rounded-2xl border border-border bg-card p-4 sm:p-5" data-testid="card-live-trends" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isError || snapshot?.stale ? 'bg-accent' : 'bg-[hsl(var(--chart-1))]'}`} />
            <span className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">Live skill demand</span>
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
              The live source could not be reached just now. The curated signals below still work; nothing here is
              replaced with invented numbers.
            </p>
          ) : snapshot ? (
            <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{snapshot.source}</span>
              {' · '}
              {snapshot.sampleSize} postings from the last {snapshot.windowDays} days
              {' · '}
              fetched {formatFetchedAt(snapshot.fetchedAt)}
              {' · '}
              <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2" data-testid="link-trend-source">
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

      {skills.length > 0 && weeks.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-muted-foreground">
              Mentions per week · most requested skills
            </span>
            <span className="font-mono-ui text-[9px] text-muted-foreground">last {weeks.length} weeks</span>
          </div>

          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="mt-2 w-full"
            role="img"
            aria-label="Weekly mentions of the most requested skills"
            data-testid="chart-trend"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
              const value = Math.round(maxValue * (1 - fraction));
              return (
                <g key={fraction}>
                  <line
                    x1={LEFT}
                    x2={RIGHT}
                    y1={TOP + fraction * (BOTTOM - TOP)}
                    y2={TOP + fraction * (BOTTOM - TOP)}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                  <text x={LEFT} y={TOP + fraction * (BOTTOM - TOP) - 3} fontSize="8" fill="hsl(var(--muted-foreground))">
                    {value}
                  </text>
                </g>
              );
            })}

            {skills.map((skill, index) => {
              const colour = `hsl(var(--chart-${(index % 5) + 1}))`;
              const points = skill.series.map((value, pointIndex) => `${xFor(pointIndex)},${yFor(value)}`).join(' ');

              return (
                <g key={skill.name}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={colour}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {skill.series.map((value, pointIndex) => (
                    <circle
                      key={`${skill.name}-${pointIndex}`}
                      cx={xFor(pointIndex)}
                      cy={yFor(value)}
                      r="2.6"
                      fill={colour}
                    />
                  ))}
                </g>
              );
            })}

            {weeks.map((iso, index) => (
              <text key={iso} x={xFor(index)} y={HEIGHT - 8} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                {weekLabel(iso)}
              </text>
            ))}
          </svg>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {skills.map((skill, index) => (
              <span key={skill.name} className="inline-flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                {skill.name}
                <span className="font-mono-ui text-[8px]">({skill.count})</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
        Mentions of each skill in recent public job postings, bucketed by week. This is the whole feed, not a
        shortlist of our roles — it signals direction, not Malaysian vacancy counts, and it is not a forecast for
        any individual.
      </p>
    </section>
  );
}

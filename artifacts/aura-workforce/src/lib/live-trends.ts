/**
 * CLIENT FOR THE LIVE TREND LAYER
 * ===============================
 * Thin wrapper around `GET /api/trends`.
 *
 * We call it with plain `fetch` rather than a generated hook, because the
 * OpenAPI codegen step would need Orval to run again. The response shape is
 * declared here, next to the only code that uses it, so it is easy to check.
 */

export type SkillTrend = {
  skill: string;
  mentions: number;
};

export type RoleTrend = {
  roleId: string;
  matchedPostings: number;
  share: number; // 0..1
  topSkills: SkillTrend[];
};

export type SkillDemand = {
  name: string;
  count: number;
  share: number; // 0..1
};

export type TrendSnapshot = {
  source: string;
  sourceUrl: string;
  fetchedAt: string; // ISO
  windowDays: number;
  sampleSize: number;
  roles: RoleTrend[];
  topSkills: SkillDemand[];
  cached: boolean;
  stale: boolean;
};

export async function fetchTrends(options: { refresh?: boolean } = {}): Promise<TrendSnapshot> {
  const url = options.refresh ? "/api/trends?refresh=1" : "/api/trends";
  const response = await fetch(url, { headers: { accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`Trend layer unavailable (HTTP ${response.status})`);
  }

  return (await response.json()) as TrendSnapshot;
}

/** "22 Oct 2026, 18:35" — shown next to the source so the date is never hidden. */
export function formatFetchedAt(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.valueOf())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

/**
 * WIDER ROLE LIBRARY PANEL
 * ========================
 * "Show me what else I could do." Searches 916 real O*NET occupations against
 * the person's current skills and lists the closest matches.
 *
 * Deliberately different from the curated role cards: no pathway, no course
 * links, no statistics — just a real occupation, its description, and how many
 * of your skills its description mentions.
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Library } from 'lucide-react';

type LibraryRole = {
  code: string;
  title: string;
  description: string;
  tools: string[];
  matchedSkills: string[];
  matchedCount: number;
  strength: number;
};

type LibraryResult = {
  total: number;
  matched: number;
  source: { name: string; url: string; licence: string; retrieved: string };
  roles: LibraryRole[];
};

type LibraryExplorerProps = {
  skills: string[];
};

export function LibraryExplorer({ skills }: LibraryExplorerProps) {
  const [result, setResult] = useState<LibraryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skillKey = skills.join(',');

  async function search() {
    setIsLoading(true);
    setError(null);
    try {
      const query = encodeURIComponent(skillKey);
      const response = await fetch(`/api/library?skills=${query}`);
      if (!response.ok) throw new Error(`The library returned HTTP ${response.status}.`);
      setResult((await response.json()) as LibraryResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  // Load automatically: this is the main list now, not a side panel, so the
  // user should not have to press a button to see their options.
  useEffect(() => {
    if (skillKey.trim() === '') return;
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillKey]);

  return (
    <section className="mt-7 rounded-2xl border border-border bg-card p-5 sm:p-6" data-testid="card-library">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">
            <Library size={12} className="text-primary" />
            Matched from 916 occupations
          </div>
          <h2 className="font-display mt-2 text-[20px] font-bold tracking-[-.04em]">
            Where your skills actually appear.
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Real occupations from the O*NET database whose descriptions mention the skills you selected —
            including ones outside our five curated roles. They have no pathway yet, so treat them as
            directions to research.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { void search(); }}
          disabled={isLoading || skills.length === 0}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary/40 px-4 py-2.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-45"
          data-testid="button-search-library"
        >
          <Library size={13} />
          {isLoading ? 'Searching…' : result ? 'Refresh matches' : 'Find matches'}
        </button>
      </div>

      {skills.length === 0 ? (
        <p className="mt-3 rounded-lg bg-secondary/40 p-3 text-[10px] text-muted-foreground">
          Select a few skills in your profile first — the search matches words, so two or three specific
          skills work better than none.
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3" data-testid="error-library">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed">{error}</p>
        </div>
      ) : null}

      {result && !isLoading ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-[10px] text-muted-foreground">
            {result.matched} of {result.total} occupations mention at least one of your skills · source:{' '}
            <a
              href={result.source.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-2"
            >
              {result.source.name}
            </a>{' '}
            ({result.source.licence}, retrieved {result.source.retrieved})
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {result.roles.map((role) => (
              <div
                key={role.code}
                className="rounded-xl border border-border/70 bg-secondary/25 p-4"
                data-testid={`library-role-${role.code}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[11px] font-semibold leading-snug">{role.title}</h3>
                  <span className="shrink-0 font-mono-ui text-[9px] text-muted-foreground">
                    {role.matchedCount} skill{role.matchedCount === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                  {role.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {role.matchedSkills.map((skill) => (
                    <span key={skill} className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] text-primary">
                      {skill}
                    </span>
                  ))}
                  {role.tools.slice(0, 2).map((tool) => (
                    <span key={tool} className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {result.roles.length === 0 ? (
            <p className="mt-3 text-[11px] text-muted-foreground">
              No occupation mentioned those words. Add more specific skills to your profile.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

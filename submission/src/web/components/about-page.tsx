/**
 * ABOUT — standalone page
 * =======================
 * A separate route (/about), reached from the sidebar. It answers what a judge
 * asks after the demo: who built this, why, what it refuses to do, and where the
 * data comes from.
 *
 * All copy comes from the dictionary, so the EN/BM toggle changes this page too.
 */

import { ArrowLeft, ExternalLink, Mail } from 'lucide-react';
import { useSettings } from '@/lib/settings';

const SOURCES = [
  { name: 'O*NET 30.1 database', note: 'CC BY 4.0', url: 'https://www.onetcenter.org/database.html' },
  { name: 'Arbeitnow job board API', note: 'live postings · no key', url: 'https://www.arbeitnow.com/api/job-board-api' },
  { name: 'U.S. BLS Occupational Outlook Handbook', note: 'public domain', url: 'https://www.bls.gov/ooh/' },
  { name: 'WEF · Future of Jobs 2025', note: 'attributed', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/' },
];

export function AboutPage() {
  const { t } = useSettings();
  const about = t.about;

  return (
    <div className="mx-auto max-w-3xl py-10" data-testid="page-about">
      <a
        href="/"
        className="inline-flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={12} /> {about.back}
      </a>

      <div className="mt-6 mb-3 flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[.19em] text-muted-foreground">
        <span className="h-px w-5 bg-accent" />
        {about.eyebrow}
      </div>

      <h1 className="font-display text-[37px] font-bold leading-[1.05] tracking-[-.055em] sm:text-[47px]">
        {about.title}
      </h1>

      <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">{about.intro}</p>

      <section className="mt-10">
        <h2 className="font-display text-[21px] font-bold tracking-[-.03em]">{about.teamTitle}</h2>
        <div className="mt-3 rounded-2xl border border-border bg-card p-5">
          <p className="text-[14px] font-semibold">overinfinity</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{about.teamWho}</p>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{about.teamWhat}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="mailto:0damkim254@gmail.com" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary underline underline-offset-2">
              <Mail size={11} /> {about.linkEmail}
            </a>
            <a href="https://github.com/adamnaemman/sdc-hackathon" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary underline underline-offset-2">
              {about.linkRepo} <ExternalLink size={10} />
            </a>
            <a href="https://aura-workforce.replit.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary underline underline-offset-2">
              {about.linkLive} <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[21px] font-bold tracking-[-.03em]">{about.refusesTitle}</h2>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          {about.refuses.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{about.refusesNote}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[21px] font-bold tracking-[-.03em]">{about.sourcesTitle}</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          {SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/40"
            >
              <span className="text-[12px] font-semibold">{source.name}</span>
              <span className="font-mono-ui text-[10px] text-muted-foreground">{source.note} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[21px] font-bold tracking-[-.03em]">{about.builtTitle}</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{about.built}</p>
      </section>

      <p className="mt-12 border-t border-border pt-5 text-[11px] leading-relaxed text-muted-foreground">
        {about.disclaimer}
      </p>
    </div>
  );
}

/**
 * ABOUT — standalone page
 * =======================
 * Not one of the four checkpoints: a separate route (/about) reached from the
 * sidebar or the footer. It answers the questions a judge has after the demo:
 * who built this, why, what it refuses to do, and where the data comes from.
 */

import { ArrowLeft, ExternalLink, Mail } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl py-10" data-testid="page-about">
      <a
        href="/"
        className="inline-flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={12} /> Back to the planner
      </a>

      <div className="mt-6 mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.19em] text-muted-foreground">
        <span className="h-px w-5 bg-accent" />About
      </div>

      <h1 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-.055em] sm:text-[46px]">
        Built by one student, for people whose jobs are changing.
      </h1>

      <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
        AURA-Workforce is a career-transition planner, not a job board and not a chatbot. It exists because
        the advice most workers receive is generic, static and unsourced — while the training they are told
        to buy is expensive and often already out of date.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-[20px] font-bold tracking-[-.03em]">The team</h2>
        <div className="mt-3 rounded-2xl border border-border bg-card p-5">
          <p className="text-[13px] font-semibold">overinfinity</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Ahmad Adam Hakimi bin Naeman · International Islamic University Malaysia (IIUM)
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Built for SDC Hackathon 2026, Domain 1 — The Aiversecity Future-Ready Workforce Domain.
            Solo build: product, interface, API and documentation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:0damkim254@gmail.com"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary underline underline-offset-2"
            >
              <Mail size={11} /> 0damkim254@gmail.com
            </a>
            <a
              href="https://github.com/adamnaemman/sdc-hackathon"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary underline underline-offset-2"
            >
              Repository <ExternalLink size={10} />
            </a>
            <a
              href="https://aura-workforce.replit.app/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary underline underline-offset-2"
            >
              Live prototype <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] font-bold tracking-[-.03em]">What it refuses to do</h2>
        <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
          <li>· Invent a job, a course, a provider or a statistic.</li>
          <li>· Claim a market figure is live when it is a saved snapshot.</li>
          <li>· Present a fit score as a verdict — every score is shown with its reasoning and its estimate.</li>
          <li>· Store a profile, an account or a CV. Everything lives in browser memory.</li>
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          These are not marketing lines; they are enforced in code. The AI may only choose identifiers that
          already exist in the catalogue, and every returned identifier is validated before it reaches the
          screen.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] font-bold tracking-[-.03em]">Sources</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          {[
            ['O*NET 30.1 database', 'U.S. Department of Labor · CC BY 4.0', 'https://www.onetcenter.org/database.html'],
            ['Arbeitnow job board API', 'live postings · public, no key', 'https://www.arbeitnow.com/api/job-board-api'],
            ['U.S. BLS Occupational Outlook Handbook', 'public domain', 'https://www.bls.gov/ooh/'],
            ['World Economic Forum · Future of Jobs 2025', 'quoted with attribution', 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/'],
          ].map(([name, note, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-secondary/40"
            >
              <span className="text-[11px] font-semibold">{name}</span>
              <span className="font-mono-ui text-[9px] text-muted-foreground">{note} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] font-bold tracking-[-.03em]">Built with</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          React 19, Vite, Tailwind CSS 4, TanStack Query, Wouter, Express 5, Zod, OpenAPI with Orval, TypeScript,
          pnpm workspaces. Hosted on Replit. Language model: DeepSeek (declared in the submission).
        </p>
      </section>

      <p className="mt-12 border-t border-border pt-5 text-[10px] leading-relaxed text-muted-foreground">
        Directional estimates only. Your experience and judgement lead the way.
      </p>
    </div>
  );
}

/**
 * HERO
 * ====
 * A quiet, mostly-graphic opening: the product name, one sentence, two ways in.
 * No feature list, no paragraphs — the four checkpoints explain themselves on
 * scroll. The artwork is CSS/SVG only (no images, no dependencies) so it stays
 * fast and matches the palette.
 */

import { ArrowRight, ChevronDown, Compass } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4.5rem)] flex-col justify-center overflow-hidden py-14 sm:py-20" data-testid="hero">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground) / .03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / .03) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }} />
        <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-20" style={{
          background: 'radial-gradient(circle at 35% 35%, hsl(var(--accent)), transparent 62%)',
        }} />
        <div className="absolute -bottom-48 -left-32 h-[520px] w-[520px] rounded-full opacity-[.13]" style={{
          background: 'radial-gradient(circle at 55% 45%, hsl(var(--primary)), transparent 66%)',
        }} />

        <svg
          className="absolute right-[4%] top-1/2 hidden h-[460px] w-[460px] -translate-y-1/2 text-foreground/[.09] lg:block"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden
        >
          <circle cx="200" cy="200" r="58" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="106" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" />
          <circle cx="200" cy="200" r="154" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="196" stroke="currentColor" strokeWidth="1" strokeDasharray="2 11" />
          <path d="M104 200a96 96 0 0 1 96-96" stroke="hsl(var(--accent))" strokeWidth="1.6" opacity=".55" />
          <path d="M200 46v42M354 200h-42" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="11" fill="hsl(var(--accent))" opacity=".85" />
          <circle cx="200" cy="46" r="5.5" fill="hsl(var(--primary))" />
          <circle cx="354" cy="200" r="5.5" fill="hsl(var(--accent))" />
          <circle cx="200" cy="354" r="4" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Compass size={19} strokeWidth={2.2} />
          </span>
          <span className="font-mono-ui text-[10px] uppercase tracking-[.26em] text-muted-foreground">
            AURA · Workforce
          </span>
        </div>

        <h1 className="font-display mt-8 text-[46px] font-bold leading-[.95] tracking-[-.065em] sm:text-[84px]">
          Your next chapter,
          <br />
          <span className="text-primary">mapped.</span>
        </h1>

        <p className="mt-6 max-w-md text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
          Four checkpoints: the evidence, your profile, the roles the AI concludes fit you, and a study plan
          built around the hours you actually have.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#signals"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[11px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            data-testid="hero-start"
          >
            Start with checkpoint 01 <ArrowRight size={14} />
          </a>
          <a
            href="#profile"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-[11px] font-semibold transition-colors hover:border-primary/40"
          >
            Set up your profile
          </a>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono-ui text-[9px] uppercase tracking-[.16em] text-muted-foreground">
          <span>4 checkpoints</span>
          <span className="text-accent">·</span>
          <span>Sourced &amp; dated</span>
          <span className="text-accent">·</span>
          <span>Private by design</span>
        </div>

        <a
          href="#signals"
          className="mt-14 inline-flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.22em] text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Scroll to checkpoint 01"
        >
          <ChevronDown size={14} className="animate-bounce" />
          Scroll to checkpoint 01
        </a>
      </div>
    </section>
  );
}

/**
 * CHECKPOINT 4 — LEARNING PATH
 * ============================
 * Two sources, one screen:
 *
 *  1. A verified pathway built for an AI-proposed occupation (preferred). Every
 *     step links to a course URL that was fetched and checked in advance; the
 *     model only chose and ordered them.
 *  2. Fallback: the plan's pathway for the closest curated role.
 *
 * The total time is always divided by the hours the person said they actually
 * have each week, so the plan is a schedule, not a wish.
 */

import { ArrowUpRight, AlertTriangle, CalendarDays, Clock3, ExternalLink } from 'lucide-react';
import { useSettings } from '@/lib/settings';

type PathwayStep = {
  moduleId: string;
  title: string;
  order: number;
  hours: number;
  why: string;
  provider?: string;
  url?: string;
};

type Plan = {
  recommendedRoleTitle: string;
  pathway: PathwayStep[];
  nextAction: string;
  caveat: string;
  model: string;
};

type VerifiedPathway = {
  roleTitle: string;
  steps: Array<{
    moduleId: string;
    title: string;
    skill: string;
    hours: number;
    provider: string;
    url: string;
    costNote: string;
    order: number;
    why: string;
  }>;
  topics?: Array<{ topic: string; why: string; provider: string; hours: number; searchUrl: string }>;
  totalHours: number;
  note: string;
  model: string;
  generatedAt: string;
};

type LearningPathSectionProps = {
  verified: VerifiedPathway | null;
  pathwayLoading: boolean;
  pathwayError: string | null;
  weeklyHours: number;
};

export function LearningPathSection({
  verified,
  pathwayLoading,
  pathwayError,
  weeklyHours,
}: LearningPathSectionProps) {
  const { t } = useSettings();
  const steps: PathwayStep[] = (verified?.steps ?? []).map((step) => ({
    moduleId: step.moduleId,
    title: step.title,
    order: step.order,
    hours: step.hours,
    why: step.why,
    provider: step.provider,
    url: step.url,
  }));

  const roleTitle = verified?.roleTitle;
  const totalHours = verified?.totalHours ?? 0;
  const hoursPerWeek = Math.max(1, weeklyHours);
  const totalWeeks = Math.max(1, Math.ceil(totalHours / hoursPerWeek));
  const busy = pathwayLoading;

  return (
    <section id="pathway" className="scroll-mt-24 border-t border-border py-10">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.19em] text-muted-foreground">
          <span className="h-px w-5 bg-accent" />{t.cp.fourEyebrow}
        </div>
        <h2 className="font-display max-w-3xl text-[32px] font-bold leading-[1.1] tracking-[-.055em] sm:text-[40px]">
          {t.cp.fourTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          {t.cp.fourSub}
        </p>
      </div>

      {busy ? (
        <div className="rounded-2xl border border-border bg-card p-6" role="status">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          <span className="sr-only">Building your study plan</span>
        </div>
      ) : null}

      {pathwayError ? (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4" data-testid="pathway-error">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              {pathwayError} The pathway could not be generated — try again, or choose another role in checkpoint 03.
            </p>
          </div>
        </div>
      ) : null}

      {!busy && verified && verified.steps.length === 0 && (verified.topics?.length ?? 0) > 0 ? (
        <div data-testid="topic-plan">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              No verified course exists for <span className="font-semibold text-foreground">{verified.roleTitle}</span> yet,
              so the planner wrote the study topics instead. Each link opens a search for that topic.
            </p>
            <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-[9px] font-semibold">
              Topics · search links, not courses
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <ol className="space-y-3">
              {(verified.topics ?? []).map((topic, index) => (
                <li key={topic.topic} className="flex items-start gap-3" data-testid={`topic-${index + 1}`}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono-ui text-[10px] font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-[15px] font-bold tracking-[-.02em]">{topic.topic}</h3>
                      <span className="font-mono-ui text-[9px] text-muted-foreground">{topic.hours} h · week {index + 1}</span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{topic.why}</p>
                    <a
                      href={topic.searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-semibold text-primary underline underline-offset-2"
                    >
                      Search this topic on {topic.provider} <ExternalLink size={10} />
                    </a>
                  </div>
                </li>
              ))}
            </ol>

            <aside className="h-fit rounded-2xl bg-primary p-5 text-primary-foreground lg:sticky lg:top-24">
              <div className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-primary-foreground/55">TOPIC PLAN FOR</div>
              <div className="font-display mt-1 text-[18px] font-bold tracking-[-.03em]">{verified.roleTitle}</div>
              <div className="mt-4 space-y-3 border-t border-primary-foreground/15 pt-4">
                <div className="flex items-center gap-2">
                  <Clock3 size={14} className="text-primary-foreground/70" />
                  <div>
                    <div className="font-mono-ui text-[8px] uppercase tracking-wider text-primary-foreground/50">Estimated time</div>
                    <div className="text-[14px] font-bold">{verified.totalHours} hours</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-primary-foreground/70" />
                  <div>
                    <div className="font-mono-ui text-[8px] uppercase tracking-wider text-primary-foreground/50">At {hoursPerWeek} h / week</div>
                    <div className="text-[14px] font-bold">{Math.max(1, Math.ceil(verified.totalHours / hoursPerWeek))} weeks approx.</div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[9px] leading-relaxed text-primary-foreground/55">
                Hours are our estimate of the study time, not a provider figure. Pick one course per topic yourself.
              </p>
            </aside>
          </div>
        </div>
      ) : null}

      {!busy && verified && verified.steps.length === 0 && (verified.topics?.length ?? 0) === 0 && !pathwayError ? (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6" data-testid="pathway-none">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-display text-[16px] font-bold">No verified course yet for {verified.roleTitle}</p>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
                Our verified library covers AI operations, process automation, data and supply-chain skills —
                it does not yet contain a course for this occupation, and the planner is not allowed to invent
                one. Search the topic yourself, or pick another role in checkpoint 03.
              </p>
              <a
                href={`https://www.coursera.org/search?query=${encodeURIComponent(verified.roleTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary underline underline-offset-2"
              >
                Search courses for {verified.roleTitle} <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {!busy && steps.length === 0 && !pathwayError && !verified ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="learning-path-empty">
          <CalendarDays size={20} className="mx-auto text-primary" />
          <p className="font-display mt-3 text-[17px] font-bold">No plan yet</p>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Choose one of the roles in checkpoint 03 and press <span className="font-semibold">Build verified pathway</span> —
            the plan appears here, fitted to your weekly hours.
          </p>
          <a href="#roles" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-primary-foreground">
            Go to checkpoint 03 <ArrowUpRight size={12} />
          </a>
        </div>
      ) : null}

      {steps.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]" data-testid="learning-path">
          <ol className="space-y-3">
            {steps.map((step, index) => {
              const completedHours = steps.slice(0, index).reduce((sum, item) => sum + Number(item.hours || 0), 0);
              const startWeek = Math.floor(completedHours / hoursPerWeek) + 1;
              const endWeek = Math.max(startWeek, Math.ceil((completedHours + Number(step.hours || 0)) / hoursPerWeek));

              return (
                <li key={step.moduleId} className="flex items-start gap-3" data-testid={`plan-step-${step.moduleId}`}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono-ui text-[10px] font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-[15px] font-bold tracking-[-.02em]">{step.title}</h3>
                      <span className="font-mono-ui text-[9px] text-muted-foreground">
                        {step.hours} h · week {startWeek}{endWeek !== startWeek ? `–${endWeek}` : ''}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{step.why}</p>
                    {step.url ? (
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-semibold text-primary underline underline-offset-2"
                        data-testid={`link-step-${step.moduleId}`}
                      >
                        {step.provider ?? 'Course'} <ExternalLink size={10} />
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          <aside className="h-fit rounded-2xl bg-primary p-5 text-primary-foreground lg:sticky lg:top-24">
            <div className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-primary-foreground/55">
              VERIFIED PLAN FOR
            </div>
            <div className="font-display mt-1 text-[18px] font-bold tracking-[-.03em]">{roleTitle}</div>

            <div className="mt-4 space-y-3 border-t border-primary-foreground/15 pt-4">
              <div className="flex items-center gap-2">
                <Clock3 size={14} className="text-primary-foreground/70" />
                <div>
                  <div className="font-mono-ui text-[8px] uppercase tracking-wider text-primary-foreground/50">Total learning time</div>
                  <div className="text-[14px] font-bold">{totalHours} hours</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-primary-foreground/70" />
                <div>
                  <div className="font-mono-ui text-[8px] uppercase tracking-wider text-primary-foreground/50">At {hoursPerWeek} h / week</div>
                  <div className="text-[14px] font-bold">{totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'} approx.</div>
                </div>
              </div>
            </div>

            {verified?.note ? (
              <p className="mt-4 border-t border-primary-foreground/15 pt-3 text-[9px] leading-relaxed text-primary-foreground/70">{verified.note}</p>
            ) : null}

            <p className="mt-3 text-[9px] leading-relaxed text-primary-foreground/55">
              Course links were verified before publishing. Confirm availability with the provider.
            </p>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

/**
 * CHECKPOINT 4 — LEARNING PATH
 * ============================
 * The study plan the model ordered for this person, fitted to the hours they
 * said they actually have each week.
 *
 * The model chooses the order and writes the reason for each step; the hours and
 * the titles come from the curated catalogue, so the numbers are not invented.
 */

import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';

type PathwayStep = {
  moduleId: string;
  title: string;
  order: number;
  hours: number;
  why: string;
};

type Plan = {
  recommendedRoleTitle: string;
  pathway: PathwayStep[];
  nextAction: string;
  caveat: string;
  model: string;
};

type LearningPathSectionProps = {
  plan: Plan | null;
  planLoading: boolean;
  weeklyHours: number;
};

export function LearningPathSection({ plan, planLoading, weeklyHours }: LearningPathSectionProps) {
  const steps = plan?.pathway ?? [];
  const totalHours = steps.reduce((sum, step) => sum + Number(step.hours || 0), 0);
  const hoursPerWeek = Math.max(1, weeklyHours);
  const totalWeeks = Math.max(1, Math.ceil(totalHours / hoursPerWeek));

  return (
    <section id="pathway" className="scroll-mt-24 border-t border-border py-10">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.19em] text-muted-foreground">
          <span className="h-px w-5 bg-accent" />Checkpoint 04 · Learning path
        </div>
        <h2 className="font-display max-w-3xl text-[32px] font-bold leading-[1.1] tracking-[-.055em] sm:text-[40px]">
          A plan built around the hours you actually have.
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          The model orders the steps and explains each one. Hours and titles come from our catalogue, so
          nothing here is a made-up course.
        </p>
      </div>

      {planLoading ? (
        <div className="rounded-2xl border border-border bg-card p-6" role="status">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          <span className="sr-only">Building your study plan</span>
        </div>
      ) : null}

      {!planLoading && steps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="learning-path-empty">
          <CalendarDays size={20} className="mx-auto text-primary" />
          <p className="font-display mt-3 text-[17px] font-bold">No plan yet</p>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            The study plan is generated together with your future roles. Fill in your profile, then press
            Apply — and it will appear here, fitted to your weekly hours.
          </p>
          <a href="#profile" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-primary-foreground">
            Go to your profile <ArrowUpRight size={12} />
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
                  </div>
                </li>
              );
            })}
          </ol>

          <aside className="h-fit rounded-2xl bg-primary p-5 text-primary-foreground lg:sticky lg:top-24">
            <div className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-primary-foreground/55">PLAN FOR</div>
            <div className="font-display mt-1 text-[18px] font-bold tracking-[-.03em]">{plan?.recommendedRoleTitle}</div>

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

            {plan?.nextAction ? (
              <p className="mt-4 border-t border-primary-foreground/15 pt-3 text-[10px] leading-relaxed text-primary-foreground/80">
                <span className="font-semibold text-primary-foreground">Next step: </span>{plan.nextAction}
              </p>
            ) : null}

            <p className="mt-3 text-[9px] leading-relaxed text-primary-foreground/55">
              {plan?.caveat || 'Directional guidance only. Confirm course details with the provider.'}
            </p>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

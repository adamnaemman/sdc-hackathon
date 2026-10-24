/**
 * WELCOME NOTICE
 * ==============
 * Shown once when someone arrives, explaining what the four checkpoints do before
 * they commit any time. Dismissal is remembered:
 *
 *   - "Start"            → hidden for this browser session (sessionStorage)
 *   - "Don't show again" → hidden permanently (localStorage)
 *
 * It is a plain dialog, not a toast, because a toast disappears while the person
 * is still reading — and the copy is the only place that explains the page order.
 */

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useSettings } from '@/lib/settings';

const SESSION_KEY = 'aura-welcome-session';
const PERMANENT_KEY = 'aura-welcome-off';

function readFlag(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function WelcomeDialog() {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readFlag(PERMANENT_KEY) === '1' || readFlag(SESSION_KEY) === '1') return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissForSession();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function dismissForSession() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode */
    }
    setOpen(false);
  }

  function dismissForever() {
    try {
      window.localStorage.setItem(PERMANENT_KEY, '1');
    } catch {
      /* private mode */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/35 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      data-testid="welcome-dialog"
      onClick={dismissForSession}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-[0_24px_60px_-24px_rgba(20,40,36,.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles size={14} />
            </span>
            <span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-muted-foreground">
              {t.welcome.label}
            </span>
          </div>
          <button
            type="button"
            onClick={dismissForSession}
            aria-label={t.welcome.start}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>

        <h2 id="welcome-title" className="font-display mt-4 text-[25px] font-bold leading-tight tracking-[-.04em]">
          {t.welcome.title}
        </h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{t.welcome.sub}</p>

        <ul className="mt-4 space-y-2">
          {t.welcome.items.map((item) => (
            <li key={item} className="rounded-xl bg-secondary/45 px-3 py-2 text-[11.5px] leading-relaxed">
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">{t.welcome.privacy}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={dismissForSession}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-semibold text-primary-foreground"
            data-testid="button-welcome-start"
          >
            {t.welcome.start} <ArrowRight size={13} />
          </button>
          <button
            type="button"
            onClick={dismissForever}
            className="focus-ring rounded-lg px-3 py-2.5 text-[11px] font-semibold text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            data-testid="button-welcome-never"
          >
            {t.welcome.never}
          </button>
        </div>
      </div>
    </div>
  );
}

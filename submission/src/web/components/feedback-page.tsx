/**
 * FEEDBACK — standalone page
 * ==========================
 * Reached from the sidebar. Five stars, two free-text questions, no account and
 * no email. The only storage is an append-only file on the server; the page shows
 * aggregate counts so a reviewer can see the app is being used.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, Star } from 'lucide-react';
import { useSettings } from '@/lib/settings';

const copy = {
  en: {
    back: 'Back to the planner',
    eyebrow: 'Feedback',
    title: 'Did this help you?',
    sub: 'Two minutes. No account, no email — just what worked and what did not. It is the fastest way to make the next version better.',
    ratingLabel: 'How useful was it?',
    roleLabel: 'Your role or field',
    roleOptional: 'optional',
    rolePlaceholder: 'e.g. procurement assistant',
    workedLabel: 'What worked?',
    workedPlaceholder: 'The part you would keep.',
    improveLabel: 'What should improve?',
    improvePlaceholder: 'The part that confused you, or felt missing.',
    submit: 'Send feedback',
    sending: 'Sending…',
    thanksTitle: 'Thank you.',
    thanksBody: 'Your note is saved. There is no account and no follow-up email.',
    again: 'Send another',
    error: 'Could not save that just now. Try again in a moment.',
    responses: 'responses',
    average: 'average',
    required: 'Pick a rating first.',
  },
  bm: {
    back: 'Kembali ke perancang',
    eyebrow: 'Maklum balas',
    title: 'Adakah ini membantu anda?',
    sub: 'Dua minit. Tiada akaun, tiada e-mel — hanya apa yang berkesan dan apa yang tidak. Ini cara terpantas untuk perbaiki versi seterusnya.',
    ratingLabel: 'Seberapa berguna ia?',
    roleLabel: 'Peranan atau bidang anda',
    roleOptional: 'pilihan',
    rolePlaceholder: 'cth. pembantu perolehan',
    workedLabel: 'Apa yang berkesan?',
    workedPlaceholder: 'Bahagian yang anda mahu kekalkan.',
    improveLabel: 'Apa yang perlu diperbaiki?',
    improvePlaceholder: 'Bahagian yang mengelirukan atau terasa kurang.',
    submit: 'Hantar maklum balas',
    sending: 'Menghantar…',
    thanksTitle: 'Terima kasih.',
    thanksBody: 'Nota anda telah disimpan. Tiada akaun dan tiada e-mel susulan.',
    again: 'Hantar lagi',
    error: 'Tidak dapat menyimpan sebentar tadi. Cuba lagi.',
    responses: 'respons',
    average: 'purata',
    required: 'Pilih penilaian dahulu.',
  },
} as const;

type Summary = { total: number; average: number };

export function FeedbackPage() {
  const { lang } = useSettings();
  const c = copy[lang];

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [role, setRole] = useState('');
  const [worked, setWorked] = useState('');
  const [improve, setImprove] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('/api/feedback/summary')
      .then((response) => (response.ok ? (response.json() as Promise<Summary>) : null))
      .then((data) => {
        if (data && data.total > 0) setSummary(data);
      })
      .catch(() => {});
  }, [sent]);

  async function submit() {
    if (rating === 0) {
      setError(c.required);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rating, role, worked, improve, lang }),
      });
      if (!response.ok) throw new Error('bad response');
      setSent(true);
    } catch {
      setError(c.error);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center py-12" data-testid="feedback-thanks">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check size={22} />
          </span>
          <h1 className="font-display mt-4 text-[27px] font-bold tracking-[-.03em]">{c.thanksTitle}</h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{c.thanksBody}</p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setRating(0);
              setWorked('');
              setImprove('');
            }}
            className="mt-5 rounded-lg border border-border px-4 py-2.5 text-[11px] font-semibold"
          >
            {c.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-10" data-testid="page-feedback">
      <a href="/" className="inline-flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={12} /> {c.back}
      </a>

      <div className="mt-6 mb-3 flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[.19em] text-muted-foreground">
        <span className="h-px w-5 bg-accent" />
        {c.eyebrow}
      </div>

      <h1 className="font-display text-[35px] font-bold leading-[1.05] tracking-[-.05em] sm:text-[43px]">{c.title}</h1>
      <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">{c.sub}</p>

      {summary ? (
        <p className="mt-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground" data-testid="feedback-summary">
          {summary.total} {c.responses} · {summary.average}/5 {c.average}
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-[12px] font-semibold">{c.ratingLabel}</p>
        <div className="mt-3 flex items-center gap-1.5" data-testid="feedback-stars">
          {[1, 2, 3, 4, 5].map((score) => {
            const active = score <= (hover || rating);
            return (
              <button
                key={score}
                type="button"
                onMouseEnter={() => setHover(score)}
                onMouseLeave={() => setHover(0)}
                onClick={() => {
                  setRating(score);
                  setError('');
                }}
                aria-label={`${score} of 5`}
                aria-pressed={rating === score}
                className={`focus-ring rounded-md p-1 transition-transform hover:-translate-y-0.5 ${active ? 'text-accent' : 'text-muted-foreground/40'}`}
                data-testid={`button-rating-${score}`}
              >
                <Star size={26} fill={active ? 'currentColor' : 'none'} />
              </button>
            );
          })}
        </div>

        <label className="mt-6 block">
          <span className="text-[12px] font-semibold">{c.roleLabel} </span>
          <span className="text-[10px] text-muted-foreground">({c.roleOptional})</span>
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder={c.rolePlaceholder}
            className="form-input mt-2"
            data-testid="input-feedback-role"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-[12px] font-semibold">{c.workedLabel}</span>
          <textarea
            value={worked}
            onChange={(event) => setWorked(event.target.value)}
            placeholder={c.workedPlaceholder}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-[12px] outline-none focus:border-primary/60"
            data-testid="input-feedback-worked"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-[12px] font-semibold">{c.improveLabel}</span>
          <textarea
            value={improve}
            onChange={(event) => setImprove(event.target.value)}
            placeholder={c.improvePlaceholder}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-[12px] outline-none focus:border-primary/60"
            data-testid="input-feedback-improve"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-[11px] text-foreground" data-testid="feedback-error">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
          data-testid="button-feedback-submit"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          {busy ? c.sending : c.submit}
        </button>
      </div>
    </div>
  );
}

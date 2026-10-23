/**
 * ASK AURA — floating help assistant
 * ==================================
 * Answers questions about how the app works. The backend constrains the model to
 * a fixed help text, so this panel can explain the page but can never invent a
 * job, a course or a feature.
 *
 * Plain state, no library: one message list, one input, one request.
 */

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useSettings } from '@/lib/settings';

type Message = { role: 'user' | 'assistant'; text: string };

export function AskAura() {
  const { t, lang } = useSettings();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, open]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (trimmed.length < 2 || busy) return;

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setBusy(true);

    try {
      const response = await fetch('/api/help', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: trimmed, lang }),
      });
      if (!response.ok) throw new Error('bad response');
      const data = (await response.json()) as { answer?: string };
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: data.answer?.trim() || t.ask.error },
      ]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: t.ask.error }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open ? (
        <div
          className="fixed bottom-4 right-4 z-[70] flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-24px_rgba(20,40,36,.5)]"
          role="dialog"
          aria-label={t.ask.title}
          data-testid="ask-aura-panel"
        >
          <div className="flex items-start justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-3">
            <div>
              <p className="font-display text-[14px] font-bold tracking-[-.02em]">{t.ask.title}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted-foreground">{t.ask.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              data-testid="button-ask-close"
            >
              <X size={15} />
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[46vh] min-h-[140px] space-y-2.5 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="space-y-2">
                {t.ask.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void ask(suggestion)}
                    className="block w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-left text-[10px] leading-relaxed transition-colors hover:border-primary/40 hover:bg-secondary/40"
                    data-testid="button-ask-suggestion"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[92%] rounded-xl px-3 py-2 text-[10.5px] leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-secondary/60 text-foreground'
                }`}
              >
                {message.text}
              </div>
            ))}

            {busy ? (
              <div className="w-fit rounded-xl bg-secondary/60 px-3 py-2 text-[10px] text-muted-foreground">
                {t.ask.thinking}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(input);
            }}
            className="border-t border-border p-2.5"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t.ask.placeholder}
                className="focus-ring min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[10.5px] outline-none placeholder:text-muted-foreground/70"
                data-testid="input-ask-aura"
              />
              <button
                type="submit"
                disabled={busy || input.trim().length < 2}
                aria-label={t.ask.send}
                className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
                data-testid="button-ask-send"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[8px] leading-relaxed text-muted-foreground">{t.ask.disclaimer}</p>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-4 right-4 z-[65] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[10px] font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(20,40,36,.6)] transition-transform hover:-translate-y-0.5"
        data-testid="button-ask-aura"
      >
        <MessageCircle size={14} />
        {t.ask.button}
      </button>
    </>
  );
}

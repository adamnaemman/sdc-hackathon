/**
 * APP SETTINGS — theme and language
 * =================================
 * Two small preferences that persist in localStorage:
 *   - theme: light / dark, by toggling `.dark` on <html> (the CSS variables for
 *     dark mode already exist in index.css)
 *   - language: English / Bahasa Malaysia, from the small dictionary in i18n.ts
 *
 * Both are cosmetic and local: nothing is sent to the server.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { copy, type Lang } from './i18n';

type Theme = 'light' | 'dark';

type SettingsValue = {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (next: Lang) => void;
  t: (typeof copy)['en'];
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('Settings provider is missing');
  return value;
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem('aura-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* private mode */
  }
  return 'light';
}

function readLang(): Lang {
  try {
    const stored = localStorage.getItem('aura-lang');
    if (stored === 'bm' || stored === 'en') return stored;
  } catch {
    /* private mode */
  }
  return 'en';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('aura-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === 'bm' ? 'ms' : 'en';
    try {
      localStorage.setItem('aura-lang', lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value = useMemo<SettingsValue>(
    () => ({
      theme,
      lang,
      setLang: setLangState,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      t: copy[lang],
    }),
    [theme, lang],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function SettingsControls() {
  const { theme, toggleTheme, lang, setLang, t } = useSettings();

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex rounded-lg border border-border bg-card p-0.5" role="group" aria-label={t.settings.language}>
        {(['en', 'bm'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={lang === option}
            className={`focus-ring rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-[.1em] transition-colors ${
              lang === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid={`button-lang-${option}`}
          >
            {option === 'en' ? 'EN' : 'BM'}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t.settings.light : t.settings.dark}
        title={theme === 'dark' ? t.settings.light : t.settings.dark}
        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        data-testid="button-theme"
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}

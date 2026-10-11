'use client';

import { createContext, use, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasLang, LANG_LABELS, LANGS, loadLang, setLang, type Lang } from '../lib/copy';
import { langOfPath, localize } from '../lib/routes';
import { cx } from '../lib/cx';

const KEY = 'fmath:lang';

function save(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
}

const LangContext = createContext<{ lang: Lang; change: (l: Lang) => void }>({ lang: 'en', change: () => {} });

/**
 * Holds the interface language, which the URL decides: /id/ pages are
 * Indonesian and are exported in Indonesian, so search engines index both.
 * Indonesian copy is its own chunk; on an /id/ page this suspends until it has
 * loaded, which during hydration keeps the server HTML on screen. A language
 * change remounts the app so every `t` read sees it; inputs survive because
 * they are saved on the device.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = langOfPath(pathname);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const change = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      // fetch the copy first: offline before it was cached, stay in the current language
      loadLang(next).then(
        () => {
          save(next);
          const { search, hash } = window.location;
          router.push(localize(window.location.pathname, next) + search + hash);
        },
        () => {},
      );
    },
    [lang, router],
  );

  return (
    <LangContext value={{ lang, change }}>
      <LangGate key={lang} lang={lang}>
        {children}
      </LangGate>
    </LangContext>
  );
}

/**
 * Waits for a language's copy, then makes it the one `t` reads. No other hooks
 * here, so suspending on use() cannot shift any hook order.
 */
function LangGate({ lang, children }: { lang: Lang; children: ReactNode }) {
  if (!hasLang(lang)) use(loadLang(lang));
  // set before the subtree renders, so every `t` read in this render pass gets this language
  setLang(lang);
  return children;
}

/** The current interface language, for code that builds links. */
export function useLang(): Lang {
  return useContext(LangContext).lang;
}

/** EN / wkwk switch for the header. */
export function LangToggle() {
  const { lang, change } = useContext(LangContext);
  return (
    <div role="radiogroup" aria-label="Language / Bahasa" className="flex h-9 items-center rounded-lg border border-line p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          lang={l}
          onClick={() => change(l)}
          // start fetching the other language as soon as a tap or click looks likely
          onPointerEnter={() => void loadLang(l).catch(() => {})}
          onFocus={() => void loadLang(l).catch(() => {})}
          className={cx(
            'h-full rounded-md px-2 text-xs font-semibold',
            lang === l ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
          )}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

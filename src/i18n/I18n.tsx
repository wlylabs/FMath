import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { DICTS, type Dict } from './dict';
import type { Locale } from '../lib/format';
import { usePersistentState } from '../hooks/usePersistentState';

interface I18nValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function detect(): Locale {
  if (typeof navigator === 'undefined') return 'id';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of langs) {
    const base = l?.toLowerCase().split('-')[0];
    if (base === 'id' || base === 'ms') return 'id';
    if (base === 'en') return 'en';
  }
  return 'id';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = usePersistentState<Locale>('locale', detect());
  const safe: Locale = locale === 'en' ? 'en' : 'id';
  useEffect(() => {
    document.documentElement.lang = safe;
    document.title = DICTS[safe].meta.title;
  }, [safe]);
  const value = useMemo(() => ({ locale: safe, t: DICTS[safe], setLocale }), [safe, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n outside I18nProvider');
  return ctx;
}

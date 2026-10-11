'use client';

import { useCallback, useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { ExternalLink, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { getToken, searchTokens, dexscreenerChainId, type TokenMarket } from '../api/dexscreener';
import { getChain } from '../lib/fees';
import { compactUsd, pct, price, shortAddress, time } from '../lib/format';
import { t } from '../lib/copy';
import { LiveBadge, SwapValue } from './ui';
import { cx } from '../lib/cx';

function TokenIcon({ token, size = 36 }: { token: Pick<TokenMarket, 'imageUrl' | 'symbol'>; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (token.imageUrl && !failed) {
    return (
      // token logos come from many outside CDNs, and image optimization is off in the static export
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={token.imageUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full bg-surface-2 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink-2"
      style={{ width: size, height: size }}
    >
      {token.symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function TokenLookup(props: { token: TokenMarket | null; onChange: (t: TokenMarket | null) => void }) {
  const [query, setQuery] = useState('');
  // the last finished search; anything else for the current query is still loading
  const [search, setSearch] = useState<{ q: string; ok: boolean; results: TokenMarket[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  // a pick or a clear by the user settles the new view in; a token restored on load just appears
  const [swapped, setSwapped] = useState(false);
  const listId = useId();
  const inputId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { token, onChange } = props;

  const q = query.trim();
  const settled = search?.q === q ? search : null;
  const status: 'idle' | 'loading' | 'error' | 'done' = q.length < 2 ? 'idle' : !settled ? 'loading' : settled.ok ? 'done' : 'error';
  const results = settled?.results ?? [];

  useEffect(() => {
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      searchTokens(q, ctrl.signal)
        .then((r) => {
          setSearch({ q, ok: true, results: r.slice(0, 8) });
          setActive(0);
        })
        .catch((e: unknown) => {
          if ((e as Error).name !== 'AbortError') setSearch({ q, ok: false, results: [] });
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;
      const chainId = dexscreenerChainId(token.chain);
      if (!chainId) return;
      setRefreshing(true);
      try {
        const fresh = await getToken(chainId, token.address, signal);
        if (fresh) onChange(fresh);
        setRefreshError(false);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setRefreshError(true);
      } finally {
        setRefreshing(false);
      }
    },
    [token, onChange],
  );

  // Pull fresh numbers when a saved token is restored, then every 60s while the tab is visible,
  // and straight away when the tab comes back with numbers older than 15s.
  const refreshFromEffect = useEffectEvent((signal: AbortSignal, onlyIfStale: boolean) => {
    if (onlyIfStale && Date.now() - (token?.fetchedAt ?? 0) <= 15_000) return;
    void refresh(signal);
  });
  const tokenKey = token?.key;
  useEffect(() => {
    if (!tokenKey) return;
    const ctrl = new AbortController();
    const first = setTimeout(() => refreshFromEffect(ctrl.signal, true), 0);
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refreshFromEffect(ctrl.signal, false);
    }, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshFromEffect(ctrl.signal, true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      ctrl.abort();
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tokenKey]);

  const pick = (m: TokenMarket) => {
    setSwapped(true);
    onChange(m);
    setQuery('');
    setOpen(false);
  };

  if (token) {
    const change = token.change24h;
    return (
      <div className={cx('rounded-xl border border-line bg-surface-2 p-3.5', swapped && 'enter')}>
        <div className="flex items-start gap-3">
          <TokenIcon token={token} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate font-semibold text-ink">{token.symbol}</span>
              <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] text-ink-2 ring-1 ring-line">
                {getChain(token.chain).name}
              </span>
              <LiveBadge label={t.common.live} />
            </div>
            <p className="truncate text-xs text-muted">
              {token.name} · <span className="num">{shortAddress(token.address)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSwapped(true);
              onChange(null);
            }}
            className="press -mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink"
            aria-label={t.profit.change}
            title={t.profit.change}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
          <div>
            <dt className="text-[11px] text-muted">{t.profit.price}</dt>
            <dd className="num text-sm text-ink">
              <SwapValue value={price(token.priceUsd)} />
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">{token.marketCap !== null ? t.profit.mcap : t.profit.fdv}</dt>
            <dd className="num text-sm text-ink">
              <SwapValue value={compactUsd(token.marketCap ?? token.fdv)} />
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">{t.profit.liquidity}</dt>
            <dd className="num text-sm text-ink">{compactUsd(token.liquidityUsd)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">{t.profit.change24h}</dt>
            <dd className={cx('num text-sm', change === null ? 'text-ink' : change >= 0 ? 'text-pos' : 'text-neg')}>
              {change === null ? '-' : pct(change / 100, { signed: true })}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5 text-xs text-muted">
          <span>
            {refreshError ? t.common.loadError : t.common.updated(time(token.fetchedAt))}
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              className="press inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-medium text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-60"
            >
              <RefreshCw aria-hidden className={cx('size-3.5', refreshing && 'animate-spin')} />
              {t.common.refresh}
            </button>
            <a
              href={token.pairUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-medium text-ink-2 hover:bg-surface hover:text-ink"
            >
              DexScreener
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          </span>
        </div>
      </div>
    );
  }

  const showList = open && query.trim().length >= 2;
  return (
    <div ref={wrapRef} className={cx('relative', swapped && 'enter')}>
      <label htmlFor={inputId} className="sr-only">
        {t.profit.searchLabel}
      </label>
      <div className="flex h-12 items-center rounded-xl border border-line bg-surface-2 transition-colors focus-within:border-accent-strong focus-within:bg-surface hover:border-line-strong">
        <Search aria-hidden className="ml-3.5 size-4 shrink-0 text-muted" />
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          placeholder={t.profit.searchPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showList || results.length === 0) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => (a - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const r = results[active];
              if (r) pick(r);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="h-full w-full min-w-0 bg-transparent px-2.5 text-base text-ink outline-none placeholder:text-muted/70 [&::-webkit-search-cancel-button]:hidden"
        />
        {status === 'loading' && <Loader2 aria-hidden className="mr-3.5 size-4 shrink-0 animate-spin text-muted" />}
      </div>
      {showList && (
        <div className="pop-in absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          {status === 'error' ? (
            <p className="px-4 py-3 text-sm text-ink-2">{t.common.loadError}</p>
          ) : status === 'loading' && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{t.profit.searching}</p>
          ) : status === 'done' && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{t.profit.noResults}</p>
          ) : (
            <ul id={listId} role="listbox" aria-label={t.profit.searchLabel} className="max-h-80 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li
                  key={r.key}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(r)}
                  className={cx('flex cursor-pointer items-center gap-3 px-3.5 py-2.5', i === active && 'bg-surface-2')}
                >
                  <TokenIcon token={r} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">{r.symbol}</span>
                      <span className="shrink-0 text-[11px] text-muted">{getChain(r.chain).name}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">{r.name}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="num block text-sm text-ink">{compactUsd(r.marketCap ?? r.fdv)}</span>
                    <span className="num block text-[11px] text-muted">
                      {t.profit.liquidity} {compactUsd(r.liquidityUsd)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="border-t border-line px-4 py-2 text-[11px] text-muted">{t.profit.tokenHint}</p>
        </div>
      )}
    </div>
  );
}

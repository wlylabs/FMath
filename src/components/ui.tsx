'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { isAmbiguousAmount, num, parseAmount } from '../lib/format';

export function Field(props: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  optional?: boolean;
  aside?: ReactNode;
  children: ReactNode;
  labelId?: string;
}) {
  const Label = props.htmlFor ? 'label' : 'span';
  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-h-5 items-baseline justify-between gap-3">
        <Label id={props.labelId} htmlFor={props.htmlFor} className="text-sm font-medium text-ink">
          {props.label}
          {props.optional && <span className="ml-1.5 font-normal text-muted">({t.common.optional})</span>}
        </Label>
        {props.aside}
      </div>
      {props.children}
      {props.hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{props.hint}</p>}
    </div>
  );
}

export function NumberInput(props: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
  ariaLabel?: string;
}) {
  const echo = isAmbiguousAmount(props.value) ? num(parseAmount(props.value), 8) : null;
  return (
    <>
    <div
      className={cx(
        'flex h-12 items-center rounded-xl border bg-surface-2 transition-colors',
        'focus-within:border-accent-strong focus-within:bg-surface',
        props.invalid ? 'border-neg' : 'border-line hover:border-line-strong',
        props.disabled && 'opacity-50',
      )}
    >
      {props.prefix && <span className="num shrink-0 pl-3.5 text-muted">{props.prefix}</span>}
      <input
        id={props.id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        aria-invalid={props.invalid || undefined}
        aria-describedby={props.describedBy}
        aria-label={props.ariaLabel}
        onChange={(e) => props.onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        className={cx(
          'num h-full w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-muted/70',
          props.prefix ? 'pl-1.5' : 'pl-3.5',
          props.suffix ? 'pr-1.5' : 'pr-3.5',
        )}
      />
      {props.suffix && <span className="shrink-0 pr-3.5 text-sm text-muted">{props.suffix}</span>}
    </div>
    {echo && <p className="num mt-1.5 text-xs text-muted">{t.common.readAs(echo)}</p>}
    </>
  );
}

interface Option<T extends string> {
  value: T;
  label: ReactNode;
  sub?: ReactNode;
}

function useRovingKeys<T extends string>(options: Option<T>[], value: T, onChange: (v: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    onChange(options[next]!.value);
    refs.current[next]?.focus();
  };
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return { refs, onKeyDown, selectedIndex };
}

/** Equal-width segmented control with radio semantics. */
export function Segmented<T extends string>(props: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  labelledBy?: string;
  tone?: (v: T) => 'pos' | 'neg' | undefined;
}) {
  const { refs, onKeyDown, selectedIndex } = useRovingKeys(props.options, props.value, props.onChange);
  return (
    <div
      role="radiogroup"
      aria-label={props.labelledBy ? undefined : props.label}
      aria-labelledby={props.labelledBy}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-line bg-surface-2 p-1"
    >
      {props.options.map((o, i) => {
        const selected = i === selectedIndex;
        const tone = props.tone?.(o.value);
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, i)}
            onClick={() => props.onChange(o.value)}
            className={cx(
              'flex min-h-10 min-w-0 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
              selected
                ? cx(
                    'bg-raised shadow-sm ring-1 ring-line-strong/60',
                    tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : 'text-ink',
                  )
                : 'text-muted hover:text-ink',
            )}
          >
            <span className="truncate">{o.label}</span>
            {o.sub && <span className="truncate text-[11px] font-normal text-muted">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Wrapping pill group with radio semantics, for longer option lists such as chains. */
export function Pills<T extends string>(props: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  labelledBy?: string;
  disabled?: boolean;
}) {
  const { refs, onKeyDown, selectedIndex } = useRovingKeys(props.options, props.value, props.onChange);
  return (
    <div
      role="radiogroup"
      aria-label={props.labelledBy ? undefined : props.label}
      aria-labelledby={props.labelledBy}
      aria-disabled={props.disabled || undefined}
      className="flex flex-wrap gap-2"
    >
      {props.options.map((o, i) => {
        const selected = i === selectedIndex;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={props.disabled && !selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, i)}
            onClick={() => props.onChange(o.value)}
            className={cx(
              'h-10 rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-40',
              selected
                ? 'border-accent-strong bg-accent-wash text-ink'
                : 'border-line bg-surface-2 text-ink-2 hover:border-line-strong hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch(props: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-describedby={props.hint ? id : undefined}
      onClick={() => props.onChange(!props.checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-left transition-colors hover:border-line-strong"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{props.label}</span>
        {props.hint && (
          <span id={id} className="mt-0.5 block text-xs text-muted">
            {props.hint}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={cx(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors',
          props.checked ? 'bg-accent' : 'bg-line-strong',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-5 rounded-full bg-surface shadow transition-transform',
            props.checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}

export function QuickPicks(props: { values: { label: string; value: string }[]; onPick: (v: string) => void; label: string; current?: string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={props.label}>
      {props.values.map((v) => (
        <button
          key={v.value}
          type="button"
          onClick={() => props.onPick(v.value)}
          aria-pressed={props.current === v.value}
          className={cx(
            'num h-8 rounded-lg border px-2.5 text-xs transition-colors',
            props.current === v.value
              ? 'border-accent-strong bg-accent-wash text-ink'
              : 'border-line text-ink-2 hover:border-line-strong hover:text-ink',
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

export function Row(props: { label: ReactNode; value: ReactNode; sub?: ReactNode; strong?: boolean; tone?: 'pos' | 'neg' | 'muted' }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={cx('shrink-0 text-sm', props.strong ? 'font-medium text-ink' : 'text-ink-2')}>{props.label}</dt>
      <dd className="min-w-0 text-right">
        <span
          className={cx(
            'num text-sm',
            props.strong && 'font-semibold',
            props.tone === 'pos' ? 'text-pos' : props.tone === 'neg' ? 'text-neg' : props.tone === 'muted' ? 'text-muted' : 'text-ink',
          )}
        >
          {props.value}
        </span>
        {props.sub && <span className="block text-xs text-muted">{props.sub}</span>}
      </dd>
    </div>
  );
}

export function Notice(props: { tone?: 'info' | 'warn'; children: ReactNode }) {
  const warn = props.tone === 'warn';
  const Icon = warn ? AlertTriangle : Info;
  return (
    <div
      role={warn ? 'alert' : undefined}
      className={cx(
        'flex gap-2.5 rounded-xl px-3.5 py-3 text-xs leading-relaxed',
        warn ? 'bg-warn-wash text-ink' : 'bg-surface-2 text-ink-2',
      )}
    >
      <Icon aria-hidden className={cx('mt-px size-4 shrink-0', warn ? 'text-warn' : 'text-muted')} />
      <div className="min-w-0">{props.children}</div>
    </div>
  );
}

export function CardTitle(props: { children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 id={props.id} className="text-sm font-semibold tracking-tight text-ink">
        {props.children}
      </h3>
      {props.aside}
    </div>
  );
}

export function LiveBadge(props: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pos-wash px-2 py-0.5 text-[11px] font-medium text-pos">
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-pos opacity-60" />
        <span className="relative inline-flex size-1.5 rounded-full bg-pos" />
      </span>
      {props.label}
    </span>
  );
}

/** Large signed figure used as the one headline number in a result card. */
export function Headline(props: { label: ReactNode; value: ReactNode; tone?: 'pos' | 'neg'; sub?: ReactNode }) {
  return (
    <div>
      <p className="text-sm text-ink-2">{props.label}</p>
      <p
        className={cx(
          'mt-1 font-sans text-4xl font-semibold tracking-tight sm:text-[2.75rem]',
          props.tone === 'pos' ? 'text-pos' : props.tone === 'neg' ? 'text-neg' : 'text-ink',
        )}
        aria-live="polite"
      >
        {props.value}
      </p>
      {props.sub && <div className="mt-1.5 text-sm text-ink-2">{props.sub}</div>}
    </div>
  );
}

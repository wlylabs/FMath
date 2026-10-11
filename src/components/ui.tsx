'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
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
  const thumb = useRef<HTMLSpanElement>(null);
  // only user-initiated changes slide; restoring saved inputs after load just places the thumb
  const change = (v: T) => {
    if (thumb.current) thumb.current.style.transition = 'transform var(--dur-base) var(--ease-drawer)';
    props.onChange(v);
  };
  const { refs, onKeyDown, selectedIndex } = useRovingKeys(props.options, props.value, change);
  const count = props.options.length;
  return (
    <div
      role="radiogroup"
      aria-label={props.labelledBy ? undefined : props.label}
      aria-labelledby={props.labelledBy}
      className="relative isolate grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-line bg-surface-2 p-1"
    >
      <span
        ref={thumb}
        aria-hidden
        className="absolute inset-y-1 left-1 -z-10 rounded-lg bg-raised shadow-sm ring-1 ring-line-strong/60"
        style={{
          width: `calc((100% - 0.5rem - ${count - 1} * 0.25rem) / ${count})`,
          transform: `translateX(calc(${selectedIndex} * (100% + 0.25rem)))`,
        }}
      />
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
            onClick={() => change(o.value)}
            // no press scale: text shrinking inside a thumb that stays still reads as a glitch
            className={cx(
              'flex min-h-10 min-w-0 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm font-medium transition-colors duration-[var(--dur-base)] ease-[var(--ease-standard)]',
              selected ? (tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : 'text-ink') : 'text-muted hover:text-ink',
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
      // wraps onto more rows, so every option is visible without scrolling
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
              'press h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap disabled:opacity-40',
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
  // like Segmented: only a user toggle slides; restoring a saved "on" after load just places the knob
  const [touched, setTouched] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-describedby={props.hint ? id : undefined}
      onClick={() => {
        setTouched(true);
        props.onChange(!props.checked);
      }}
      className="press-soft flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-left hover:border-line-strong"
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
          'relative h-6 w-10 shrink-0 rounded-full',
          touched && 'transition-colors duration-[var(--dur-base)] ease-[var(--ease-standard)]',
          props.checked ? 'bg-accent' : 'bg-line-strong',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-5 rounded-full bg-surface shadow',
            touched && 'transition-transform duration-[var(--dur-base)] ease-[var(--ease-drawer)]',
            props.checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}

export function QuickPicks(props: { values: { label: string; value: string }[]; onPick: (v: string) => void; label: string; current?: string }) {
  return (
    // one swipeable row on phones, so a last chip never sits alone on a second line; wraps from sm up
    <div
      className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={props.label}
    >
      {props.values.map((v) => (
        <button
          key={v.value}
          type="button"
          onClick={() => props.onPick(v.value)}
          aria-pressed={props.current === v.value}
          className={cx(
            'press num h-8 shrink-0 rounded-lg border px-2.5 text-xs',
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

export function Row(props: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  strong?: boolean;
  tone?: 'pos' | 'neg' | 'muted';
  className?: string;
}) {
  return (
    <div className={cx('flex items-baseline justify-between gap-4 py-2.5', props.className)}>
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
      <h2 id={props.id} className="text-sm font-semibold tracking-tight text-ink">
        {props.children}
      </h2>
      {props.aside}
    </div>
  );
}

export function LiveBadge(props: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pos-wash px-2 py-0.5 text-[11px] font-medium text-pos">
      <span aria-hidden className="size-1.5 rounded-full bg-pos" />
      {props.label}
    </span>
  );
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A flag that turns itself off again, for "copied" style confirmations. */
export function useFlash(ms = 1600): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = useCallback(() => {
    clearTimeout(timer.current);
    setOn(true);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);
  return [on, flash];
}

// emphasized decelerate; the Web Animations API cannot read the CSS token
const SETTLE = { duration: 220, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)' };

/**
 * A number that settles in when it changes because of a tap (a quick pick, a
 * segment, a switch, a token). Typing bursts and the restore of saved inputs
 * right after load stay still, or every keystroke would flicker.
 */
export function SwapValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef<{ mounted: number; changed: number } | null>(null);
  useEffect(() => {
    const now = performance.now();
    const seen = last.current;
    if (!seen) {
      last.current = { mounted: now, changed: now };
      return;
    }
    const settled = now - seen.changed > 250 && now - seen.mounted > 400;
    seen.changed = now;
    if (!settled || prefersReducedMotion()) return;
    ref.current?.animate([{ opacity: 0.35, transform: 'translateY(0.12em)' }, { opacity: 1, transform: 'none' }], SETTLE);
  }, [value]);
  return (
    <span ref={ref} className={cx('inline-block', className)}>
      {value}
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
        {typeof props.value === 'string' ? <SwapValue value={props.value} /> : props.value}
      </p>
      {props.sub && <div className="mt-1.5 text-sm text-ink-2">{props.sub}</div>}
    </div>
  );
}

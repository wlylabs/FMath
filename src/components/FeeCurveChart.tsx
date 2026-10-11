'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent } from 'react';
import { fomoFee, getChain, type ChainId, type TokenClass } from '../lib/fees';
import { compactUsd, pct, usd } from '../lib/format';
import { t } from '../lib/copy';

interface Props {
  chain: ChainId;
  tokenClass: TokenClass;
  referral: boolean;
  networkFee: number;
  order: number;
}

const X_MIN = 2;
const X_MAX = 20000;
const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 34, left: 48 };

function ticksFor(chain: ChainId, tokenClass: TokenClass): number[] {
  if (tokenClass === 'major') return [10, 100, 1000, 10000];
  if (chain === 'solana') return [5, 47.5, 190, 1000, 10000];
  return [10, 100, 1000, 10000];
}

function niceMax(v: number): number {
  const steps = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05];
  return steps.find((s) => s >= v * 1.08) ?? 0.05;
}

function yTicksFor(max: number): number[] {
  const step = [0.001, 0.0025, 0.005, 0.01].find((s) => max / s <= 6) ?? 0.01;
  const out: number[] = [];
  for (let i = 0; i * step <= max + 1e-9; i++) out.push(Number((i * step).toFixed(6)));
  return out;
}

/** 0.5% and 2.5% need one decimal, 1% and 2% none, 0.25% two. */
function tickDigits(y: number): number {
  const bp = Math.round(y * 10000);
  return bp % 100 === 0 ? 0 : bp % 10 === 0 ? 1 : 2;
}

/** Effective fee rate across order sizes: one series, log x, hover crosshair. */
export function FeeCurveChart(props: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clipId = useId();
  const network = getChain(props.chain).gasCovered ? 0 : Math.max(0, props.networkFee);
  const { chain, tokenClass, referral } = props;
  const rateAt = useCallback(
    (x: number) => (fomoFee(x, chain, tokenClass, referral).fee + network) / x,
    [chain, tokenClass, referral, network],
  );

  const { points, yMax, clipped } = useMemo(() => {
    const n = 240;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= n; i++) {
      const x = Math.exp(Math.log(X_MIN) + (i / n) * (Math.log(X_MAX) - Math.log(X_MIN)));
      pts.push({ x, y: rateAt(x) });
    }
    // add exact band edges so steps render sharp
    for (const edge of [5, 47.5, 190, 1000]) {
      pts.push({ x: edge - 1e-6, y: rateAt(edge - 1e-6) }, { x: edge, y: rateAt(edge) });
    }
    pts.sort((a, b) => a.x - b.x);
    const raw = Math.max(...pts.filter((p) => p.x >= 5).map((p) => p.y));
    const max = niceMax(Math.min(raw, 0.05));
    return { points: pts, yMax: max, clipped: pts.some((p) => p.y > max) };
  }, [rateAt]);

  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const sx = (x: number) => PAD.left + ((Math.log(x) - Math.log(X_MIN)) / (Math.log(X_MAX) - Math.log(X_MIN))) * innerW;
  const sy = (y: number) => PAD.top + (1 - Math.min(y, yMax) / yMax) * innerH;
  const invX = (px: number) =>
    Math.exp(Math.log(X_MIN) + ((px - PAD.left) / innerW) * (Math.log(X_MAX) - Math.log(X_MIN)));

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join('');
  const area = `${path}L${sx(X_MAX).toFixed(2)},${sy(0)}L${sx(X_MIN).toFixed(2)},${sy(0)}Z`;
  const yTicks = yTicksFor(yMax);
  const xTicks = ticksFor(props.chain, props.tokenClass);

  const order = props.order;
  const showOrder = order >= X_MIN && order <= X_MAX;
  const hover = hoverX !== null ? { x: hoverX, y: rateAt(hoverX) } : null;

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * innerW + PAD.left;
    const x = Math.min(X_MAX, Math.max(X_MIN, invX(px)));
    setHoverX(x);
  };

  const tip = hover
    ? {
        left: Math.min(Math.max(sx(hover.x), 90), width - 90),
        top: Math.max(sy(hover.y) - 12, 8),
      }
    : null;

  return (
    <div ref={wrapRef} className="relative w-full min-w-0 select-none">
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={`${t.chart.title}. ${t.chart.xLabel}.`}
        className="block h-auto max-w-full overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top - 2} width={innerW} height={innerH + 2} />
          </clipPath>
        </defs>
        {yTicks.map((y) => (
          <g key={y}>
            <line x1={PAD.left} x2={width - PAD.right} y1={sy(y)} y2={sy(y)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 8} y={sy(y)} dy="0.32em" textAnchor="end" className="num fill-muted text-[11px]">
              {pct(y, { digits: tickDigits(y) })}
            </text>
          </g>
        ))}
        {xTicks.map((x) => (
          <text key={x} x={sx(x)} y={HEIGHT - PAD.bottom + 18} textAnchor="middle" className="num fill-muted text-[11px]">
            {x < 1000 ? '$' + x.toLocaleString('en-US') : compactUsd(x)}
          </text>
        ))}
        <g clipPath={`url(#${clipId})`}>
          <path d={area} fill="var(--chart)" opacity={0.1} />
          <path d={path} fill="none" stroke="var(--chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        </g>
        {hover && (
          <line
            x1={sx(hover.x)}
            x2={sx(hover.x)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke="var(--line-strong)"
            strokeWidth={1}
          />
        )}
        {showOrder && (
          <g>
            <circle cx={sx(order)} cy={sy(rateAt(order))} r={6} fill="var(--chart)" stroke="var(--surface)" strokeWidth={2} />
            <text
              x={sx(order)}
              y={sy(rateAt(order)) - 12}
              textAnchor={sx(order) > width - 80 ? 'end' : sx(order) < PAD.left + 40 ? 'start' : 'middle'}
              className="fill-ink text-[11px] font-medium"
              stroke="var(--surface)"
              strokeWidth={4}
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              {t.chart.you}
            </text>
          </g>
        )}
        {hover && <circle cx={sx(hover.x)} cy={sy(hover.y)} r={4} fill="var(--chart)" stroke="var(--surface)" strokeWidth={2} />}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHoverX(null)}
          style={{ touchAction: 'pan-y' }}
        />
      </svg>
      {hover && tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-3 py-2 shadow-lg"
          style={{ left: tip.left, top: tip.top }}
        >
          <p className="num text-sm font-semibold text-ink">{pct(hover.y)}</p>
          <p className="num mt-0.5 whitespace-nowrap text-xs text-muted">
            {t.chart.order} {usd(hover.x)} · {t.chart.fee} {usd(hover.y * hover.x)}
          </p>
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{t.chart.xLabel}</span>
        {clipped && <span>{t.chart.clipped(pct(yMax, { digits: tickDigits(yMax) }))}</span>}
      </div>
    </div>
  );
}

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { FEE_SCHEDULE, fomoFee } from '../../lib/fees';
import { PERPS_FEES } from '../../lib/perps';
import { pct, usd } from '../../lib/format';
import { t } from '../../lib/copy';
import { BRAND } from '../../lib/brand';
import { CREATOR } from '../../lib/site';
import { identiconFor } from '../../lib/identicon';
import { IdenticonSvg } from '../../components/Creator';

// Served as /og.png so static hosts send it with an image content type.
export const dynamic = 'force-static';

const FONT_DIR = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');

const INK = BRAND.glyph;
const MARIGOLD = BRAND.marigold;

export async function GET() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, 'Geist-Regular.ttf')),
    readFile(join(FONT_DIR, 'Geist-SemiBold.ttf')),
  ]);
  const example = fomoFee(50, 'solana');
  const facts = [
    `${pct(FEE_SCHEDULE.standard[0].value)} standard spot fee`,
    `$50 on Solana: ${usd(example.fee)} (${pct(example.effectiveRate)})`,
    `${pct(PERPS_FEES.builder)} perps builder fee`,
  ];
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: BRAND.darkBg, padding: 72, color: BRAND.darkInk, fontFamily: 'Geist' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="76" height="76" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill={MARIGOLD} />
            <circle cx="21" cy="23" r="12" fill={INK} />
            <circle cx="43" cy="41" r="12" fill={INK} />
            <path d="M20 55H31L44 9H33Z" fill={INK} stroke={MARIGOLD} strokeWidth="5" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>FMath</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
            <div style={{ display: 'flex', width: 56, height: 56, borderRadius: 9999, overflow: 'hidden' }}>
              <IdenticonSvg icon={identiconFor(CREATOR.handle).icon} size={56} />
            </div>
            <div style={{ fontSize: 28, color: BRAND.darkInk2 }}>{`by ${CREATOR.handle}`}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1.02, letterSpacing: -3, maxWidth: 940 }}>{t.hero.title}</div>
          <div style={{ fontSize: 32, color: BRAND.darkInk2, maxWidth: 940 }}>Fee, break-even and perps calculator for fomo traders</div>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {facts.map((f) => (
            <div key={f} style={{ display: 'flex', fontSize: 24, padding: '12px 20px', borderRadius: 999, border: `2px solid ${BRAND.darkLine}`, color: BRAND.darkInk }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: regular, weight: 400, style: 'normal' },
        { name: 'Geist', data: semibold, weight: 600, style: 'normal' },
      ],
    },
  );
}

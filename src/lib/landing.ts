import { BRAND } from './brand';
import { FEE_SCHEDULE } from './fees';
import { date, pct } from './format';
import { PERPS_FEES } from './perps';
import { CALCULATOR_KEYS, LEGACY_HASHES, ROUTES } from './routes';
import { CREATOR, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from './site';

/**
 * The landing page at /: one static HTML file with its CSS and a little script
 * inline, and no React, so it paints from the first response. Everything else
 * lives in the app, which starts at ROUTES.home.
 *
 * Both languages are in the markup; <html data-lang> picks one before first
 * paint, from the same saved choice the app uses (fmath:lang).
 */

/** Coins on the price tape, as Hyperliquid names them. */
export const TAPE_COINS = ['BTC', 'ETH', 'SOL', 'HYPE'] as const;

type Pair = readonly [en: string, id: string];

export const LANDING_COPY = {
  lines: [
    [`${pct(FEE_SCHEDULE.standard[0].value)} standard spot fee`, `${pct(FEE_SCHEDULE.standard[0].value)} fee spot standar`],
    [`${FEE_SCHEDULE.solana.length} solana fee bands, worked out`, `${FEE_SCHEDULE.solana.length} band fee solana, sudah dihitung`],
    [`${pct(PERPS_FEES.builder)} perps fee + liquidation price`, `${pct(PERPS_FEES.builder)} fee perps + harga likuidasi`],
    ['100% in your browser, no login', '100% di browser kamu, tanpa login'],
  ],
  actions: [
    { href: ROUTES.home, label: ['open app', 'buka app'], primary: true },
    { href: ROUTES.fee, label: ['fee', 'fee'] },
    { href: ROUTES.perps, label: ['perps', 'perps'] },
    { href: ROUTES.referral, label: [`${pct(FEE_SCHEDULE.referralDiscount, { digits: 0 })} off`, `diskon ${pct(FEE_SCHEDULE.referralDiscount, { digits: 0 })}`] },
  ],
  tape: ['Live prices from Hyperliquid', 'Harga live dari Hyperliquid'],
  shot: ['FMath trade fee calculator', 'Kalkulator fee trading FMath'],
  by: ['by', 'oleh'],
  schedule: [`fee schedule dated ${date(FEE_SCHEDULE.version)}`, `jadwal fee tanggal ${date(FEE_SCHEDULE.version)}`],
  math: ['see the math', 'lihat rumusnya'],
} as const;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Both languages of one phrase; CSS shows the one <html data-lang> picks. */
const both = ([en, id]: Pair) => `<span class="en">${esc(en)}</span><span class="id" lang="id">${esc(id)}</span>`;

/** Inline JSON for a <script>, safe against "</script>" in the data. */
const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': `${SITE_URL}/#creator` },
      creator: { '@id': `${SITE_URL}/#creator` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#creator`,
      name: CREATOR.name,
      alternateName: CREATOR.handle,
      url: CREATOR.url,
      sameAs: [CREATOR.url],
      image: `${SITE_URL}/creator.svg`,
    },
  ],
};

// Before first paint: send the installed app and old links where they belong, then apply
// the saved or system theme and the saved language, the same way the app's layout does.
const headScript = `(function(){var l=location,q=new URLSearchParams(l.search),r=document.documentElement;
if(q.get('source')==='pwa'||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)){l.replace(${json(ROUTES.home)});return}
var tabs=${json(Object.fromEntries(CALCULATOR_KEYS.map((k) => [k, ROUTES[k]])))},tab=q.get('tab');
if(tab&&tabs.hasOwnProperty(tab)){q.delete('tab');var s=q.toString();l.replace(tabs[tab]+(s?'?'+s:''));return}
var h=${json(LEGACY_HASHES)}[l.hash];if(h){var p=h.split('#');l.replace(p[0]+l.search+(p[1]?'#'+p[1]:''));return}
var t,g;try{t=localStorage.getItem('fmath:theme');g=localStorage.getItem('fmath:lang')}catch(e){}
if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}
r.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?${json(BRAND.darkBg)}:${json(BRAND.lightBg)});
if(g==='id'){r.dataset.lang='id';r.lang='id'}})();`;

// After the markup: the language toggle, and the price tape over the Hyperliquid websocket,
// closed while the tab is hidden.
const bodyScript = `(function(){var d=document,r=d.documentElement;
d.querySelectorAll('[data-set-lang]').forEach(function(b){b.addEventListener('click',function(){var g=b.getAttribute('data-set-lang');
if(g==='id'){r.dataset.lang='id'}else{delete r.dataset.lang}r.lang=g;try{localStorage.setItem('fmath:lang',g)}catch(e){}sync()})});
function sync(){d.querySelectorAll('[data-set-lang]').forEach(function(b){b.setAttribute('aria-pressed',String((r.dataset.lang||'en')===b.getAttribute('data-set-lang')))})}sync();
if(!window.WebSocket)return;var coins=${json(TAPE_COINS)},ws=null,timer,tries=0;
function fmt(p){return'$'+p.toLocaleString('en-US',{minimumFractionDigits:p>=1000?0:2,maximumFractionDigits:p>=1000?0:p>=1?2:4})}
function show(c,x){var p=Number(x.markPx),o=Number(x.prevDayPx);if(!(p>0))return;var ch=o>0?p/o-1:null;
d.querySelectorAll('[data-coin="'+c+'"]').forEach(function(el){el.querySelector('b').textContent=fmt(p);var e=el.querySelector('i');
if(ch===null){e.textContent='';return}e.textContent=(ch>=0?'+':'')+(ch*100).toFixed(2)+'%';e.className=ch>=0?'up':'down'})}
function open(){if(ws||d.visibilityState!=='visible')return;var s=new WebSocket('wss://api.hyperliquid.xyz/ws');ws=s;
s.onopen=function(){tries=0;coins.forEach(function(c){s.send(JSON.stringify({method:'subscribe',subscription:{type:'activeAssetCtx',coin:c}}))})};
s.onmessage=function(e){try{var m=JSON.parse(e.data)}catch(x){return}if(m&&m.channel==='activeAssetCtx'&&m.data&&m.data.ctx)show(m.data.coin,m.data.ctx)};
s.onclose=function(){ws=null;timer=setTimeout(open,Math.min(30000,1000*Math.pow(2,tries++)))}}
function close(){clearTimeout(timer);if(ws){ws.onclose=null;ws.close();ws=null}}
d.addEventListener('visibilitychange',function(){d.visibilityState==='visible'?open():close()});open()})();`;

// Background: a field of ASCII characters drifting like dunes, brighter around the pointer.
// Drawn at most ~24 times a second, one fillStyle per brightness level, and not at all while the
// tab is hidden (requestAnimationFrame pauses); a single still frame under reduced motion.
const fieldScript = `(function(){var c=document.getElementById('field'),g=c&&c.getContext('2d');if(!g)return;
var RAMP=' .:-=+*#%@',CW=14,CH=20,LV=8,cols,rows,w,h,base,peak,px=-1,py=-1,last=0,t0=performance.now(),
still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){var r=Math.min(2,window.devicePixelRatio||1);w=innerWidth;h=innerHeight;c.width=w*r;c.height=h*r;
g.setTransform(r,0,0,r,0,0);g.font='12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';g.textAlign='center';g.textBaseline='middle';
cols=Math.ceil(w/CW);rows=Math.ceil(h/CH);var s=getComputedStyle(document.documentElement);base=s.getPropertyValue('--muted').trim();peak=s.getPropertyValue('--accent-strong').trim()}
function sm(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
function frame(now){if(!still)requestAnimationFrame(frame);if(now-last<40&&!still)return;last=now;
var t=(now-t0)/1000,wide=w>=900,ar=w/h,buckets=[];for(var k=0;k<LV*2;k++)buckets.push([]);
for(var j=0;j<rows;j++){var y=j/rows;for(var i=0;i<cols;i++){var x=i/cols*ar,
v=Math.sin(x*2.4+t*.2+Math.sin(y*2.2-t*.13)*1.8)*.45+Math.sin((x*.7+y)*4.1-t*.27)*.3+Math.sin(y*6.3-x*1.9+t*.1)*.15+Math.sin(x*17+y*11-t*.6)*.1;
v=sm(.12,.95,v*.5+.5)*(wide?.3+.7*sm(.25,.8,i/cols):.5),heat=0;
if(px>=0){var dx=(i*CW-px)/130,dy=(j*CH-py)/130;heat=Math.exp(-(dx*dx+dy*dy));v=Math.max(v,Math.min(1,v+heat*.75))}
if(v<.06)continue;var l=Math.min(LV-1,Math.floor(v*LV));buckets[heat>.3?LV+l:l].push(i,j,v)}}
g.clearRect(0,0,w,h);for(var k=0;k<LV*2;k++){var b=buckets[k];if(!b.length)continue;var hot=k>=LV,l=k%LV;
g.fillStyle=hot?peak:base;g.globalAlpha=hot?.2+l*.07:.06+l*.045;
for(var n=0;n<b.length;n+=3){var ch=RAMP.charAt(Math.max(1,Math.min(RAMP.length-1,Math.round(b[n+2]*(RAMP.length-1)))));g.fillText(ch,b[n]*CW+CW/2,b[n+1]*CH+CH/2)}}g.globalAlpha=1}
addEventListener('resize',function(){size();if(still)frame(performance.now())});
addEventListener('pointermove',function(e){if(e.pointerType==='mouse'){px=e.clientX;py=e.clientY}},{passive:true});
document.documentElement.addEventListener('pointerleave',function(){px=py=-1});
size();requestAnimationFrame(frame)})();`;

// Same tokens as globals.css, cut down to what this page uses.
const css = `:root{--bg:#f5f1e8;--surface:#fffdf8;--line:#e3dbcc;--line-strong:#cfc5b3;--ink:#17131c;--ink-2:#463f4d;--muted:#6a6371;--accent:#ffb23f;--accent-hover:#f5a524;--accent-ink:#1a1206;--accent-strong:#8a4f00;--pos:#11774f;--neg:#c22d46;color-scheme:light}
[data-theme=dark]{--bg:#110e17;--surface:#18141f;--line:#2b2535;--line-strong:#3d3549;--ink:#f4efe6;--ink-2:#c9c1b6;--muted:#968e9e;--accent-hover:#ffc266;--accent-strong:#ffb23f;--pos:#4fd1a0;--neg:#ff6e7f;color-scheme:dark}
html[data-lang=id] .en,html:not([data-lang=id]) .id{display:none}
*{box-sizing:border-box}
html,body{margin:0}
body{min-height:100vh;min-height:100dvh;display:grid;grid-template-rows:auto 1fr auto;background:var(--bg);color:var(--ink);font:16px/1.5 ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit}
#field{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}
.tape,main,footer{position:relative}
:focus-visible{outline:2px solid var(--accent-strong);outline-offset:2px}
.tape{overflow:hidden;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 75%,transparent);font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em;color:var(--muted);-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.tape-track{display:flex;width:max-content;animation:tape 45s linear infinite}
.tape-group{display:flex;gap:3rem;padding:.8rem 1.5rem}
.tick{display:inline-flex;gap:.6rem;white-space:nowrap}
.tick b{font-weight:500;color:var(--ink)}
.tick i{font-style:normal}.up{color:var(--pos)}.down{color:var(--neg)}
@keyframes tape{to{transform:translateX(-50%)}}
main{width:100%;max-width:74rem;margin:0 auto;padding:clamp(3rem,10vh,6rem) 1.5rem 3rem;display:grid;align-items:center;gap:3.5rem}
.word{margin:0;font-size:clamp(3.5rem,13vw,5.5rem);font-weight:600;line-height:1;letter-spacing:-.055em}
.cursor{color:var(--accent-strong);animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.lede{margin:1.75rem 0 0;font-size:1.125rem;line-height:1.65;color:var(--ink-2)}
.lede>span{display:block}
.actions{display:flex;flex-wrap:wrap;gap:.625rem;margin-top:2.25rem}
.btn{display:inline-flex;align-items:center;height:2.75rem;padding:0 1.125rem;border:1px solid var(--line-strong);border-radius:.75rem;background:var(--surface);font-size:.9375rem;font-weight:600;text-decoration:none;transition:border-color .15s}
.btn:hover{border-color:var(--ink-2)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);transition:background-color .15s}
.btn.primary:hover{background:var(--accent-hover)}
.shot{display:none}
footer{width:100%;max-width:74rem;margin:0 auto;padding:1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem 1.5rem;font-size:.8125rem;color:var(--muted)}
footer p{margin:0}
footer a{color:var(--ink-2);text-underline-offset:2px}
.lang{display:inline-flex;border:1px solid var(--line);border-radius:.625rem;padding:2px}
.lang button{border:0;background:none;color:var(--muted);font:inherit;font-weight:600;padding:.3rem .65rem;border-radius:.5rem;cursor:pointer}
.lang button[aria-pressed=true]{background:var(--line);color:var(--ink)}
@media (min-width:900px){main{grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr)}.shot{display:block;margin:0;border:1px solid var(--line);border-radius:1rem;overflow:hidden;box-shadow:0 40px 80px -40px rgb(0 0 0/.45)}.shot img{display:block;width:100%;height:auto}}
@media (prefers-reduced-motion:reduce){.tape-track,.cursor{animation:none}}`;

export function landingHtml(): string {
  const c = LANDING_COPY;
  const tapeGroup = (hidden: boolean) =>
    `<div class="tape-group"${hidden ? ' aria-hidden="true"' : ''}>${TAPE_COINS.map(
      (coin) => `<span class="tick" data-coin="${coin}">${coin} <b>—</b> <i></i></span>`,
    ).join('')}</div>`;
  const abs = (path: string) => `${SITE_URL}${path}`;

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${BRAND.darkBg}">
<meta name="color-scheme" content="dark light">
<script>${headScript}</script>
<title>${esc(SITE_TITLE)}</title>
<meta name="description" content="${esc(SITE_DESCRIPTION)}">
<link rel="canonical" href="${abs(ROUTES.landing)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(SITE_TITLE)}">
<meta property="og:description" content="${esc(SITE_DESCRIPTION)}">
<meta property="og:url" content="${abs(ROUTES.landing)}">
<meta property="og:image" content="${abs('/og.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${CREATOR.handle}">
<meta name="twitter:image" content="${abs('/og.png')}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preconnect" href="https://api.hyperliquid.xyz" crossorigin>
<style>${css}</style>
<script type="application/ld+json">${json(jsonLd)}</script>
</head>
<body>
<canvas id="field" aria-hidden="true"></canvas>
<div class="tape" role="region" aria-label="${esc(c.tape[0])}"><div class="tape-track">${tapeGroup(false)}${tapeGroup(true)}</div></div>
<main>
<div>
<h1 class="word">fmath<span class="cursor" aria-hidden="true">_</span></h1>
<p class="lede">${c.lines.map((l) => `<span>${both(l)}</span>`).join('')}</p>
<nav class="actions">${c.actions
    .map((a) => `<a class="btn${'primary' in a ? ' primary' : ''}" href="${a.href}">${both(a.label)}</a>`)
    .join('')}</nav>
</div>
<figure class="shot"><img src="/landing-shot.jpg" width="1440" height="900" alt="${esc(c.shot[0])}" loading="lazy" decoding="async"></figure>
</main>
<footer>
<p>${both(c.by)} <a href="${CREATOR.url}" rel="noopener">${esc(CREATOR.name)} ${esc(CREATOR.handle)}</a> · ${both(c.schedule)} · <a href="${ROUTES.methodology}">${both(c.math)}</a></p>
<div class="lang" role="group" aria-label="Language"><button type="button" data-set-lang="en" aria-pressed="true">EN</button><button type="button" data-set-lang="id" aria-pressed="false">wkwk</button></div>
</footer>
<script>${bodyScript}${fieldScript}</script>
</body>
</html>
`;
}

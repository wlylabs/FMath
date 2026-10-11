import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { BASE_OPEN_GRAPH, CREATOR, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '../lib/site';
import { BRAND } from '../lib/brand';
import { PwaProvider } from '../components/pwa/PwaProvider';
import { Toaster } from '../components/Toaster';
import { Header } from '../components/Header';
import { Footer } from '../components/Sections';
import { BottomNav } from '../components/BottomNav';
import { NavMarker } from '../components/NavMarker';
import { LangProvider } from '../components/LangProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: CREATOR.name, url: CREATOR.url }],
  creator: CREATOR.name,
  publisher: CREATOR.name,
  category: 'finance',
  keywords: ['fomo', 'fomo app', 'fomo.family', 'fee calculator', 'memecoin', 'Solana', 'perps', 'Hyperliquid', 'break-even'],
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black' },
  // long numbers are amounts, not phone numbers
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  openGraph: { ...BASE_OPEN_GRAPH, title: SITE_TITLE, description: SITE_DESCRIPTION, url: '/' },
  // no title or description here: Next fills them from each page's openGraph
  twitter: {
    card: 'summary_large_image',
    site: CREATOR.handle,
    creator: CREATOR.handle,
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: BRAND.darkBg,
};

// Runs before first paint so the saved or system theme applies without a flash, hides the
// page until a saved Indonesian choice applies (LangProvider), and
// keeps the install prompt if the browser offers it before React has loaded.
const themeScript = `(function(){window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__fmathInstall=e});var t;try{t=localStorage.getItem('fmath:theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${BRAND.darkBg}':'${BRAND.lightBg}');var r=document.documentElement;try{if(localStorage.getItem('fmath:lang')==='id'){r.lang='id';r.classList.add('lang-pending');setTimeout(function(){r.classList.remove('lang-pending')},1500)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior lets Next turn smooth scrolling off for the scroll reset on route changes
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://api.dexscreener.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.hyperliquid.xyz" crossOrigin="" />
      </head>
      <body>
        <PwaProvider>
          <LangProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <BottomNav />
            <Toaster />
          </LangProvider>
          <NavMarker />
        </PwaProvider>
      </body>
    </html>
  );
}

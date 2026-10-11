import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '../lib/site';
import { PwaProvider } from '../components/pwa/PwaProvider';
import { Toaster } from '../components/Toaster';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: 'finance',
  keywords: ['fomo', 'fomo app', 'fomo.family', 'fee calculator', 'memecoin', 'Solana', 'perps', 'Hyperliquid', 'break-even'],
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black' },
  // long numbers are amounts, not phone numbers
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION, images: ['/og.png'] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: '#0b0c0e',
};

// Runs before first paint so the saved or system theme applies without a flash, and
// keeps the install prompt if the browser offers it before React has loaded.
const themeScript = `(function(){window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__fmathInstall=e});var t;try{t=localStorage.getItem('fmath:theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#0b0c0e':'#f6f7f9')})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://api.dexscreener.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.hyperliquid.xyz" crossOrigin="" />
      </head>
      <body>
        <PwaProvider>
          {children}
          <Toaster />
        </PwaProvider>
      </body>
    </html>
  );
}

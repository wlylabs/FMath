import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '../lib/site';
import { BRAND } from '../lib/brand';

export const dynamic = 'force-static';

const ICON = [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }];

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'en',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: BRAND.darkBg,
    theme_color: BRAND.darkBg,
    categories: ['finance', 'utilities'],
    prefer_related_applications: false,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Trade fee', short_name: 'Fee', description: 'fomo fee for one order', url: '/?tab=fee#calculator', icons: ICON },
      { name: 'Profit & target', short_name: 'Profit', description: 'Net profit and break-even', url: '/?tab=profit#calculator', icons: ICON },
      { name: 'Perps', short_name: 'Perps', description: 'Fees, funding and liquidation', url: '/?tab=perps#calculator', icons: ICON },
      { name: 'Get 10% off fomo fees', short_name: '10% off', url: '/#referral', icons: ICON },
    ],
    screenshots: [
      {
        src: '/screenshots/narrow.png',
        sizes: '780x1688',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Trade fee calculator on a phone',
      },
      {
        src: '/screenshots/wide.png',
        sizes: '1440x900',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Trade fee calculator with fee breakdown and chart',
      },
    ],
  };
}

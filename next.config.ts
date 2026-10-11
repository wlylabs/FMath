import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// Everything runs in the browser, so the site exports to static files that any host can serve.
const nextConfig: NextConfig = {
  output: 'export',
  // every page exports as <route>/index.html, which any static host serves without rewrites
  trailingSlash: true,
  images: { unoptimized: true },
};

// The landing page is the route /index.html (src/app/index.html/route.ts), which static hosts
// serve at /. `next dev` does not, so it gets a rewrite; rewrites need the export switched off.
export default function config(phase: string): NextConfig {
  if (phase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;
  return { ...nextConfig, output: undefined, rewrites: async () => [{ source: '/', destination: '/index.html' }] };
}

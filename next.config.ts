import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// Everything runs in the browser, so the site exports to static files that any host can serve.
const nextConfig: NextConfig = {
  output: 'export',
  // every page exports as <route>/index.html, which any static host serves without rewrites
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    // `t` reads the language from module state that LangProvider sets during render, so a
    // worker renders one page at a time: an English page and its /id/ twin never interleave.
    staticGenerationMaxConcurrency: 1,
  },
};

// The landing page is the route /index.html (src/app/index.html/route.ts), which static hosts
// serve at / (and /id/index.html at /id/). `next dev` does not, so it gets rewrites; rewrites
// need the export switched off.
export default function config(phase: string): NextConfig {
  if (phase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;
  return {
    ...nextConfig,
    output: undefined,
    rewrites: async () => [
      { source: '/', destination: '/index.html' },
      { source: '/id/', destination: '/id/index.html' },
    ],
  };
}

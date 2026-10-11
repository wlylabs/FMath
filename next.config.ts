import type { NextConfig } from 'next';

// Everything runs in the browser, so the site exports to static files that any host can serve.
const nextConfig: NextConfig = {
  output: 'export',
  // every page exports as <route>/index.html, which any static host serves without rewrites
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

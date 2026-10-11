import { landingHtml } from '../lib/landing';

// The landing page: plain HTML with no app shell, rendered once at build time.
// The export writes it to out/index, which scripts/build-sw.mjs renames to index.html.
export const dynamic = 'force-static';

export function GET() {
  return new Response(landingHtml(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

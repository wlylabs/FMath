import { landingHtml } from '../../lib/landing';

// The landing page at /: plain HTML with no app shell, rendered once at build time.
// The folder is named index.html so the export writes out/index.html, which every static
// host serves at / as text/html. A route at app/route.ts exports as an extensionless
// out/index, which Vercel sent as a download.
export const dynamic = 'force-static';

export function GET() {
  return new Response(landingHtml(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

import { landingHtml } from '../../../lib/landing';

// The Indonesian landing page at /id/, exported as out/id/index.html (see app/index.html/route.ts).
export const dynamic = 'force-static';

export function GET() {
  return new Response(landingHtml('id'), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

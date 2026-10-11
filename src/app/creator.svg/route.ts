import { CREATOR } from '../../lib/site';
import { identiconFor, identiconSvg } from '../../lib/identicon';

// The creator's identicon as a file, for structured data and anyone who wants to link it.
export const dynamic = 'force-static';

export function GET() {
  return new Response(identiconSvg(identiconFor(CREATOR.handle).icon), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
}

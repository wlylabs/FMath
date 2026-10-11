import { describe, expect, it } from 'vitest';
import { landingHtml, LANDING_COPY, TAPE_COINS } from './landing';
import { ROUTES } from './routes';

describe('landing page', () => {
  const html = landingHtml();

  it('ships no external scripts or stylesheets', () => {
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/);
    expect(html).not.toContain('/_next/');
  });

  it('links into the app', () => {
    expect(html).toContain(`href="${ROUTES.home}"`);
    for (const coin of TAPE_COINS) expect(html).toContain(`data-coin="${coin}"`);
  });

  it('renders one language per page, with hreflang to the other', () => {
    const idHtml = landingHtml('id');
    for (const [en, id] of LANDING_COPY.lines) {
      expect(html).toContain(en);
      expect(html).not.toContain(id);
      expect(idHtml).toContain(id);
      expect(idHtml).not.toContain(en);
    }
    expect(html).toContain('<html lang="en"');
    expect(idHtml).toContain('<html lang="id"');
    expect(idHtml).toContain(`href="/id${ROUTES.home}"`);
    expect(idHtml).toMatch(/rel="canonical" href="[^"]*\/id\/"/);
    for (const page of [html, idHtml]) {
      expect(page).toMatch(/hreflang="en" href="[^"]*\/"/);
      expect(page).toMatch(/hreflang="id" href="[^"]*\/id\/"/);
      expect(page).toContain('hreflang="x-default"');
    }
  });

  it('keeps the inline JSON from closing its script tag', () => {
    expect(html.match(/<\/script>/g)).toHaveLength(3);
  });
});

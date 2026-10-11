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

  it('carries both languages and links into the app', () => {
    for (const [en, id] of LANDING_COPY.lines) {
      expect(html).toContain(en);
      expect(html).toContain(id);
    }
    expect(html).toContain(`href="${ROUTES.home}"`);
    for (const coin of TAPE_COINS) expect(html).toContain(`data-coin="${coin}"`);
  });

  it('keeps the inline JSON from closing its script tag', () => {
    expect(html.match(/<\/script>/g)).toHaveLength(3);
  });
});

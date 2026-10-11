import { describe, expect, it } from 'vitest';
import { adjacentCalculator, langOfPath, localize, ROUTES, samePage, unlocalize } from './routes';

describe('localized routes', () => {
  it('prefixes Indonesian paths and strips the prefix back', () => {
    expect(localize(ROUTES.fee, 'id')).toBe('/id/fee/');
    expect(localize(ROUTES.landing, 'id')).toBe('/id/');
    expect(localize('/id/fee/', 'en')).toBe('/fee/');
    expect(localize('/id/fee/', 'id')).toBe('/id/fee/');
    expect(localize(`${ROUTES.methodology}#sources`, 'id')).toBe('/id/methodology/#sources');
    expect(localize('https://example.com/fee/', 'id')).toBe('https://example.com/fee/');
    expect(unlocalize('/id')).toBe('/');
    expect(unlocalize('/idea/')).toBe('/idea/');
  });

  it('reads the language from the path', () => {
    expect(langOfPath('/id/')).toBe('id');
    expect(langOfPath('/id/perps')).toBe('id');
    expect(langOfPath('/idea/')).toBe('en');
    expect(langOfPath('/fee/')).toBe('en');
  });

  it('treats a page and its translation as the same page', () => {
    expect(samePage('/id/fee', ROUTES.fee)).toBe(true);
    expect(samePage('/id/', ROUTES.landing)).toBe(true);
    expect(samePage('/id/fee/', ROUTES.profit)).toBe(false);
  });

  it('swipes to the neighbouring calculator in the same language', () => {
    expect(adjacentCalculator('/id/fee/', 1)).toBe('/id/profit/');
    expect(adjacentCalculator('/profit/', -1)).toBe('/fee/');
  });
});

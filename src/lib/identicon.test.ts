import { describe, expect, it } from 'vitest';
import { identicon, identiconFor, identiconSvg } from './identicon';
import { sha256Text } from './sha256';

// Pinned on purpose: changing the palette, byte map or grid changes the creator's published avatar.
const WILLY =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect width="56" height="56" fill="#9a5a00"/>' +
  '<circle cx="28" cy="28" r="25.5" fill="#f5f1e8"/>' +
  '<path fill="#2c2636" d="M8 16h16v8h-16zM32 16h16v8h-16zM8 24h8v8h-8zM40 24h8v8h-8zM24 32h8v8h-8z"/>' +
  '<path fill="#ffb23f" d="M16 24h8v8h-8zM32 24h8v8h-8zM24 40h8v8h-8z"/></svg>';

describe('identicon', () => {
  it('draws the pinned avatar for @willydetrade', () => {
    const { icon, hex } = identiconFor('@willydetrade');
    expect(hex).toBe('d6093fc4f103013718262b2e7217e2265376642e39684fa84a064b6f230737b7');
    expect(identiconSvg(icon)).toBe(WILLY);
  });

  it('is deterministic and stays inside the allowed markup for 1000 handles', () => {
    const outputs = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const handle = `@handle${i}`;
      const svg = identiconSvg(identicon(sha256Text(handle)));
      expect(identiconSvg(identicon(sha256Text(handle)))).toBe(svg);
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">')).toBe(true);
      const tags = [...svg.matchAll(/<(\w+)/g)].map((m) => m[1]);
      expect(tags.every((tag) => ['svg', 'rect', 'circle', 'path'].includes(tag!))).toBe(true);
      expect(svg).not.toMatch(/\bid=|width="\d+" height="\d+" viewBox|clip|mask|defs|Gradient|filter|<text/);
      expect(svg.length).toBeLessThan(700);
      outputs.add(svg);
    }
    // the visual space is small by design, but handles should rarely collide
    expect(outputs.size).toBeGreaterThan(990);
  });

  it('keeps every lit cell inside the face circle', () => {
    for (let i = 0; i < 300; i++) {
      const icon = identicon(sha256Text(`@edge${i}`));
      for (const { d } of icon.paths) {
        for (const [, x, y] of d.matchAll(/M(\d+) (\d+)/g)) {
          // each run starts at a cell's top-left corner; check the four corners of its first cell
          for (const [cx, cy] of [[+x!, +y!], [+x! + 8, +y!], [+x!, +y! + 8], [+x! + 8, +y! + 8]]) {
            expect(Math.hypot(cx! - icon.center, cy! - icon.center)).toBeLessThan(icon.faceRadius);
          }
        }
      }
    }
  });

  it('rejects anything that is not a 32-byte digest', () => {
    expect(() => identicon(new Uint8Array(16))).toThrow(TypeError);
    expect(() => identicon(new Uint8Array(33))).toThrow(TypeError);
  });
});

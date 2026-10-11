/**
 * Hash-based identicon ("blockies" style), the way crypto wallets draw an
 * address: the SHA-256 digest of a handle decides the colours and a 5x5
 * horizontally mirrored pixel pattern on a coin (rim plus face).
 *
 * The geometry sits on a 56-unit grid with 8-unit cells, so at the sizes the
 * site renders it (28px and 56px) every cell lands on whole pixels at 1x and 2x.
 * Integer maths only (no trig), so every JS engine draws the same picture.
 *
 * Byte map
 *   b[0]      face family (violet-ink, paper, marigold)
 *   b[1]      ink and spot colour pair within the family
 *   b[2]      how many source cells light up (6-8 of 13) and how many take the spot colour (1-2)
 *   b[3..15]  one rank byte per source cell; the lowest ranks light up
 */

import { sha256Text, toHex } from './sha256';

export const IDENTICON_SIZE = 56;
const GRID = 5;
const CELL = 8;
const ORIGIN = 8;
const CENTER = IDENTICON_SIZE / 2;
/** Face radius; the band from here to the edge is the coin rim. */
const FACE_RADIUS = 25.5;

interface Family {
  face: string;
  /** Rim colour, or null to use the ink colour. */
  rim: string | null;
  pairs: readonly (readonly [ink: string, spot: string])[];
}

// Every colour is a brand token or a direct blend of two.
const FAMILIES: readonly Family[] = [
  {
    face: '#221d2b', // violet ink (between #18141f and #2c2636)
    rim: null,
    pairs: [
      ['#ffb23f', '#f4efe6'],
      ['#f4efe6', '#ffb23f'],
      ['#c2831a', '#fffdf8'],
    ],
  },
  {
    face: '#f5f1e8', // warm paper; the amber bezel keeps the coin edge visible on dark surfaces
    rim: '#9a5a00',
    pairs: [
      ['#2c2636', '#ffb23f'],
      ['#3d3549', '#c2831a'],
      ['#8a4f00', '#2c2636'],
    ],
  },
  {
    face: '#ffb23f', // marigold
    rim: null,
    pairs: [
      ['#1a1206', '#fffdf8'],
      ['#2c2636', '#fffdf8'],
      ['#1a1206', '#8a4f00'],
    ],
  },
];

// Columns 0-2 (2 is the mirror axis) of every row, minus the two outer
// corners, which would crowd the rim.
const SOURCE: readonly (readonly [row: number, col: number])[] = (() => {
  const cells: [number, number][] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col <= 2; col++) {
      if (col === 0 && (row === 0 || row === GRID - 1)) continue;
      cells.push([row, col]);
    }
  }
  return cells;
})();

export interface Identicon {
  size: number;
  rim: string;
  face: string;
  center: number;
  faceRadius: number;
  /** One path per colour; horizontal runs of cells are merged so no seams show. */
  paths: { fill: string; d: string }[];
}

function runs(grid: number[][], value: number): string {
  let d = '';
  for (let row = 0; row < GRID; row++) {
    let col = 0;
    while (col < GRID) {
      if (grid[row]![col] !== value) {
        col++;
        continue;
      }
      let end = col;
      while (end + 1 < GRID && grid[row]![end + 1] === value) end++;
      const width = (end - col + 1) * CELL;
      d += `M${ORIGIN + col * CELL} ${ORIGIN + row * CELL}h${width}v${CELL}h${-width}z`;
      col = end + 1;
    }
  }
  return d;
}

export function identicon(digest: Uint8Array): Identicon {
  if (digest.length !== 32) throw new TypeError('identicon expects a 32-byte SHA-256 digest');
  const family = FAMILIES[digest[0]! % FAMILIES.length]!;
  const [ink, spot] = family.pairs[digest[1]! % family.pairs.length]!;
  const lit = 6 + (digest[2]! % 3);
  const spots = 1 + ((digest[2]! >> 2) & 1);

  // rank cells by their byte, index breaks ties; the top of the lit set takes the spot colour
  const order = SOURCE.map((cell, i) => ({ rank: digest[3 + i]!, i, cell })).sort((a, b) => a.rank - b.rank || a.i - b.i);
  const grid = Array.from({ length: GRID }, () => new Array<number>(GRID).fill(0));
  order.slice(0, lit).forEach(({ cell: [row, col] }, n) => {
    const value = n >= lit - spots ? 2 : 1;
    grid[row]![col] = value;
    grid[row]![GRID - 1 - col] = value;
  });

  return {
    size: IDENTICON_SIZE,
    rim: family.rim ?? ink,
    face: family.face,
    center: CENTER,
    faceRadius: FACE_RADIUS,
    paths: [
      { fill: ink, d: runs(grid, 1) },
      { fill: spot, d: runs(grid, 2) },
    ].filter((p) => p.d),
  };
}

export function identiconSvg(icon: Identicon): string {
  const s = icon.size;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">` +
    `<rect width="${s}" height="${s}" fill="${icon.rim}"/>` +
    `<circle cx="${icon.center}" cy="${icon.center}" r="${icon.faceRadius}" fill="${icon.face}"/>` +
    icon.paths.map((p) => `<path fill="${p.fill}" d="${p.d}"/>`).join('') +
    `</svg>`
  );
}

/** Identicon and digest for a handle such as "@willydetrade". */
export function identiconFor(handle: string): { icon: Identicon; hex: string } {
  const digest = sha256Text(handle);
  return { icon: identicon(digest), hex: toHex(digest) };
}

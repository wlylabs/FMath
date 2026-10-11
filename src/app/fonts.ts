import localFont from 'next/font/local';

/*
 * Geist and Geist Mono from the geist package, cut down to Latin plus the few
 * symbols the copy uses (about 65 KB for both instead of 141 KB). All OpenType
 * features stay, including the ss01 the body text turns on. Characters
 * outside the subset fall back to the system font, as they did before. To
 * rebuild after a geist update or new symbols in the copy (pip install fonttools brotli):
 *
 *   U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2248,U+FEFF,U+FFFD"
 *   pyftsubset node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2 --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=src/app/fonts/GeistSans-Latin.woff2
 *   pyftsubset node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2 --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=src/app/fonts/GeistMono-Latin.woff2
 */
export const GeistSans = localFont({
  src: './fonts/GeistSans-Latin.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const GeistMono = localFont({
  src: './fonts/GeistMono-Latin.woff2',
  variable: '--font-geist-mono',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Roboto Mono', 'Menlo', 'Monaco', 'Liberation Mono', 'DejaVu Sans Mono', 'Courier New', 'monospace'],
  weight: '100 900',
});

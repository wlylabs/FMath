// Writes out/.well-known/assetlinks.json after `next build`, which lets the Android
// app (a Trusted Web Activity, see docs/android-twa.md) open the site full screen
// without a browser bar. The signing-key fingerprints come from the environment so
// no placeholder is ever published; without them the file is skipped.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = join('out', '.well-known');
const PACKAGE = process.env.TWA_PACKAGE_NAME ?? 'com.willydetrade.fmath';
const FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

const fingerprints = (process.env.TWA_SHA256_CERT_FINGERPRINTS ?? '')
  .split(/[\s,]+/)
  .filter(Boolean)
  .map((f) => f.toUpperCase());

if (fingerprints.length === 0) {
  console.log('assetlinks: TWA_SHA256_CERT_FINGERPRINTS is not set, skipping .well-known/assetlinks.json');
} else {
  const bad = fingerprints.filter((f) => !FINGERPRINT.test(f));
  if (bad.length) {
    console.error(`assetlinks: not a SHA-256 fingerprint (AB:CD:... 32 bytes): ${bad.join(', ')}`);
    process.exit(1);
  }
  const statements = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: PACKAGE, sha256_cert_fingerprints: fingerprints },
    },
  ];
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, 'assetlinks.json'), JSON.stringify(statements, null, 2) + '\n');
  console.log(`assetlinks: wrote ${fingerprints.length} fingerprint(s) for ${PACKAGE}`);
}

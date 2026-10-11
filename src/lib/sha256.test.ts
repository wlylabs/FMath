import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { sha256, sha256Text, toHex } from './sha256';

const node = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

describe('sha256', () => {
  it('matches the FIPS 180-4 test vectors', () => {
    expect(toHex(sha256Text(''))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(toHex(sha256Text('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(toHex(sha256Text('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
  });

  it('matches node:crypto across every padding boundary', () => {
    // 55/56/63/64/65 bytes are where padding spills into an extra block
    for (let len = 0; len <= 200; len++) {
      const bytes = Uint8Array.from({ length: len }, (_, i) => (i * 31 + len) & 0xff);
      expect(toHex(sha256(bytes)), `length ${len}`).toBe(node(bytes));
    }
  });

  it('hashes UTF-8 text the same way node does', () => {
    for (const s of ['@willydetrade', 'fomo 𝕏', 'ÿ€漢字', 'a'.repeat(1000)]) {
      expect(toHex(sha256Text(s))).toBe(createHash('sha256').update(s, 'utf8').digest('hex'));
    }
  });
});

/**
 * Red-team test: shipped client source must never contain banned promotional or
 * advice-like copy (Shaun's rules: no "on sale", no "buy the dip", no price targets,
 * no buy/sell signals, no guaranteed-return claims).
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../client');
const BANNED: RegExp[] = [
  /on sale/i,
  /buy the dip/i,
  /price target/i,
  /price prediction/i,
  /\btarget24h\b|\btarget7d\b/i,
  /['"`>]\s*(BUY|SELL|STRONG BUY)\s*['"`<]/,
  /trading signal/i,
  /guaranteed (return|profit)/i,
  /to the moon/i,
  /\bwill (go up|rise|moon)\b/i,
];

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : files(p);
    return /\.(tsx?|html|json)$/.test(e.name) ? [p] : [];
  });
}

describe('banned copy', () => {
  const all = files(ROOT);
  it('scans a non-trivial number of client files', () => expect(all.length).toBeGreaterThan(20));
  for (const re of BANNED) {
    it(`no client file matches ${re}`, () => {
      const hits = all.filter((f) => re.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(ROOT, f));
      expect(hits).toEqual([]);
    });
  }
});

import { describe, it, expect } from 'vitest';
import { friendlyError, amountFromSearch, parseUsd, nextRefreshMs } from '../../client/src/lib/compareHelpers';

describe('comparison helpers', () => {
  it('never shows raw HTTP codes', () => {
    for (const s of [429, 500, 502, 503, 504]) expect(friendlyError(s)).not.toMatch(/HTTP|\d{3}/);
  });
  it('passes through validation messages', () => {
    expect(friendlyError(400, 'amount must be a number between 1 and 1,000,000')).toMatch(/amount must/);
  });
  it('reads a valid ?amount= and rejects junk', () => {
    expect(amountFromSearch('?amount=250')).toBe(250);
    expect(amountFromSearch('?amount=$1,000')).toBe(1000);
    expect(amountFromSearch('?amount=0')).toBeNull();
    expect(amountFromSearch('?amount=5000000')).toBeNull();
    expect(amountFromSearch('?amount=abc')).toBeNull();
    expect(amountFromSearch('')).toBeNull();
  });
});

describe('strict USD parsing (red-team P9)', () => {
  it('accepts normal inputs', () => {
    expect(parseUsd('250')).toBe(250);
    expect(parseUsd('$1,000')).toBe(1000);
    expect(parseUsd('99.5')).toBe(99.5);
    expect(parseUsd('1e3')).toBe(1000);
  });
  it('rejects junk instead of stripping it', () => {
    expect(parseUsd('1e12')).toBeNull();          // was parsed as 112
    expect(parseUsd('<script>1</script>')).toBeNull(); // was parsed as 1
    expect(parseUsd('12abc')).toBeNull();
    expect(parseUsd('-5')).toBeNull();
    expect(parseUsd('')).toBeNull();
  });
});

describe('refresh timing', () => {
  it('refreshes before the oldest quote expires', () => {
    const now = 1_000_000;
    expect(nextRefreshMs([], now)).toBe(30_000);
    expect(nextRefreshMs([now], now)).toBe(30_000);            // fresh quote: normal 30 s
    expect(nextRefreshMs([now - 30_000], now)).toBe(10_000);   // server-cached 30 s old: refresh at 40 s
    expect(nextRefreshMs([now - 44_000], now)).toBe(3_000);    // nearly expired: soon, but not a hot loop
  });
});

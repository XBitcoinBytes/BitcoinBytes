import { describe, it, expect } from 'vitest';
import { friendlyError, amountFromSearch } from '../../client/src/lib/compareHelpers';

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

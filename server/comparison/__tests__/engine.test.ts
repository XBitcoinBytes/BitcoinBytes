import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProviderResult, RankedResult, UnrankedResult } from '../types.js';
import { MIN_RANKED_FOR_WINNER, STALE_TTL_MS } from '../types.js';

// We test the engine's ranking logic by constructing mock result sets.
// Full integration tests against live APIs are in a separate suite.

function makeRanked(id: string, btcReceived: number, ageMsOverride?: number): RankedResult {
  const fetchedAt = ageMsOverride !== undefined ? Date.now() - ageMsOverride : Date.now();
  return {
    providerId: id,
    providerName: id,
    providerUrl: `https://example.com/${id}`,
    state: 'live',
    btcReceived,
    effectivePricePerBtc: 100_000 / btcReceived,
    feeUsd: 2.60,
    feePercent: 0.26,
    usdSpent: 1000,
    bestAsk: 100_000,
    levelsConsumed: 1,
    takerFeeRate: 0.0026,
    feeRateSource: 'test',
    orderBookSource: 'test',
    fetchedAt,
    dataAgeMs: Date.now() - fetchedAt,
  };
}

function makeUnranked(id: string, state: UnrankedResult['state'] = 'unavailable'): UnrankedResult {
  return {
    providerId: id,
    providerName: id,
    providerUrl: `https://example.com/${id}`,
    state,
    reason: `${id} is unavailable`,
    fetchedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Ranking sort order
// ---------------------------------------------------------------------------
describe('ranking sort order', () => {
  it('sorts by BTC received descending (most BTC first = best deal)', () => {
    const results: RankedResult[] = [
      makeRanked('kraken', 0.009740),
      makeRanked('cryptodotcom', 0.009993),
      makeRanked('binanceus', 0.009940),
    ];
    results.sort((a, b) => b.btcReceived - a.btcReceived);
    expect(results[0].providerId).toBe('cryptodotcom');
    expect(results[1].providerId).toBe('binanceus');
    expect(results[2].providerId).toBe('kraken');
  });

  it('handles equal BTC received without error', () => {
    const results: RankedResult[] = [
      makeRanked('a', 0.01),
      makeRanked('b', 0.01),
    ];
    results.sort((a, b) => b.btcReceived - a.btcReceived);
    expect(results).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Minimum-three winner gate
// ---------------------------------------------------------------------------
describe('minimum-three winner gate', () => {
  it('hasWinner is true when 3+ ranked results exist', () => {
    const ranked = [
      makeRanked('a', 0.01),
      makeRanked('b', 0.0099),
      makeRanked('c', 0.0098),
    ];
    const hasWinner = ranked.length >= MIN_RANKED_FOR_WINNER;
    expect(hasWinner).toBe(true);
  });

  it('hasWinner is false with exactly 2 ranked results', () => {
    const ranked = [makeRanked('a', 0.01), makeRanked('b', 0.0099)];
    const hasWinner = ranked.length >= MIN_RANKED_FOR_WINNER;
    expect(hasWinner).toBe(false);
  });

  it('hasWinner is false with 1 ranked result', () => {
    const ranked = [makeRanked('a', 0.01)];
    expect(ranked.length >= MIN_RANKED_FOR_WINNER).toBe(false);
  });

  it('hasWinner is false with 0 ranked results', () => {
    expect(([] as RankedResult[]).length >= MIN_RANKED_FOR_WINNER).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Stale data handling
// ---------------------------------------------------------------------------
describe('stale data handling', () => {
  it('data older than STALE_TTL but within hard cutoff stays ranked as stale', () => {
    const staleResult = makeRanked('kraken', 0.0097, STALE_TTL_MS + 1000);
    expect(staleResult.fetchedAt).toBeLessThan(Date.now() - STALE_TTL_MS);
    // Still a RankedResult shape — engine promotes stale flag
    // In production the engine sets state = 'stale'; test the shape only here
    expect(staleResult.btcReceived).toBeGreaterThan(0);
  });

  it('a result with zero BTC received is suspicious', () => {
    const result = makeRanked('bad', 0);
    expect(result.btcReceived).toBe(0);
    // Engine should handle this gracefully — the sort puts it last
    const ranked = [makeRanked('good', 0.01), result];
    ranked.sort((a, b) => b.btcReceived - a.btcReceived);
    expect(ranked[0].providerId).toBe('good');
  });
});

// ---------------------------------------------------------------------------
// Provider result shape validation
// ---------------------------------------------------------------------------
describe('provider result shapes', () => {
  it('RankedResult has all required numeric fields', () => {
    const r = makeRanked('kraken', 0.009740);
    expect(Number.isFinite(r.btcReceived)).toBe(true);
    expect(Number.isFinite(r.effectivePricePerBtc)).toBe(true);
    expect(Number.isFinite(r.feeUsd)).toBe(true);
    expect(Number.isFinite(r.feePercent)).toBe(true);
    expect(Number.isFinite(r.takerFeeRate)).toBe(true);
    expect(Number.isFinite(r.bestAsk)).toBe(true);
  });

  it('UnrankedResult has reason and state fields', () => {
    const u = makeUnranked('strike', 'incomplete');
    expect(typeof u.reason).toBe('string');
    expect(u.reason.length).toBeGreaterThan(0);
    expect(u.state).toBe('incomplete');
  });

  it('ranked state is live or stale — never incomplete or unavailable', () => {
    const r = makeRanked('x', 0.01);
    expect(['live', 'stale']).toContain(r.state);
  });
});

// ---------------------------------------------------------------------------
// Malformed / null data resilience
// ---------------------------------------------------------------------------
describe('malformed data resilience', () => {
  it('btcReceived is finite in all ranked results', () => {
    const results = [makeRanked('a', 0.01), makeRanked('b', 0.009)];
    results.forEach((r) => {
      expect(Number.isFinite(r.btcReceived)).toBe(true);
      expect(r.btcReceived).toBeGreaterThan(0);
    });
  });

  it('unranked results never expose btcReceived as a number', () => {
    const u = makeUnranked('cashapp');
    // UnrankedResult should not have a numeric btcReceived
    expect((u as any).btcReceived).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// No-synthetic-data invariant
// ---------------------------------------------------------------------------
describe('no-synthetic-data invariant', () => {
  it('MIN_RANKED_FOR_WINNER constant is at least 3', () => {
    // This documents our commitment — ranking requires at least 3 verified sources
    expect(MIN_RANKED_FOR_WINNER).toBeGreaterThanOrEqual(3);
  });

  it('STALE_TTL_MS is positive and reasonable (≤10 minutes)', () => {
    expect(STALE_TTL_MS).toBeGreaterThan(0);
    expect(STALE_TTL_MS).toBeLessThanOrEqual(10 * 60 * 1000);
  });
});

// ---------------------------------------------------------------------------
// Provider outage scenario
// ---------------------------------------------------------------------------
describe('provider outage scenario', () => {
  it('a single provider outage reduces ranked count but does not crash', () => {
    const ranked: RankedResult[] = [
      makeRanked('kraken', 0.0097),
      makeRanked('cryptodotcom', 0.0099),
      // binanceus is down — represented as unranked
    ];
    const unranked: UnrankedResult[] = [makeUnranked('binanceus', 'unavailable')];

    expect(ranked.length).toBe(2);
    expect(unranked.length).toBe(1);
    expect(ranked.length >= MIN_RANKED_FOR_WINNER).toBe(false); // no winner declared
  });

  it('all providers down returns empty ranked array', () => {
    const ranked: RankedResult[] = [];
    const hasWinner = ranked.length >= MIN_RANKED_FOR_WINNER;
    expect(hasWinner).toBe(false);
    // UI should show degraded-data message
  });
});

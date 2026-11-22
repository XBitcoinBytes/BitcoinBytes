import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  PUBLISHED_FEES, FEES_CHECKED_ON, FEE_STALE_AFTER_DAYS,
  feesAreStale, feeAgeDays, formatCheckedOn, formatFeePercent, feeSourceCitation,
} from '../../../shared/feeSchedule.js';

// Mock every adapter so the engine test is deterministic and offline.
const { ranked, unranked } = vi.hoisted(() => {
function ranked(id: string, btc: number) {
  return {
    providerId: id, providerName: id, providerUrl: `https://example.com/${id}`, state: 'live' as const,
    btcReceived: btc, effectivePricePerBtc: 100 / btc, feeUsd: 0, feePercent: 0, usdSpent: 100,
    bestAsk: 1, levelsConsumed: 1, takerFeeRate: 0, feeRateSource: 't', orderBookSource: 't',
    fetchedAt: Date.now(), dataAgeMs: 0,
  };
}
const unranked = (id: string) => ({ providerId: id, getQuote: async () => ({
  providerId: id, providerName: id, providerUrl: '', state: 'unavailable', reason: 'n/a', fetchedAt: Date.now() }) });
  return { ranked, unranked };
});
vi.mock('../providers/kraken.js', () => ({ krakenAdapter: { providerId: 'kraken', getQuote: async () => ranked('kraken', 0.00167922) } }));
vi.mock('../providers/binanceus.js', () => ({ binanceUsAdapter: { providerId: 'binanceus', getQuote: async () => ranked('binanceus', 0.00169184) } }));
vi.mock('../providers/cryptodotcom.js', () => ({ cryptoDotComAdapter: { providerId: 'cryptodotcom', getQuote: async () => ranked('cryptodotcom', 0.00168403) } }));
vi.mock('../providers/coinbaseadvanced.js', () => ({ coinbaseAdvancedAdapter: { providerId: 'coinbaseadvanced', getQuote: async () => ranked('coinbaseadvanced', 0.00167100) } }));
vi.mock('../providers/coinbase.js', () => ({ coinbaseAdapter: unranked('coinbase') }));
vi.mock('../providers/strike.js', () => ({ strikeAdapter: unranked('strike') }));
vi.mock('../providers/river.js', () => ({ riverAdapter: unranked('river') }));
vi.mock('../providers/cashapp.js', () => ({ cashAppAdapter: unranked('cashapp') }));
vi.mock('../providers/robinhood.js', () => ({ robinhoodAdapter: unranked('robinhood') }));
vi.mock('../providers/swan.js', () => ({ swanAdapter: unranked('swan') }));

import { runComparison } from '../engine.js';

afterEach(() => vi.useRealTimers());

describe('published fee schedule', () => {
  it('matches the official entry-tier taker rates checked on 2026-11-22', () => {
    expect(FEES_CHECKED_ON).toBe('2026-11-22');
    expect(PUBLISHED_FEES.binanceus.takerRate).toBe(0.0002);   // binance.us/fees
    expect(PUBLISHED_FEES.kraken.takerRate).toBe(0.008);       // kraken.com/pro/fees Tier 1
    expect(PUBLISHED_FEES.cryptodotcom.takerRate).toBe(0.005); // Exchange US Level 1
    expect(PUBLISHED_FEES.coinbaseadvanced.takerRate).toBe(0.009); // Coinbase Advanced US entry tier
  });

  it('every fee has an https official source URL and a citation with the checked date', () => {
    for (const f of Object.values(PUBLISHED_FEES)) {
      expect(f.sourceUrl).toMatch(/^https:\/\//);
      expect(feeSourceCitation(f)).toContain('Nov 22, 2026');
    }
  });

  it('formats rates and dates for display', () => {
    expect(formatFeePercent(0.0002)).toBe('0.02%');
    expect(formatFeePercent(0.008)).toBe('0.80%');
    expect(formatCheckedOn('2026-11-22')).toBe('Nov 22, 2026');
  });

  it('is fresh on the check date and stale after the threshold', () => {
    const day = 86_400_000;
    const checked = Date.parse(`${FEES_CHECKED_ON}T00:00:00Z`);
    expect(feeAgeDays(checked + 5 * day)).toBe(5);
    expect(feesAreStale(checked + FEE_STALE_AFTER_DAYS * day)).toBe(false);
    expect(feesAreStale(checked + (FEE_STALE_AFTER_DAYS + 1) * day)).toBe(true);
  });
});

describe('engine fee-staleness guard', () => {
  it('declares the most-BTC exchange the winner while fees are fresh', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-23T12:00:00Z'));
    const r = await runComparison(100);
    expect(r.feesStale).toBe(false);
    expect(r.feesCheckedOn).toBe(FEES_CHECKED_ON);
    expect(r.hasWinner).toBe(true);
    expect(r.ranked[0].providerId).toBe('binanceus');
    expect(r.ranked.map((x) => x.providerId)).toEqual(['binanceus', 'cryptodotcom', 'kraken', 'coinbaseadvanced']);
  });

  it('withholds the winner badge once fees are older than the threshold', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2027-01-15T12:00:00Z'));
    const r = await runComparison(100);
    expect(r.feesStale).toBe(true);
    expect(r.hasWinner).toBe(false);
    expect(r.ranked.length).toBe(4); // results still shown for reference
  });
});

describe('Strike fee note', () => {
  it('no longer claims 0% fees on standard purchases and cites the official page', async () => {
    const { STRIKE_FEE_NOTE } = await import('../../../shared/feeSchedule.js');
    expect(STRIKE_FEE_NOTE.summary).not.toMatch(/0% fee/i);
    expect(STRIKE_FEE_NOTE.summary).toContain('0.89%');
    expect(STRIKE_FEE_NOTE.sourceUrl).toBe('https://strike.me/support/what-are-the-trading-fees/');
  });
});

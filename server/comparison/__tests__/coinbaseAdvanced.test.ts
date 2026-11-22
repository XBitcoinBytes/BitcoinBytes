import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseCoinbaseAdvancedBook, walkOrderBook, applyTakerFee } from '../orderbook.js';
import { PUBLISHED_FEES } from '../../../shared/feeSchedule.js';
import { coinbaseAdvancedAdapter } from '../providers/coinbaseadvanced.js';

const book = {
  pricebook: {
    product_id: 'BTC-USD',
    bids: [{ price: '59999.00', size: '1' }],
    // deliberately out of order + one junk row: parser must sort and filter
    asks: [
      { price: '60010.00', size: '1' },
      { price: '60000.00', size: '0.001' },
      { price: 'oops', size: '1' },
      { price: '60005.00', size: '0' },
    ],
    time: '2026-11-22T08:36:36Z',
  },
};

afterEach(() => vi.unstubAllGlobals());

describe('parseCoinbaseAdvancedBook', () => {
  it('parses {price,size} asks, drops invalid rows and sorts lowest first', () => {
    const levels = parseCoinbaseAdvancedBook(book);
    expect(levels).toEqual([
      { price: 60000, quantity: 0.001 },
      { price: 60010, quantity: 1 },
    ]);
  });

  it('throws on a missing asks array', () => {
    expect(() => parseCoinbaseAdvancedBook({ pricebook: {} })).toThrow('missing asks array');
    expect(() => parseCoinbaseAdvancedBook(null)).toThrow('missing asks array');
  });
});

describe('Coinbase Advanced pricing', () => {
  it('applies the published 0.90% US entry taker fee on top of the order-book walk', () => {
    const walk = walkOrderBook(parseCoinbaseAdvancedBook(book), 100);
    const r = applyTakerFee(walk, 100, PUBLISHED_FEES.coinbaseadvanced.takerRate);
    expect(r.feeUsd).toBeCloseTo(0.9, 6);
    expect(r.feePercent).toBeCloseTo(0.9, 6);
    // $60 fills at 60,000, the remaining $39.10 (after fee) or similar at 60,010: always below the fee-free amount
    expect(r.btcReceived).toBeLessThan(walk.btcPreFee);
    expect(r.btcReceived).toBeGreaterThan(0.00164);
  });

  it('adapter returns a ranked result with fee, sources and the Advanced trading link', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(book), { status: 200 })));
    const r: any = await coinbaseAdvancedAdapter.getQuote(100, 2000);
    expect(r.providerId).toBe('coinbaseadvanced');
    expect(r.state).toBe('live');
    expect(r.takerFeeRate).toBe(0.009);
    expect(r.feeRateSourceUrl).toBe(PUBLISHED_FEES.coinbaseadvanced.sourceUrl);
    expect(r.providerUrl).toBe('https://www.coinbase.com/advanced-trade/spot/BTC-USD');
    expect(r.providerUrl).not.toMatch(/[?&](ref|referral|affiliate|utm_)/i);
  });
});

describe('Visit-site links point at the order-book products we price', async () => {
  const { krakenAdapter } = await import('../providers/kraken.js');
  const { binanceUsAdapter } = await import('../providers/binanceus.js');
  const { cryptoDotComAdapter } = await import('../providers/cryptodotcom.js');
  it.each([
    [krakenAdapter.purchaseUrl, 'https://pro.kraken.com/app/trade/btc-usd'],
    [binanceUsAdapter.purchaseUrl, 'https://www.binance.us/spot-trade/btc_usd'],
    [cryptoDotComAdapter.purchaseUrl, 'https://crypto.com/exchange-pro/en-US/trade/BTC_USD'],
    [coinbaseAdvancedAdapter.purchaseUrl, 'https://www.coinbase.com/advanced-trade/spot/BTC-USD'],
  ])('%s', (actual, expected) => {
    expect(actual).toBe(expected);
    expect(actual).not.toMatch(/buy-crypto|buy-sell-crypto|[?&](ref|referral|affiliate|utm_)/i);
  });
});

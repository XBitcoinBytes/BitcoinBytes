import { describe, it, expect } from 'vitest';
import {
  walkOrderBook,
  applyTakerFee,
  parseKrakenBook,
  parseBinanceUsBook,
  parseCryptoDotComBook,
  type OrderBookLevel,
} from '../orderbook.js';

// ---------------------------------------------------------------------------
// walkOrderBook
// ---------------------------------------------------------------------------
describe('walkOrderBook', () => {
  const simpleAsks: OrderBookLevel[] = [
    { price: 100_000, quantity: 0.5 },  // $50,000 available
    { price: 100_100, quantity: 0.5 },  // $50,050 available
    { price: 100_200, quantity: 1.0 },  // $100,200 available
  ];

  it('fills a small order from a single level', () => {
    const result = walkOrderBook(simpleAsks, 10_000);
    expect(result.fullyFilled).toBe(true);
    expect(result.levelsConsumed).toBe(1);
    expect(result.btcPreFee).toBeCloseTo(10_000 / 100_000, 8);
    expect(result.usdConsumed).toBeCloseTo(10_000, 2);
    expect(result.weightedAvgPrice).toBeCloseTo(100_000, 2);
  });

  it('spans multiple levels for larger orders', () => {
    // $70,000 order: consumes all of level 1 ($50k) and part of level 2
    const result = walkOrderBook(simpleAsks, 70_000);
    expect(result.fullyFilled).toBe(true);
    expect(result.levelsConsumed).toBe(2);
    expect(result.btcPreFee).toBeGreaterThan(0.69);
    expect(result.btcPreFee).toBeLessThan(0.70);
  });

  it('returns fullyFilled=false when book depth is insufficient', () => {
    // Max available = $50k + $50.05k + $100.2k ≈ $200.25k
    const result = walkOrderBook(simpleAsks, 500_000);
    expect(result.fullyFilled).toBe(false);
    expect(result.usdConsumed).toBeLessThan(500_000);
  });

  it('weighted average price is between best and worst ask', () => {
    const result = walkOrderBook(simpleAsks, 70_000);
    expect(result.weightedAvgPrice).toBeGreaterThanOrEqual(100_000);
    expect(result.weightedAvgPrice).toBeLessThanOrEqual(100_100);
  });

  it('throws on empty ask array', () => {
    expect(() => walkOrderBook([], 1000)).toThrow('empty or invalid');
  });

  it('throws on non-positive USD amount', () => {
    expect(() => walkOrderBook(simpleAsks, 0)).toThrow('Invalid USD amount');
    expect(() => walkOrderBook(simpleAsks, -1)).toThrow('Invalid USD amount');
  });

  it('skips levels with invalid price or quantity', () => {
    const asksWithBad: OrderBookLevel[] = [
      { price: NaN, quantity: 1 },
      { price: 100_000, quantity: 0 },
      { price: 100_000, quantity: 0.1 },
    ];
    const result = walkOrderBook(asksWithBad, 1_000);
    expect(result.fullyFilled).toBe(true);
    expect(result.levelsConsumed).toBe(1);
  });

  it('correctly fills exactly to the dollar', () => {
    const asks: OrderBookLevel[] = [{ price: 100_000, quantity: 1 }];
    const result = walkOrderBook(asks, 100_000);
    expect(result.fullyFilled).toBe(true);
    expect(result.btcPreFee).toBeCloseTo(1, 8);
    expect(result.usdConsumed).toBeCloseTo(100_000, 2);
  });
});

// ---------------------------------------------------------------------------
// applyTakerFee
// ---------------------------------------------------------------------------
describe('applyTakerFee', () => {
  const mockWalk = {
    btcPreFee: 0.01,
    usdConsumed: 1000,
    weightedAvgPrice: 100_000,
    levelsConsumed: 1,
    fullyFilled: true,
  };

  it('correctly computes fee and BTC received for Kraken 0.26%', () => {
    const result = applyTakerFee(mockWalk, 1000, 0.0026);
    expect(result.feeUsd).toBeCloseTo(2.60, 4);
    expect(result.feePercent).toBeCloseTo(0.26, 4);
    expect(result.btcReceived).toBeCloseTo(0.01 - 2.60 / 100_000, 8);
    expect(result.btcReceived).toBeLessThan(mockWalk.btcPreFee);
  });

  it('correctly computes fee for Crypto.com 0.075%', () => {
    const result = applyTakerFee(mockWalk, 1000, 0.00075);
    expect(result.feeUsd).toBeCloseTo(0.75, 4);
    expect(result.feePercent).toBeCloseTo(0.075, 4);
  });

  it('correctly computes fee for Binance.US 0.6%', () => {
    const result = applyTakerFee(mockWalk, 1000, 0.006);
    expect(result.feeUsd).toBeCloseTo(6.00, 4);
    expect(result.feePercent).toBeCloseTo(0.6, 4);
  });

  it('effective price is higher than weighted avg (fee increases cost)', () => {
    const result = applyTakerFee(mockWalk, 1000, 0.0026);
    expect(result.effectivePricePerBtc).toBeGreaterThan(mockWalk.weightedAvgPrice);
  });

  it('btcReceived is never negative', () => {
    const result = applyTakerFee(mockWalk, 1000, 0.99);
    expect(result.btcReceived).toBeGreaterThanOrEqual(0);
  });

  it('throws on invalid fee rate', () => {
    expect(() => applyTakerFee(mockWalk, 1000, -0.01)).toThrow('Invalid taker fee rate');
    expect(() => applyTakerFee(mockWalk, 1000, 1.5)).toThrow('Invalid taker fee rate');
    expect(() => applyTakerFee(mockWalk, 1000, NaN)).toThrow('Invalid taker fee rate');
  });

  it('higher fee rate means less BTC received', () => {
    const low = applyTakerFee(mockWalk, 1000, 0.001);
    const high = applyTakerFee(mockWalk, 1000, 0.01);
    expect(high.btcReceived).toBeLessThan(low.btcReceived);
    expect(high.feeUsd).toBeGreaterThan(low.feeUsd);
  });
});

// ---------------------------------------------------------------------------
// parseKrakenBook
// ---------------------------------------------------------------------------
describe('parseKrakenBook', () => {
  const validRaw = {
    error: [],
    result: {
      XXBTZUSD: {
        asks: [['95000.00', '0.5', 1234567890], ['95100.00', '1.0', 1234567890]],
        bids: [['94900.00', '0.5', 1234567890]],
      },
    },
  };

  it('parses valid Kraken response', () => {
    const levels = parseKrakenBook(validRaw);
    expect(levels).toHaveLength(2);
    expect(levels[0].price).toBeCloseTo(95000, 2);
    expect(levels[0].quantity).toBeCloseTo(0.5, 4);
  });

  it('throws when result field is missing', () => {
    expect(() => parseKrakenBook({ error: [] })).toThrow('missing result field');
  });

  it('throws when asks array is missing', () => {
    expect(() => parseKrakenBook({ result: { XXBTZUSD: {} } })).toThrow('missing asks array');
  });

  it('filters out levels with zero quantity', () => {
    const raw = {
      error: [],
      result: {
        XXBTZUSD: {
          asks: [['95000', '0', 0], ['95100', '1.5', 0]],
        },
      },
    };
    const levels = parseKrakenBook(raw);
    expect(levels).toHaveLength(1);
    expect(levels[0].price).toBe(95100);
  });

  it('handles null input gracefully', () => {
    expect(() => parseKrakenBook(null)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// parseBinanceUsBook
// ---------------------------------------------------------------------------
describe('parseBinanceUsBook', () => {
  const validRaw = {
    lastUpdateId: 12345,
    bids: [['94900', '0.5']],
    asks: [['95000', '1.0'], ['95100', '0.8']],
  };

  it('parses valid Binance.US response', () => {
    const levels = parseBinanceUsBook(validRaw);
    expect(levels).toHaveLength(2);
    expect(levels[0].price).toBe(95000);
    expect(levels[0].quantity).toBe(1.0);
  });

  it('throws when asks array is missing', () => {
    expect(() => parseBinanceUsBook({ bids: [] })).toThrow('missing asks array');
  });

  it('filters out non-finite values', () => {
    const raw = {
      asks: [['abc', '1.0'], ['95000', '0.5']],
    };
    const levels = parseBinanceUsBook(raw);
    expect(levels).toHaveLength(1);
    expect(levels[0].price).toBe(95000);
  });
});

// ---------------------------------------------------------------------------
// parseCryptoDotComBook
// ---------------------------------------------------------------------------
describe('parseCryptoDotComBook', () => {
  const validRaw = {
    result: {
      data: [
        {
          asks: [['95000', '0.3', 1], ['95050', '0.7', 2]],
          bids: [['94950', '0.4', 1]],
        },
      ],
    },
  };

  it('parses valid Crypto.com response', () => {
    const levels = parseCryptoDotComBook(validRaw);
    expect(levels).toHaveLength(2);
    expect(levels[0].price).toBe(95000);
    expect(levels[0].quantity).toBe(0.3);
  });

  it('throws when asks array is missing', () => {
    expect(() => parseCryptoDotComBook({ result: { data: [{}] } })).toThrow('missing asks array');
  });

  it('handles data as object instead of array', () => {
    const raw = {
      result: {
        data: {
          asks: [['95000', '1.0', 1]],
        },
      },
    };
    const levels = parseCryptoDotComBook(raw);
    expect(levels).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// No synthetic data invariant
// ---------------------------------------------------------------------------
describe('no synthetic data invariant', () => {
  it('walkOrderBook never invents levels — output BTC is deterministic from input', () => {
    const asks: OrderBookLevel[] = [{ price: 100_000, quantity: 0.01 }];
    const r1 = walkOrderBook(asks, 500);
    const r2 = walkOrderBook(asks, 500);
    expect(r1.btcPreFee).toBe(r2.btcPreFee);
    expect(r1.usdConsumed).toBe(r2.usdConsumed);
  });

  it('applyTakerFee is deterministic — no randomness', () => {
    const walk = { btcPreFee: 0.01, usdConsumed: 1000, weightedAvgPrice: 100_000, levelsConsumed: 1, fullyFilled: true };
    const r1 = applyTakerFee(walk, 1000, 0.0026);
    const r2 = applyTakerFee(walk, 1000, 0.0026);
    expect(r1.btcReceived).toBe(r2.btcReceived);
    expect(r1.feeUsd).toBe(r2.feeUsd);
  });
});

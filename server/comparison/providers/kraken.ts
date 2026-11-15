/**
 * Kraken Provider Adapter
 *
 * Order book: https://api.kraken.com/0/public/Depth?pair=XBTUSD&count=50
 * Taker fee:  0.26% entry-tier (first 50k USD 30-day volume)
 * Fee source: https://www.kraken.com/en-us/features/fee-schedule
 *             Verified: published public schedule, no authentication required.
 *
 * Geographic: Available to most US states; some state-level restrictions apply.
 * Note: Results are estimated all-in costs, not guaranteed executable quotes.
 */

import type { ProviderAdapter, ProviderResult, RankedResult, UnrankedResult } from '../types.js';
import { PROVIDER_TIMEOUT_MS, STALE_TTL_MS } from '../types.js';
import { walkOrderBook, applyTakerFee, parseKrakenBook } from '../orderbook.js';

const ORDER_BOOK_URL = 'https://api.kraken.com/0/public/Depth?pair=XBTUSD&count=50';
const TAKER_FEE_RATE = 0.0026; // 0.26% – entry tier
const FEE_RATE_SOURCE = 'Kraken fee schedule (kraken.com/en-us/features/fee-schedule), entry tier ≤$50k/30d volume';
const ORDER_BOOK_SOURCE = 'Kraken public REST API v0 /Depth endpoint';
const PURCHASE_URL = 'https://www.kraken.com/buy-crypto';

interface CacheEntry {
  raw: unknown;
  fetchedAt: number;
}
let cache: CacheEntry | null = null;

async function fetchOrderBook(timeoutMs: number): Promise<{ raw: unknown; fetchedAt: number; fromCache: boolean }> {
  const now = Date.now();

  // Return cache if still fresh
  if (cache && now - cache.fetchedAt < STALE_TTL_MS) {
    return { raw: cache.raw, fetchedAt: cache.fetchedAt, fromCache: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(ORDER_BOOK_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BitcoinBytes/1.0 (comparison-tool; contact@xbitcoinbytes.com)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    if ((raw as any).error?.length) throw new Error(`Kraken API error: ${JSON.stringify((raw as any).error)}`);
    cache = { raw, fetchedAt: Date.now() };
    return { raw, fetchedAt: cache.fetchedAt, fromCache: false };
  } finally {
    clearTimeout(timer);
  }
}

export const krakenAdapter: ProviderAdapter = {
  id: 'kraken',
  name: 'Kraken',
  purchaseUrl: PURCHASE_URL,

  async getQuote(usdAmount: number, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<ProviderResult> {
    const fetchedAt = Date.now();
    try {
      const { raw, fetchedAt: bookFetchedAt, fromCache } = await fetchOrderBook(timeoutMs);
      const asks = parseKrakenBook(raw);
      if (asks.length === 0) throw new Error('Kraken: order book returned no valid ask levels');

      const walk = walkOrderBook(asks, usdAmount);
      if (!walk.fullyFilled) {
        const unranked: UnrankedResult = {
          providerId: 'kraken',
          providerName: 'Kraken',
          providerUrl: PURCHASE_URL,
          state: 'incomplete',
          reason: `Order book depth insufficient to fill $${usdAmount.toLocaleString()} USD at this time`,
          fetchedAt,
        };
        return unranked;
      }

      const { btcReceived, feeUsd, feePercent, effectivePricePerBtc } = applyTakerFee(walk, usdAmount, TAKER_FEE_RATE);
      const dataAgeMs = Date.now() - bookFetchedAt;
      const state = fromCache && dataAgeMs > STALE_TTL_MS ? 'stale' : 'live';

      const ranked: RankedResult = {
        providerId: 'kraken',
        providerName: 'Kraken',
        providerUrl: PURCHASE_URL,
        state,
        btcReceived,
        effectivePricePerBtc,
        feeUsd,
        feePercent,
        usdSpent: usdAmount,
        bestAsk: asks[0].price,
        levelsConsumed: walk.levelsConsumed,
        takerFeeRate: TAKER_FEE_RATE,
        feeRateSource: FEE_RATE_SOURCE,
        orderBookSource: ORDER_BOOK_SOURCE,
        fetchedAt: bookFetchedAt,
        dataAgeMs,
      };
      return ranked;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const unranked: UnrankedResult = {
        providerId: 'kraken',
        providerName: 'Kraken',
        providerUrl: PURCHASE_URL,
        state: 'unavailable',
        reason: `Kraken data unavailable: ${message}`,
        fetchedAt,
      };
      return unranked;
    }
  },
};

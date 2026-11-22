/**
 * Binance.US Provider Adapter
 *
 * Order book: https://api.binance.us/api/v3/depth?symbol=BTCUSD&limit=50
 * Taker fee + source: shared/feeSchedule.ts (PUBLISHED_FEES.binanceus, dated FEES_CHECKED_ON)
 *
 * WARNING: Binance.US has faced significant regulatory pressure (SEC action
 * 2023). USD deposit/withdrawal rails were suspended and partially restored.
 * State-level availability is not universal. This adapter includes a
 * health-check on each request and degrades gracefully if unreachable.
 *
 * NOTE: This is Binance.US (api.binance.us), NOT global Binance (api.binance.com).
 * They are separate entities with different regulatory status and fee schedules.
 * Do not substitute global Binance data for Binance.US.
 */

import type { ProviderAdapter, ProviderResult, RankedResult, UnrankedResult } from '../types.js';
import { PROVIDER_TIMEOUT_MS, STALE_TTL_MS, ORDERBOOK_CACHE_MS } from '../types.js';
import { PUBLISHED_FEES, feeSourceCitation } from '../../../shared/feeSchedule.js';
import { walkOrderBook, applyTakerFee, parseBinanceUsBook } from '../orderbook.js';

const ORDER_BOOK_URL = 'https://api.binance.us/api/v3/depth?symbol=BTCUSD&limit=50';
const TAKER_FEE_RATE = PUBLISHED_FEES.binanceus.takerRate; // see shared/feeSchedule.ts
const FEE_RATE_SOURCE = feeSourceCitation(PUBLISHED_FEES.binanceus);
const ORDER_BOOK_SOURCE = 'Binance.US public REST API v3 /depth endpoint';
// Order-book trading page for the market we price (not the instant-buy flow, which is priced differently)
const PURCHASE_URL = 'https://www.binance.us/spot-trade/btc_usd';

interface CacheEntry {
  raw: unknown;
  fetchedAt: number;
}
let cache: CacheEntry | null = null;

async function fetchOrderBook(timeoutMs: number): Promise<{ raw: unknown; fetchedAt: number; fromCache: boolean }> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < ORDERBOOK_CACHE_MS) {
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
    cache = { raw, fetchedAt: Date.now() };
    return { raw, fetchedAt: cache.fetchedAt, fromCache: false };
  } catch (err) {
    // Upstream hiccup: serve the last good book while it is still inside the 45 s hard cutoff.
    if (cache && Date.now() - cache.fetchedAt < STALE_TTL_MS) {
      return { raw: cache.raw, fetchedAt: cache.fetchedAt, fromCache: true };
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const binanceUsAdapter: ProviderAdapter = {
  id: 'binanceus',
  name: 'Binance.US',
  purchaseUrl: PURCHASE_URL,

  async getQuote(usdAmount: number, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<ProviderResult> {
    const fetchedAt = Date.now();
    try {
      const { raw, fetchedAt: bookFetchedAt, fromCache } = await fetchOrderBook(timeoutMs);
      const asks = parseBinanceUsBook(raw);
      if (asks.length === 0) throw new Error('Binance.US: order book returned no valid ask levels');

      const walk = walkOrderBook(asks, usdAmount);
      if (!walk.fullyFilled) {
        const unranked: UnrankedResult = {
          providerId: 'binanceus',
          providerName: 'Binance.US',
          providerUrl: PURCHASE_URL,
          state: 'incomplete',
          reason: `Order book depth insufficient to fill $${usdAmount.toLocaleString()} USD`,
          fetchedAt,
        };
        return unranked;
      }

      const { btcReceived, feeUsd, feePercent, effectivePricePerBtc } = applyTakerFee(walk, usdAmount, TAKER_FEE_RATE);
      const dataAgeMs = Date.now() - bookFetchedAt;
      const state = fromCache && dataAgeMs > STALE_TTL_MS ? 'stale' : 'live';

      const ranked: RankedResult = {
        providerId: 'binanceus',
        providerName: 'Binance.US',
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
        feeRateSourceUrl: PUBLISHED_FEES.binanceus.sourceUrl,
        orderBookSource: ORDER_BOOK_SOURCE,
        fetchedAt: bookFetchedAt,
        dataAgeMs,
      };
      return ranked;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const unranked: UnrankedResult = {
        providerId: 'binanceus',
        providerName: 'Binance.US',
        providerUrl: PURCHASE_URL,
        state: 'unavailable',
        reason: `Binance.US data unavailable: ${message}`,
        fetchedAt,
      };
      return unranked;
    }
  },
};

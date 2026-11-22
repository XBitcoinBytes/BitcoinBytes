/**
 * Coinbase Advanced Provider Adapter
 *
 * Order book: https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD&limit=200
 *             (Coinbase Advanced Trade public market-data endpoint, no authentication)
 * Taker fee + source: shared/feeSchedule.ts (PUBLISHED_FEES.coinbaseadvanced, dated FEES_CHECKED_ON)
 *
 * This prices Coinbase ADVANCED (order book + taker fee). Coinbase's simple "Buy" flow is
 * priced differently and stays an unranked row (providers/coinbase.ts).
 */

import type { ProviderAdapter, ProviderResult, RankedResult, UnrankedResult } from '../types.js';
import { PROVIDER_TIMEOUT_MS, STALE_TTL_MS, ORDERBOOK_CACHE_MS } from '../types.js';
import { PUBLISHED_FEES, feeSourceCitation } from '../../../shared/feeSchedule.js';
import { walkOrderBook, applyTakerFee, parseCoinbaseAdvancedBook } from '../orderbook.js';

const ORDER_BOOK_URL = 'https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD&limit=200';
const TAKER_FEE_RATE = PUBLISHED_FEES.coinbaseadvanced.takerRate; // see shared/feeSchedule.ts
const FEE_RATE_SOURCE = feeSourceCitation(PUBLISHED_FEES.coinbaseadvanced);
const ORDER_BOOK_SOURCE = 'Coinbase Advanced Trade public API /market/product_book endpoint';
// Order-book trading page for the market we price (not the instant-buy flow, which is priced differently)
const PURCHASE_URL = 'https://www.coinbase.com/advanced-trade/spot/BTC-USD';

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

export const coinbaseAdvancedAdapter: ProviderAdapter = {
  id: 'coinbaseadvanced',
  name: 'Coinbase Advanced',
  purchaseUrl: PURCHASE_URL,

  async getQuote(usdAmount: number, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<ProviderResult> {
    const fetchedAt = Date.now();
    try {
      const { raw, fetchedAt: bookFetchedAt, fromCache } = await fetchOrderBook(timeoutMs);
      const asks = parseCoinbaseAdvancedBook(raw);
      if (asks.length === 0) throw new Error('Coinbase Advanced: order book returned no valid ask levels');

      const walk = walkOrderBook(asks, usdAmount);
      if (!walk.fullyFilled) {
        const unranked: UnrankedResult = {
          providerId: 'coinbaseadvanced',
          providerName: 'Coinbase Advanced',
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
        providerId: 'coinbaseadvanced',
        providerName: 'Coinbase Advanced',
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
        feeRateSourceUrl: PUBLISHED_FEES.coinbaseadvanced.sourceUrl,
        orderBookSource: ORDER_BOOK_SOURCE,
        fetchedAt: bookFetchedAt,
        dataAgeMs,
      };
      return ranked;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const unranked: UnrankedResult = {
        providerId: 'coinbaseadvanced',
        providerName: 'Coinbase Advanced',
        providerUrl: PURCHASE_URL,
        state: 'unavailable',
        reason: `Coinbase Advanced data unavailable: ${message}`,
        fetchedAt,
      };
      return unranked;
    }
  },
};

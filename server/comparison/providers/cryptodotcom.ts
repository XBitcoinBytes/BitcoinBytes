/**
 * Crypto.com Exchange Provider Adapter
 *
 * Order book: https://api.crypto.com/exchange/v1/public/get-book?instrument_name=BTC_USD&depth=50
 * Taker fee + source: shared/feeSchedule.ts (PUBLISHED_FEES.cryptodotcom, dated FEES_CHECKED_ON)
 *
 * IMPORTANT LABEL: This reflects Crypto.com *Exchange* pricing, NOT the
 * Crypto.com App. The Exchange and App are separate products with different
 * fee structures and pricing. A US retail user purchasing via the Crypto.com
 * App will see different (typically higher) all-in costs. This adapter must
 * always be displayed as "Crypto.com Exchange" in the UI.
 *
 * Geographic: Crypto.com Exchange availability varies by US state.
 */

import type { ProviderAdapter, ProviderResult, RankedResult, UnrankedResult } from '../types.js';
import { PROVIDER_TIMEOUT_MS, STALE_TTL_MS, ORDERBOOK_CACHE_MS } from '../types.js';
import { PUBLISHED_FEES, feeSourceCitation } from '../../../shared/feeSchedule.js';
import { walkOrderBook, applyTakerFee, parseCryptoDotComBook } from '../orderbook.js';

const ORDER_BOOK_URL =
  'https://api.crypto.com/exchange/v1/public/get-book?instrument_name=BTC_USD&depth=50';
const TAKER_FEE_RATE = PUBLISHED_FEES.cryptodotcom.takerRate; // see shared/feeSchedule.ts
const FEE_RATE_SOURCE =
  feeSourceCitation(PUBLISHED_FEES.cryptodotcom);
const ORDER_BOOK_SOURCE = 'Crypto.com Exchange public REST API v1 /get-book endpoint';
const PURCHASE_URL = 'https://crypto.com/exchange/trade/spot/BTC_USD';

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
    // Crypto.com returns code 0 on success
    if ((raw as any)?.code !== 0 && (raw as any)?.code !== undefined) {
      throw new Error(`Crypto.com API error code: ${(raw as any)?.code}`);
    }
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

export const cryptoDotComAdapter: ProviderAdapter = {
  id: 'cryptodotcom',
  name: 'Crypto.com Exchange',
  purchaseUrl: PURCHASE_URL,

  async getQuote(usdAmount: number, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<ProviderResult> {
    const fetchedAt = Date.now();
    try {
      const { raw, fetchedAt: bookFetchedAt, fromCache } = await fetchOrderBook(timeoutMs);
      const asks = parseCryptoDotComBook(raw);
      if (asks.length === 0) throw new Error('Crypto.com: order book returned no valid ask levels');

      const walk = walkOrderBook(asks, usdAmount);
      if (!walk.fullyFilled) {
        const unranked: UnrankedResult = {
          providerId: 'cryptodotcom',
          providerName: 'Crypto.com Exchange',
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
        providerId: 'cryptodotcom',
        providerName: 'Crypto.com Exchange',
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
        feeRateSourceUrl: PUBLISHED_FEES.cryptodotcom.sourceUrl,
        orderBookSource: ORDER_BOOK_SOURCE,
        fetchedAt: bookFetchedAt,
        dataAgeMs,
      };
      return ranked;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const unranked: UnrankedResult = {
        providerId: 'cryptodotcom',
        providerName: 'Crypto.com Exchange',
        providerUrl: PURCHASE_URL,
        state: 'unavailable',
        reason: `Crypto.com Exchange data unavailable: ${message}`,
        fetchedAt,
      };
      return unranked;
    }
  },
};

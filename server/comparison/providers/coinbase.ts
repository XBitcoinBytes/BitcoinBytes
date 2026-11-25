/**
 * Coinbase Informational Provider
 *
 * Coinbase does NOT expose a public unauthenticated amount-specific purchase
 * quote. The /v2/prices/BTC-USD/buy endpoint returns an indicative buy-side
 * price for 1 BTC with no quantity parameter and no fee breakdown.
 *
 * Retail fees on Coinbase Simple Buy vary by payment method, location, order
 * size, and market conditions – Coinbase states this explicitly and provides
 * no public formula. The only genuine quote endpoint (POST /orders/preview)
 * requires Advanced Trade authentication.
 *
 * This adapter is UNRANKED. It shows Coinbase's indicative ask as a reference
 * and explains what data is missing. It never fabricates a fee or total.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';
import { PROVIDER_TIMEOUT_MS, STALE_TTL_MS, ORDERBOOK_CACHE_MS } from '../types.js';
import { unrankedFeeNote } from '../../../shared/feeSchedule.js';

const PRICE_URL = 'https://api.coinbase.com/v2/prices/BTC-USD/buy';
const PURCHASE_URL = 'https://www.coinbase.com/buy-bitcoin';

interface CacheEntry {
  price: number;
  fetchedAt: number;
}
let cache: CacheEntry | null = null;

export const coinbaseAdapter: ProviderAdapter = {
  id: 'coinbase',
  name: 'Coinbase (simple buy)',
  purchaseUrl: PURCHASE_URL,

  async getQuote(usdAmount: number, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<ProviderResult> {
    const fetchedAt = Date.now();
    const now = Date.now();
    const note = unrankedFeeNote('coinbase', now);

    try {
      let indicativeAsk: number | undefined;

      if (cache && now - cache.fetchedAt < ORDERBOOK_CACHE_MS) {
        indicativeAsk = cache.price;
      } else {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(PRICE_URL, {
            signal: controller.signal,
            headers: { 'User-Agent': 'BitcoinBytes/1.0 (comparison-tool; contact@xbitcoinbytes.com)' },
          });
          if (res.ok) {
            const json = await res.json();
            const parsed = parseFloat(json?.data?.amount);
            if (Number.isFinite(parsed) && parsed > 0) {
              indicativeAsk = parsed;
              cache = { price: parsed, fetchedAt: Date.now() };
            }
          }
        } finally {
          clearTimeout(timer);
        }
      }

      const unranked: UnrankedResult = {
        providerId: 'coinbase',
        providerName: 'Coinbase (simple buy)',
        providerUrl: PURCHASE_URL,
        state: 'incomplete',
        reason:
          'Coinbase retail fees vary by payment method, location, and order size. ' +
          'A guaranteed quote requires account authentication. Cannot rank without verified fee. ' +
          'Coinbase Advanced (order book + published taker fee) is ranked separately.',
        partialData: {
          indicativeAsk,
          publishedFeeNote: note.text,
          feeUrl: note.sourceUrl,
        },
        fetchedAt,
      };
      return unranked;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const unranked: UnrankedResult = {
        providerId: 'coinbase',
        providerName: 'Coinbase (simple buy)',
        providerUrl: PURCHASE_URL,
        state: 'unavailable',
        reason: `Coinbase indicative price unavailable: ${message}`,
        partialData: {
          publishedFeeNote: note.text,
          feeUrl: note.sourceUrl,
        },
        fetchedAt,
      };
      return unranked;
    }
  },
};

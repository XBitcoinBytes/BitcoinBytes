/**
 * BitcoinBytes Comparison Engine
 *
 * Orchestrates all provider adapters in parallel, separates ranked from
 * unranked results, sorts by BTC received descending, and applies the
 * minimum-three-ranked gate before declaring a winner.
 *
 * Rules enforced here:
 *  - Only live or stale results with all required fields may be ranked
 *  - Stale results are included in ranking but flagged; excluded if > STALE_HARD_CUTOFF
 *  - Fewer than MIN_RANKED_FOR_WINNER ranked results → hasWinner = false
 *  - No synthetic or fabricated values are injected at any point
 */

import {
  type ProviderAdapter,
  type ComparisonResponse,
  type RankedResult,
  type UnrankedResult,
  type ProviderResult,
  isRanked,
  MIN_RANKED_FOR_WINNER,
  PROVIDER_TIMEOUT_MS,
  ENGINE_VERSION,
  STANDARD_DISCLAIMER,
  STALE_TTL_MS,
} from './types.js';

import { krakenAdapter } from './providers/kraken.js';
import { binanceUsAdapter } from './providers/binanceus.js';
import { cryptoDotComAdapter } from './providers/cryptodotcom.js';
import { coinbaseAdapter } from './providers/coinbase.js';
import { strikeAdapter } from './providers/strike.js';
import { riverAdapter } from './providers/river.js';
import { cashAppAdapter } from './providers/cashapp.js';
import { robinhoodAdapter } from './providers/robinhood.js';
import { swanAdapter } from './providers/swan.js';

/** Hard cutoff: stale data older than this is excluded from ranking entirely */
const STALE_HARD_CUTOFF_MS = STALE_TTL_MS; // Never rank expired quotes

/** Ordered list of all adapters – ranked-capable first, then informational */
const ADAPTERS: ProviderAdapter[] = [
  krakenAdapter,
  cryptoDotComAdapter,
  binanceUsAdapter,
  coinbaseAdapter,
  strikeAdapter,
  riverAdapter,
  cashAppAdapter,
  robinhoodAdapter,
  swanAdapter,
];

async function safeGetQuote(
  adapter: ProviderAdapter,
  usdAmount: number,
): Promise<ProviderResult> {
  try {
    return await Promise.race([
      adapter.getQuote(usdAmount, PROVIDER_TIMEOUT_MS),
      new Promise<ProviderResult>((resolve) =>
        setTimeout(
          () =>
            resolve({
              providerId: adapter.id,
              providerName: adapter.name,
              providerUrl: adapter.purchaseUrl,
              state: 'unavailable',
              reason: `Request timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`,
              fetchedAt: Date.now(),
            } satisfies UnrankedResult),
          PROVIDER_TIMEOUT_MS + 500,
        ),
      ),
    ]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      providerId: adapter.id,
      providerName: adapter.name,
      providerUrl: adapter.purchaseUrl,
      state: 'error',
      reason: `Unexpected adapter error: ${message}`,
      fetchedAt: Date.now(),
    } satisfies UnrankedResult;
  }
}

export async function runComparison(usdAmount: number): Promise<ComparisonResponse> {
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
    throw new Error(`Invalid USD amount: ${usdAmount}`);
  }

  // Run all adapters concurrently
  const results = await Promise.all(
    ADAPTERS.map((adapter) => safeGetQuote(adapter, usdAmount)),
  );

  const ranked: RankedResult[] = [];
  const unranked: UnrankedResult[] = [];
  const now = Date.now();

  for (const result of results) {
    if (isRanked(result)) {
      const age = now - result.fetchedAt;
      if (age > STALE_HARD_CUTOFF_MS) {
        // Demote to unranked – data is too old
        unranked.push({
          providerId: result.providerId,
          providerName: result.providerName,
          providerUrl: result.providerUrl,
          state: 'unavailable',
          reason: `Data is ${Math.round(age / 60000)} min old – excluded from ranking to preserve accuracy`,
          fetchedAt: result.fetchedAt,
        });
      } else {
        ranked.push(result);
      }
    } else {
      unranked.push(result as UnrankedResult);
    }
  }

  // Sort ranked by BTC received descending (most BTC = best deal)
  ranked.sort((a, b) => b.btcReceived - a.btcReceived);

  const hasWinner = ranked.length >= MIN_RANKED_FOR_WINNER;
  const hasStaleData = ranked.some((r) => r.state === 'stale');

  return {
    usdAmount,
    ranked,
    unranked,
    hasWinner,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    hasStaleData,
    disclaimer: STANDARD_DISCLAIMER,
  };
}

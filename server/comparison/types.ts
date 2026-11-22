/**
 * Provider Adapter Contract for BitcoinBytes Comparison Engine
 *
 * All provider adapters must implement ProviderAdapter. Results are
 * typed by DataState so the UI can accurately represent freshness,
 * availability, and completeness without fabricating values.
 */

export type DataState =
  | 'live'         // fresh data fetched within this request cycle
  | 'stale'        // previously fetched data retained past its TTL
  | 'unavailable'  // provider unreachable or returned an error
  | 'incomplete'   // provider reachable but cannot supply all required fields
  | 'error';       // unexpected error during adapter execution

/** A single ranked result – requires both price and fee to be known */
export interface RankedResult {
  providerId: string;
  providerName: string;
  providerUrl: string;
  state: 'live' | 'stale';
  /** BTC amount the user would receive after fees */
  btcReceived: number;
  /** Effective all-in USD/BTC rate (includes spread + fee) */
  effectivePricePerBtc: number;
  /** Total fee paid in USD */
  feeUsd: number;
  /** Fee as a percentage of the USD input */
  feePercent: number;
  /** USD notional consumed walking the ask side of the order book */
  usdSpent: number;
  /** Raw best-ask price from the order book at time of fetch */
  bestAsk: number;
  /** Number of order-book levels consumed to fill the order */
  levelsConsumed: number;
  /** Taker fee rate applied (decimal, e.g. 0.0026 for 0.26%) */
  takerFeeRate: number;
  /** Human-readable source citation for the fee rate */
  feeRateSource: string;
  /** Human-readable source citation for the order book */
  orderBookSource: string;
  /** Unix ms timestamp of when order book was fetched */
  fetchedAt: number;
  /** Age of data in ms at time of response */
  dataAgeMs: number;
}

/** An unranked informational row – shown when fee or price is unavailable */
export interface UnrankedResult {
  providerId: string;
  providerName: string;
  providerUrl: string;
  state: 'unavailable' | 'incomplete' | 'error';
  /** Why this provider cannot be ranked */
  reason: string;
  /** What data IS available (e.g. indicative price) */
  partialData?: {
    indicativeAsk?: number;
    publishedFeeNote?: string;
    feeUrl?: string;
  };
  fetchedAt: number;
}

export type ProviderResult = RankedResult | UnrankedResult;

export function isRanked(r: ProviderResult): r is RankedResult {
  return r.state === 'live' || r.state === 'stale';
}

/** Contract every provider adapter must satisfy */
export interface ProviderAdapter {
  /** Stable lowercase identifier */
  readonly id: string;
  /** Display name */
  readonly name: string;
  /** Primary URL for the provider's Bitcoin purchase page */
  readonly purchaseUrl: string;
  /**
   * Fetch a quote for the given USD amount.
   * Must not throw – return an UnrankedResult on any failure.
   * Must complete within timeoutMs or return unavailable.
   */
  getQuote(usdAmount: number, timeoutMs?: number): Promise<ProviderResult>;
}

/** Comparison engine response */
export interface ComparisonResponse {
  usdAmount: number;
  /** Ranked by btcReceived descending – only live/stale complete results */
  ranked: RankedResult[];
  /** Providers that could not supply a complete ranked result */
  unranked: UnrankedResult[];
  /** True when ranked.length >= MIN_RANKED_FOR_WINNER */
  hasWinner: boolean;
  /** ISO timestamp of this response */
  generatedAt: string;
  /** Engine version for cache busting */
  engineVersion: string;
  /** True if any ranked results are stale */
  hasStaleData: boolean;
  /** Disclaimer shown to users */
  disclaimer: string;
}

export const MIN_RANKED_FOR_WINNER = 3;
export const STALE_TTL_MS = 45_000;          // Cache public order books for at most 45 seconds
export const PROVIDER_TIMEOUT_MS = 8_000;    // 8 s per provider request
export const ENGINE_VERSION = '1.0.0';

export const STANDARD_DISCLAIMER =
  'Estimates based on live order-book depth and published entry-tier taker fees. ' +
  'Results are not guaranteed retail checkout quotes. Actual amounts may differ due to ' +
  'order routing, payment method, account tier, promotions, and market movement between ' +
  'estimate and execution. Assumes USD already funded via the platform\'s free/default ' +
  'method. Withdrawal and network fees excluded. Standard US retail customer assumed.';

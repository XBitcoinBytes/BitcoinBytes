/**
 * Single source of truth for the published entry-tier taker fees used in rankings.
 * Every rate below was read from the exchange's official fee page on FEES_CHECKED_ON.
 * When a rate is re-checked, update the rate AND FEES_CHECKED_ON together.
 */

export const FEES_CHECKED_ON = '2026-11-22';

/** After this many days without a re-check, no "lowest cost" badge is shown. */
export const FEE_STALE_AFTER_DAYS = 30;

export interface PublishedFee {
  providerId: 'kraken' | 'binanceus' | 'cryptodotcom' | 'coinbaseadvanced';
  providerName: string;
  /** Decimal taker rate, e.g. 0.008 = 0.80% */
  takerRate: number;
  /** Tier/condition the rate applies to */
  tier: string;
  /** Official fee page */
  sourceUrl: string;
  sourceLabel: string;
}

export const PUBLISHED_FEES: Record<PublishedFee['providerId'], PublishedFee> = {
  binanceus: {
    providerId: 'binanceus',
    providerName: 'Binance.US',
    takerRate: 0.0002,
    tier: 'Standard taker rate on all pairs except Tier 0 (BNB/USD)',
    sourceUrl: 'https://www.binance.us/fees',
    sourceLabel: 'binance.us/fees',
  },
  kraken: {
    providerId: 'kraken',
    providerName: 'Kraken Pro',
    takerRate: 0.008,
    tier: 'Kraken Pro Tier 1 spot ($0+ 30-day volume)',
    sourceUrl: 'https://www.kraken.com/pro/fees',
    sourceLabel: 'kraken.com/pro/fees',
  },
  cryptodotcom: {
    providerId: 'cryptodotcom',
    providerName: 'Crypto.com Exchange',
    takerRate: 0.005,
    tier: 'Crypto.com Exchange US Level 1 (<$10K 30-day volume), no CRO balance',
    sourceUrl: 'https://crypto.com/exchange-pro/en-US/document/fees-limits',
    sourceLabel: 'crypto.com Exchange US fees & limits',
  },
  coinbaseadvanced: {
    providerId: 'coinbaseadvanced',
    providerName: 'Coinbase Advanced',
    takerRate: 0.009,
    // Coinbase's full fee table sits behind sign-in; this is its public announcement of the
    // US spot entry tier (effective Sep 16, 2026): "US: 0.50% maker & 0.90% taker".
    tier: 'US spot entry tier ($0+ 30-day volume), effective Sep 16, 2026',
    sourceUrl: 'https://www.coinbase.com/blog/were-lowering-fees-for-many-active-traders-on-coinbase-advanced',
    sourceLabel: 'coinbase.com fee announcement',
  },
};

/** Published fee notes for providers we cannot rank (no public quote API). Same checked date. */
export const STRIKE_FEE_NOTE = {
  oneTimeTakerRate: 0.0089, // one-time and target orders, monthly level <= $4,999.99
  targetSpread: 0.0021, // "Strike targets an all-in spread of 0.21%"
  summary:
    'One-time and target buys: 0.89% fee at the starting monthly level (under $5,000), lower at higher volume, ' +
    'plus a spread Strike targets at 0.21%. Recurring buys are fee-free for personal accounts after the first week.',
  sourceUrl: 'https://strike.me/support/what-are-the-trading-fees/',
  sourceLabel: 'strike.me trading fees',
};

/** "0.80%" style label without trailing noise (0.02%, 0.50%, 0.80%). */
export function formatFeePercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/** "Nov 22, 2026" — formatted in UTC so server and browser agree. */
export function formatCheckedOn(isoDate: string = FEES_CHECKED_ON): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function feeAgeDays(now: number = Date.now(), isoDate: string = FEES_CHECKED_ON): number {
  const checked = Date.parse(`${isoDate}T00:00:00Z`);
  return Math.floor((now - checked) / 86_400_000);
}

export function feesAreStale(now: number = Date.now(), isoDate: string = FEES_CHECKED_ON): boolean {
  return feeAgeDays(now, isoDate) > FEE_STALE_AFTER_DAYS;
}

export function feeSourceCitation(fee: PublishedFee): string {
  return `${fee.providerName} official fee page (${fee.sourceLabel}): ${fee.tier}; checked ${formatCheckedOn()}`;
}

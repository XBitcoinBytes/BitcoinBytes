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

/**
 * Published fee notes for providers we cannot rank (no public quote API).
 * Every note was re-read on the provider's own fee/help page on UNRANKED_NOTES_CHECKED_ON.
 * Claims that could not be found on an official page were dropped, not kept.
 * When a note is re-checked, update the text AND UNRANKED_NOTES_CHECKED_ON together.
 * After FEE_STALE_AFTER_DAYS without a re-check, the note text is hidden (see unrankedFeeNote()).
 */
export const UNRANKED_NOTES_CHECKED_ON = '2026-11-25';

export type UnrankedProviderId = 'coinbase' | 'strike' | 'river' | 'cashapp' | 'robinhood' | 'swan';

export interface UnrankedFeeNote {
  providerId: UnrankedProviderId;
  providerName: string;
  summary: string;
  sourceUrl: string;
  sourceLabel: string;
}

export const UNRANKED_FEE_NOTES: Record<UnrankedProviderId, UnrankedFeeNote> = {
  coinbase: {
    providerId: 'coinbase',
    providerName: 'Coinbase (simple buy)',
    summary:
      'Fees vary with payment method, order size, location and asset, and are shown on the trade preview before you buy. ' +
      'Simple buys also include a spread in the quoted price.',
    sourceUrl: 'https://help.coinbase.com/en/coinbase/trading-and-funding/pricing-and-fees/fees',
    sourceLabel: 'Coinbase pricing and fees disclosures',
  },
  strike: {
    providerId: 'strike',
    providerName: 'Strike',
    summary:
      'One-time and target buys: 0.89% fee at the starting monthly level (under $5,000), lower at higher volume, ' +
      'plus a spread Strike targets at 0.21%. Recurring buys are fee-free for personal accounts after the first week.',
    sourceUrl: 'https://strike.me/support/what-are-the-trading-fees/',
    sourceLabel: 'strike.me trading fees',
  },
  river: {
    providerId: 'river',
    providerName: 'River',
    summary:
      'One-time buys: 1.00% fee on orders up to $1,000,000, plus a buy spread River says is typically around 0.25%. ' +
      'Recurring buys are fee-free after the first week; the first order pays the standard fee.',
    sourceUrl: 'https://support.river.com/hc/en-us/articles/50055900679315-What-are-River-s-fees',
    sourceLabel: 'River Help Center: fees',
  },
  cashapp: {
    providerId: 'cashapp',
    providerName: 'Cash App',
    summary:
      'Market buys: 2.0% fee under $500, 1.5% for $500 to $999, 0.9% for $1,000 to $1,999 and 0% from $2,000, ' +
      'plus a spread of up to 0.75% that varies with market conditions (a second Cash App help page says up to 1%). ' +
      'Auto Invest and Round Ups have no fee or spread.',
    sourceUrl: 'https://cash.app/help/us/en-US/3103-bitcoin-pricing',
    sourceLabel: 'Cash App Help: Bitcoin pricing',
  },
  robinhood: {
    providerId: 'robinhood',
    providerName: 'Robinhood',
    summary:
      'Default (market maker) routing has no commission; the cost is in the spread, and Robinhood says it receives ' +
      '$0.95 per $100 traded from its market maker (as of Jun 15, 2026). Optional exchange routing charges a fee instead: 0.95% on market ' +
      'orders at the starting tier (under $10K of 30-day volume).',
    sourceUrl: 'https://robinhood.com/us/en/support/articles/crypto-order-routing/',
    sourceLabel: 'Robinhood: crypto order routing',
  },
  swan: {
    providerId: 'swan',
    providerName: 'Swan Bitcoin',
    summary: '1% fee on buys, with no buy fee on a new client\'s first $250. Bitcoin withdrawals are free.',
    sourceUrl: 'https://www.swanbitcoin.com/fees/',
    sourceLabel: 'swanbitcoin.com/fees',
  },
};

/** Kept for existing imports: the Strike entry of UNRANKED_FEE_NOTES. */
export const STRIKE_FEE_NOTE = {
  oneTimeTakerRate: 0.0089, // one-time and target orders, monthly level <= $4,999.99
  targetSpread: 0.0021, // "Strike targets an all-in spread of 0.21%"
  ...UNRANKED_FEE_NOTES.strike,
};

export function unrankedNotesAreStale(now: number = Date.now()): boolean {
  return feesAreStale(now, UNRANKED_NOTES_CHECKED_ON);
}

/**
 * The note text to show for an unranked provider, with its checked date, or a "hidden until
 * re-checked" line when the note is older than FEE_STALE_AFTER_DAYS. Source link is always kept.
 */
export function unrankedFeeNote(id: UnrankedProviderId, now: number = Date.now()): {
  text: string;
  stale: boolean;
  sourceUrl: string;
  sourceLabel: string;
} {
  const note = UNRANKED_FEE_NOTES[id];
  const stale = unrankedNotesAreStale(now);
  const text = stale
    ? `Our note on ${note.providerName}'s fees has not been re-checked in the last ${FEE_STALE_AFTER_DAYS} days, so it is hidden. See their official fee page.`
    : `${note.summary} Checked ${formatCheckedOn(UNRANKED_NOTES_CHECKED_ON)}.`;
  return { text, stale, sourceUrl: note.sourceUrl, sourceLabel: note.sourceLabel };
}

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

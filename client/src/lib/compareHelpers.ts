/** Pure helpers for the comparison tool (unit-tested in server/__tests__/compareHelpers.test.ts). */
/** Plain-language messages instead of raw "HTTP 503" codes. */
export function friendlyError(status: number, serverMessage?: string): string {
  if (status === 400 && serverMessage) return serverMessage;
  if (status === 429) return 'Too many refreshes in a short time. Wait a minute, then try again.';
  if (status === 503) return 'No exchange returned a verified live quote just now. This is usually brief; try again in a moment.';
  return 'Live quotes could not be loaded right now. Please try again in a moment.';
}

/** Reads ?amount= so a comparison can be linked (e.g. from a video description). */
export function amountFromSearch(search: string): number | null {
  const raw = new URLSearchParams(search).get('amount');
  return raw ? parseUsd(raw) : null;
}

/**
 * Strict USD parser for the input box and ?amount=. Accepts "250", "$1,000", "99.5" and
 * scientific notation the number input allows ("1e3"); rejects anything else instead of
 * stripping characters (which turned "1e12" into 112 and "<script>1" into 1).
 */
export function parseUsd(raw: string): number | null {
  const t = raw.trim().replace(/^\$/, '').replace(/,(?=\d{3}\b)/g, '');
  if (!/^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 1 && n <= 1_000_000 ? Math.round(n * 100) / 100 : null;
}

export function syncAmountToUrl(n: number) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (n === 100) url.searchParams.delete('amount'); else url.searchParams.set('amount', String(n));
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}


/** Quotes older than this are hidden as expired (keep in sync with the 45 s check in the tool). */
export const QUOTE_EXPIRY_MS = 45_000;

/** Next refresh: at most 30 s, and always ~5 s before the oldest quote expires (min 3 s). */
export function nextRefreshMs(fetchedAts: number[], now: number): number {
  if (!fetchedAts.length) return 30_000;
  const age = now - Math.min(...fetchedAts);
  return Math.max(3_000, Math.min(30_000, QUOTE_EXPIRY_MS - 5_000 - age));
}

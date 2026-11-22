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
  if (!raw) return null;
  const n = Number(raw.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n >= 1 && n <= 1_000_000 ? Math.round(n * 100) / 100 : null;
}

export function syncAmountToUrl(n: number) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (n === 100) url.searchParams.delete('amount'); else url.searchParams.set('amount', String(n));
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}


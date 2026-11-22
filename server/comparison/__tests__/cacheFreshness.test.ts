import { describe, it, expect, vi, afterEach } from 'vitest';
import { ORDERBOOK_CACHE_MS, STALE_TTL_MS } from '../types';

const book = { error: [], result: { XXBTZUSD: { asks: [['60000', '5', '0'], ['60010', '5', '0']], bids: [] } } };

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); });

describe('order-book cache freshness (loop P10)', () => {
  it('cache window leaves most of the 45 s quote life for the browser', () => {
    expect(ORDERBOOK_CACHE_MS).toBeLessThanOrEqual(STALE_TTL_MS / 2);
  });

  it('re-reads the book after the cache window, and serves the last good book on an upstream error', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(1_000_000);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(book), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { krakenAdapter } = await import('../providers/kraken');

    const a = await krakenAdapter.getQuote(100);
    expect(a.state).toBe('live');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(1_000_000 + ORDERBOOK_CACHE_MS + 1_000); // past the cache window
    fetchMock.mockRejectedValueOnce(new Error('upstream 502'));
    const b = await krakenAdapter.getQuote(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);                // it did try to refresh
    expect(b.state).toBe('live');                              // and fell back to the last good book
    expect((b as { dataAgeMs: number }).dataAgeMs).toBeLessThan(STALE_TTL_MS);

    vi.setSystemTime(1_000_000 + STALE_TTL_MS + 1_000);       // past the hard cutoff: no fallback
    fetchMock.mockRejectedValueOnce(new Error('upstream 502'));
    const c = await krakenAdapter.getQuote(100);
    expect(c.state).not.toBe('live');
  });
});

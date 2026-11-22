import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicPriceService } from '../publicPriceService';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('public price feeds', () => {
  it('reports unavailable when every feed fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(new PublicPriceService().getPrice()).rejects.toThrow('Price unavailable');
  });
  it('accepts genuine prices below the former floor and excludes failed exchanges', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: url.includes('coinbase'), json: async () => ({ data: { amount: '65000' } }) })));
    const service = new PublicPriceService();
    expect((await service.getExchangeQuotes()).map(q => [q.source, q.price])).toEqual([['coinbase', 65000]]);
  });
  it('does not return an expired quote after all feeds fail', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { amount: '65000' } }) });
    vi.stubGlobal('fetch', fetcher);
    const service = new PublicPriceService();
    await service.getPrice();
    await service.getPrice();
    expect(fetcher).toHaveBeenCalledTimes(3);
    vi.advanceTimersByTime(45001);
    fetcher.mockRejectedValue(new Error('offline'));
    await expect(service.getPrice()).rejects.toThrow('Price unavailable');
  });
  it('rejects invalid prices and never labels an aggregate as an exchange', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url.includes('coingecko') ? { bitcoin: { usd: 65000 } } : { data: { amount: '-1' } } })));
    const service = new PublicPriceService();
    expect((await service.getPrice()).source).toBe('coingecko');
    await expect(service.getExchangeQuotes()).rejects.toThrow('Price unavailable');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const state = vi.hoisted(() => ({ impl: async (_n: number): Promise<unknown> => ({ ranked: [], feesStale: false }) }));
vi.mock('../engine.js', () => ({ runComparison: (n: number) => state.impl(n) }));
const runComparison = {
  mockResolvedValue: (v: unknown) => { state.impl = async () => v; },
  mockImplementation: (f: (n: number) => Promise<unknown>) => { state.impl = f; },
  mockReset: () => { state.impl = async () => ({ ranked: [], feesStale: false }); },
};

import { handleCompareHealth, MIN_LIVE_FOR_HEALTHY } from '../route.js';

function mockRes() {
  const res: { statusCode: number; body: unknown; headers: Record<string, string>; status: (c: number) => typeof res; json: (b: unknown) => typeof res; set: (k: string, v: string) => typeof res } = {
    statusCode: 0, body: null, headers: {},
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    set(k, v) { this.headers[k] = v; return this; },
  };
  return res;
}
const ranked = (id: string, state: 'live' | 'stale' = 'live') => ({ providerId: id, state });

describe('/api/compare/health', () => {
  beforeEach(() => runComparison.mockReset());

  it('is 200 ok when at least 2 exchanges are live', async () => {
    runComparison.mockResolvedValue({ ranked: [ranked('binanceus'), ranked('kraken'), ranked('cryptodotcom', 'stale')], feesStale: false });
    const res = mockRes();
    await handleCompareHealth({} as never, res as never);
    expect(MIN_LIVE_FOR_HEALTHY).toBe(2);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Cache-Control']).toBe('no-store');
    expect(res.body).toMatchObject({ status: 'ok', liveExchanges: 2, minRequired: 2, live: ['binanceus', 'kraken'], rankedExchanges: 3, feesStale: false });
  });

  it('is 503 degraded with fewer than 2 live exchanges (stale ones do not count)', async () => {
    runComparison.mockResolvedValue({ ranked: [ranked('kraken'), ranked('binanceus', 'stale')], feesStale: false });
    const res = mockRes();
    await handleCompareHealth({} as never, res as never);
    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({ status: 'degraded', liveExchanges: 1 });
  });

  it('is 503 error when the engine throws', async () => {
    runComparison.mockImplementation(async () => { throw new Error('boom'); });
    const res = mockRes();
    await handleCompareHealth({} as never, res as never);
    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({ status: 'error', liveExchanges: 0 });
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NetworkNowService, blocksUntilAdjustment, parseAvgBlockSeconds } from '../networkNowService';

function fakeFetch(routes: Record<string, () => Response>) {
  return (async (url: string) => {
    const h = routes[url];
    if (!h) throw new Error(`offline: ${url}`);
    return h();
  }) as unknown as typeof fetch;
}
const ADJ = 'https://mempool.space/api/v1/difficulty-adjustment';
const TIP = 'https://mempool.space/api/blocks/tip/height';
const BS = 'https://blockstream.info/api/blocks/tip/height';

describe('network right now', () => {
  it('computes blocks to the next 2016-block retarget', () => {
    expect(blocksUntilAdjustment(977582)).toBe(178);
    expect(blocksUntilAdjustment(977760)).toBe(2016);
  });
  it('accepts only plausible average block times', () => {
    expect(parseAvgBlockSeconds(552307)).toBe(552);
    expect(parseAvgBlockSeconds(5)).toBeNull();
    expect(parseAvgBlockSeconds('x')).toBeNull();
  });
  it('serves real mempool.space facts', async () => {
    const svc = new NetworkNowService(fakeFetch({
      [TIP]: () => new Response('977582'),
      [ADJ]: () => new Response(JSON.stringify({ timeAvg: 552307, remainingBlocks: 178 })),
    }));
    const d = await svc.getNow();
    expect(d).toMatchObject({ available: true, blockHeight: 977582, avgBlockTimeSeconds: 552, blocksUntilAdjustment: 178, nextAdjustmentHeight: 977760, source: 'mempool.space', stale: false });
    expect(d).not.toHaveProperty('price');
  });
  it('falls back to Blockstream height with no invented block time', async () => {
    const svc = new NetworkNowService(fakeFetch({ [BS]: () => new Response('977582') }));
    const d = await svc.getNow();
    expect(d).toMatchObject({ available: true, blockHeight: 977582, avgBlockTimeSeconds: null, blocksUntilAdjustment: 178, source: 'blockstream.info' });
  });
  it('reports unavailable (not fake numbers) when every source is down', async () => {
    const d = await new NetworkNowService(fakeFetch({})).getNow();
    expect(d.available).toBe(false);
    expect(d.blockHeight).toBeNull();
    expect(d.avgBlockTimeSeconds).toBeNull();
  });
  it('rejects garbage heights', async () => {
    const d = await new NetworkNowService(fakeFetch({ [TIP]: () => new Response('<html>'), [BS]: () => new Response('12') })).getNow();
    expect(d.available).toBe(false);
  });
  it('serves the last good reading, marked stale, if sources fail later', async () => {
    let t = 1_000_000;
    let up = true;
    const svc = new NetworkNowService(
      (async (url: string) => {
        if (!up) throw new Error('down');
        return url === TIP ? new Response('977582') : new Response(JSON.stringify({ timeAvg: 600000 }));
      }) as unknown as typeof fetch,
      () => t,
    );
    await svc.getNow();
    up = false;
    t += 5 * 60_000;
    const d = await svc.getNow();
    expect(d).toMatchObject({ available: true, stale: true, blockHeight: 977582 });
    t += 20 * 60_000;
    expect((await svc.getNow()).available).toBe(false);
  });
  it('has no random or hard-coded values in the service', () => {
    const src = fs.readFileSync(path.join(__dirname, '../networkNowService.ts'), 'utf8');
    expect(src).not.toMatch(/Math\.random/);
    expect(src.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/usd|price|coingecko/i);
  });
});

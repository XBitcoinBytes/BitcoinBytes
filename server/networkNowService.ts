/**
 * "Network right now" facts for /learn: block height, average block time and blocks until the
 * next difficulty adjustment. Facts only (no price). Every number comes from a public block
 * explorer API; nothing is estimated, randomised or hard-coded. If the sources are down and the
 * last good reading is too old, the service reports available:false instead of inventing values.
 */

export const DIFFICULTY_PERIOD_BLOCKS = 2016;
const FRESH_MS = 60_000; // re-fetch at most once a minute
const MAX_STALE_MS = 15 * 60_000; // serve the last good reading for up to 15 min if sources fail
const TIMEOUT_MS = 4_000;

const MEMPOOL_ADJ = 'https://mempool.space/api/v1/difficulty-adjustment';
const MEMPOOL_TIP = 'https://mempool.space/api/blocks/tip/height';
const BLOCKSTREAM_TIP = 'https://blockstream.info/api/blocks/tip/height';

export interface NetworkNow {
  available: boolean;
  blockHeight: number | null;
  /** Average seconds per block so far in the current difficulty period */
  avgBlockTimeSeconds: number | null;
  blocksUntilAdjustment: number | null;
  nextAdjustmentHeight: number | null;
  source: string | null;
  sourceUrl: string | null;
  fetchedAt: string | null;
  stale: boolean;
}

export const UNAVAILABLE: NetworkNow = {
  available: false, blockHeight: null, avgBlockTimeSeconds: null, blocksUntilAdjustment: null,
  nextAdjustmentHeight: null, source: null, sourceUrl: null, fetchedAt: null, stale: false,
};

/** Deterministic from the consensus rule: difficulty retargets every 2016 blocks. */
export function blocksUntilAdjustment(height: number): number {
  return DIFFICULTY_PERIOD_BLOCKS - (height % DIFFICULTY_PERIOD_BLOCKS);
}

export function validHeight(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 800_000 && n < 10_000_000;
}

/** mempool.space reports timeAvg in ms; accept only plausible values (1 to 60 minutes). */
export function parseAvgBlockSeconds(timeAvgMs: unknown): number | null {
  if (typeof timeAvgMs !== 'number' || !Number.isFinite(timeAvgMs)) return null;
  const s = timeAvgMs / 1000;
  return s >= 60 && s <= 3600 ? Math.round(s) : null;
}

type Fetch = typeof fetch;

export class NetworkNowService {
  private last: { data: NetworkNow; at: number } | null = null;
  private inflight: Promise<NetworkNow> | null = null;

  constructor(private readonly fetchImpl: Fetch = fetch, private readonly now: () => number = Date.now) {}

  private async get(url: string): Promise<Response> {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const r = await this.fetchImpl(url, { signal: ctl.signal, headers: { 'User-Agent': 'BitcoinBytes/1.0 (+https://www.bitcoinbytes.org)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r;
    } finally {
      clearTimeout(t);
    }
  }

  private async height(url: string): Promise<number> {
    const n = Number((await (await this.get(url)).text()).trim());
    if (!validHeight(n)) throw new Error('bad height');
    return n;
  }

  private build(height: number, avg: number | null, source: string, sourceUrl: string): NetworkNow {
    return {
      available: true,
      blockHeight: height,
      avgBlockTimeSeconds: avg,
      blocksUntilAdjustment: blocksUntilAdjustment(height),
      nextAdjustmentHeight: height + blocksUntilAdjustment(height),
      source,
      sourceUrl,
      fetchedAt: new Date(this.now()).toISOString(),
      stale: false,
    };
  }

  private async fetchFresh(): Promise<NetworkNow> {
    // Primary: mempool.space (height + average block time this period).
    try {
      const [height, adj] = await Promise.all([
        this.height(MEMPOOL_TIP),
        this.get(MEMPOOL_ADJ).then((r) => r.json() as Promise<{ timeAvg?: unknown }>),
      ]);
      return this.build(height, parseAvgBlockSeconds(adj.timeAvg), 'mempool.space', 'https://mempool.space/');
    } catch {
      /* fall through */
    }
    // Fallback: Blockstream height only (average block time shown as unavailable).
    const height = await this.height(BLOCKSTREAM_TIP);
    return this.build(height, null, 'blockstream.info', 'https://blockstream.info/');
  }

  async getNow(): Promise<NetworkNow> {
    const t = this.now();
    if (this.last && t - this.last.at < FRESH_MS) return this.last.data;
    if (!this.inflight) {
      this.inflight = this.fetchFresh()
        .then((data) => {
          this.last = { data, at: this.now() };
          return data;
        })
        .finally(() => {
          this.inflight = null;
        });
    }
    try {
      return await this.inflight;
    } catch {
      if (this.last && this.now() - this.last.at < MAX_STALE_MS) return { ...this.last.data, stale: true };
      return UNAVAILABLE;
    }
  }
}

export const networkNowService = new NetworkNowService();

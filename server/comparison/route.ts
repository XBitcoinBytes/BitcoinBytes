/**
 * GET /api/compare?amount=<number>
 *
 * Returns a ranked comparison of Bitcoin purchase options for the given
 * USD amount. All results are clearly labelled as estimates. No synthetic,
 * fabricated, or Math.random() data is produced here.
 */

import type { Request, Response } from 'express';
import { runComparison } from './engine.js';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;

export async function handleCompare(req: Request, res: Response): Promise<void> {
  const raw = req.query.amount;
  const usdAmount = parseFloat(String(raw));

  if (!Number.isFinite(usdAmount) || usdAmount < MIN_AMOUNT || usdAmount > MAX_AMOUNT) {
    res.status(400).json({
      error: `amount must be a number between ${MIN_AMOUNT} and ${MAX_AMOUNT.toLocaleString()}`,
    });
    return;
  }

  try {
    const result = await runComparison(usdAmount);
    // Cache for 30 s – fresh enough for this use case, reduces API load
    res.set('Cache-Control', 'no-store');
    res.status(result.ranked.length ? 200 : 503).json({ ...result, available: result.ranked.length > 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[compare] Engine error:', message);
    res.status(500).json({ error: 'Comparison engine failed. Please try again.' });
  }
}

/** Live ranked exchanges needed for the compare tool to count as healthy. */
export const MIN_LIVE_FOR_HEALTHY = 2;
const HEALTH_PROBE_AMOUNT = 100;

/**
 * GET /api/compare/health — for an external uptime poller.
 * 200 {"status":"ok",...} when at least MIN_LIVE_FOR_HEALTHY exchanges return live order-book data;
 * 503 {"status":"degraded",...} otherwise, or {"status":"error"} if the engine throws.
 * Reuses the engine's 15 s order-book cache, so polling adds little upstream load.
 */
export async function handleCompareHealth(_req: Request, res: Response): Promise<void> {
  res.set('Cache-Control', 'no-store');
  const checkedAt = new Date().toISOString();
  try {
    const result = await runComparison(HEALTH_PROBE_AMOUNT);
    const live = result.ranked.filter((r) => r.state === 'live').map((r) => r.providerId);
    const ok = live.length >= MIN_LIVE_FOR_HEALTHY;
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      liveExchanges: live.length,
      minRequired: MIN_LIVE_FOR_HEALTHY,
      live,
      rankedExchanges: result.ranked.length,
      feesStale: result.feesStale,
      checkedAt,
    });
  } catch (err: unknown) {
    console.error('[compare/health] Engine error:', err instanceof Error ? err.message : err);
    res.status(503).json({ status: 'error', liveExchanges: 0, minRequired: MIN_LIVE_FOR_HEALTHY, checkedAt });
  }
}

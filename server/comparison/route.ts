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
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[compare] Engine error:', message);
    res.status(500).json({ error: 'Comparison engine failed. Please try again.' });
  }
}

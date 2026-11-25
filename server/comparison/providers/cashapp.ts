/**
 * Cash App Informational Provider
 *
 * Cash App (Block/Square) has no public API for Bitcoin purchase pricing.
 * Their session-authenticated internal API is not publicly documented and
 * their Terms of Service explicitly prohibit scraping. The fee schedule is
 * published (shared/feeSchedule.ts UNRANKED_FEE_NOTES), but the spread on a
 * given purchase is only shown on the in-app confirmation screen.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';
import { unrankedFeeNote } from '../../../shared/feeSchedule.js';

const PURCHASE_URL = 'https://cash.app/bitcoin';

export const cashAppAdapter: ProviderAdapter = {
  id: 'cashapp',
  name: 'Cash App',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const note = unrankedFeeNote('cashapp');
    const unranked: UnrankedResult = {
      providerId: 'cashapp',
      providerName: 'Cash App',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Cash App has no public API for Bitcoin purchase quotes. The spread on a given purchase is shown only ' +
        'on the confirmation screen inside the app, so an amount-specific cost cannot be verified.',
      partialData: {
        publishedFeeNote: note.text,
        feeUrl: note.sourceUrl,
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

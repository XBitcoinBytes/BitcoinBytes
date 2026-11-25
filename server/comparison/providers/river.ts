/**
 * River Informational Provider
 *
 * River has no documented public API for purchase quotes. Its fee schedule is
 * published in its Help Center (shared/feeSchedule.ts UNRANKED_FEE_NOTES)
 * but is not accessible via any API endpoint without authentication.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';
import { unrankedFeeNote } from '../../../shared/feeSchedule.js';

const PURCHASE_URL = 'https://river.com/buy';

export const riverAdapter: ProviderAdapter = {
  id: 'river',
  name: 'River',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const note = unrankedFeeNote('river');
    const unranked: UnrankedResult = {
      providerId: 'river',
      providerName: 'River',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'River has no public API for purchase quotes. A verified amount-specific price ' +
        'and fee cannot be obtained without authentication.',
      partialData: {
        publishedFeeNote: note.text,
        feeUrl: note.sourceUrl,
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

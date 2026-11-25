/**
 * Swan Bitcoin Informational Provider
 *
 * Swan has no documented public API for purchase quotes. Its fee is published
 * on its website (shared/feeSchedule.ts UNRANKED_FEE_NOTES) but not via API.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';
import { unrankedFeeNote } from '../../../shared/feeSchedule.js';

const PURCHASE_URL = 'https://www.swanbitcoin.com/';

export const swanAdapter: ProviderAdapter = {
  id: 'swan',
  name: 'Swan Bitcoin',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const note = unrankedFeeNote('swan');
    const unranked: UnrankedResult = {
      providerId: 'swan',
      providerName: 'Swan Bitcoin',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Swan has no public API for purchase quotes, so an amount-specific price cannot be ' +
        'verified without an account.',
      partialData: {
        publishedFeeNote: note.text,
        feeUrl: note.sourceUrl,
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

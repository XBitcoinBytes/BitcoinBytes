/**
 * River Informational Provider
 *
 * River has no documented public API for purchase quotes. Their fee of
 * approximately 1.3% for instant purchases is published on their website
 * but is not accessible via any API endpoint without authentication.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';

const PURCHASE_URL = 'https://river.com/buy';

export const riverAdapter: ProviderAdapter = {
  id: 'river',
  name: 'River',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const unranked: UnrankedResult = {
      providerId: 'river',
      providerName: 'River',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'River has no public API for purchase quotes. A verified amount-specific price ' +
        'and fee cannot be obtained without authentication.',
      partialData: {
        publishedFeeNote: 'River charges approximately 1.3% for instant purchases (see river.com for current rates). Available in most US states.',
        feeUrl: 'https://river.com/learn/what-are-rivers-fees/',
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

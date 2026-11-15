/**
 * Swan Bitcoin Informational Provider
 *
 * Swan has no documented public API for purchase quotes. Swan primarily
 * offers recurring/DCA purchases; one-time instant purchases are secondary.
 * Fee information is published on their website but not via API.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';

const PURCHASE_URL = 'https://www.swanbitcoin.com/';

export const swanAdapter: ProviderAdapter = {
  id: 'swan',
  name: 'Swan Bitcoin',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const unranked: UnrankedResult = {
      providerId: 'swan',
      providerName: 'Swan Bitcoin',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Swan has no public API for purchase quotes. Swan is primarily a recurring/DCA platform; ' +
        'one-time purchase fee and price cannot be retrieved without authentication.',
      partialData: {
        publishedFeeNote: 'Swan charges up to 0.99% for recurring auto-buys and up to 2.29% for one-time purchases (see Swan website for current rates).',
        feeUrl: 'https://www.swanbitcoin.com/pricing/',
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

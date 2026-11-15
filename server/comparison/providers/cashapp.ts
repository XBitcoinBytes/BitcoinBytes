/**
 * Cash App Informational Provider
 *
 * Cash App (Block/Square) has no public API for Bitcoin purchase pricing.
 * Their session-authenticated internal API is not publicly documented and
 * their Terms of Service explicitly prohibit scraping. Fees include a spread
 * plus a service fee shown only at the point of sale inside an authenticated
 * session.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';

const PURCHASE_URL = 'https://cash.app/bitcoin';

export const cashAppAdapter: ProviderAdapter = {
  id: 'cashapp',
  name: 'Cash App',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const unranked: UnrankedResult = {
      providerId: 'cashapp',
      providerName: 'Cash App',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Cash App has no public API for Bitcoin purchase quotes. Fees are shown only ' +
        'inside an authenticated session at point of sale and cannot be retrieved programmatically.',
      partialData: {
        publishedFeeNote: 'Cash App charges a service fee plus a spread that varies by market conditions. See Cash App Help for details.',
        feeUrl: 'https://cash.app/help/us/en-us/3056-bitcoin-fees',
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

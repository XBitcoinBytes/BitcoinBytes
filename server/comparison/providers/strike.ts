/**
 * Strike Informational Provider
 *
 * Strike has NO public unauthenticated API. api.strike.me requires OAuth 2.0
 * for all resources. Strike's 0% fee claim is marketing copy, not an API response.
 * Strike is not available in all US states (NY excluded as of last review).
 *
 * This adapter is permanently UNRANKED. It exists to show Strike in the UI
 * with an honest explanation of what is missing, per the requirement to display
 * at least six trusted provider options including unranked rows.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';

const PURCHASE_URL = 'https://strike.me/buy-bitcoin/';

export const strikeAdapter: ProviderAdapter = {
  id: 'strike',
  name: 'Strike',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const unranked: UnrankedResult = {
      providerId: 'strike',
      providerName: 'Strike',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Strike has no public API for purchase quotes. A verified fee and amount-specific price ' +
        'cannot be obtained without authentication. Strike advertises 0% fees for standard ' +
        'purchases but this cannot be confirmed programmatically.',
      partialData: {
        publishedFeeNote: 'Strike advertises 0% fee for standard BTC purchases via bank/Lightning (subject to change). Not available in all US states.',
        feeUrl: 'https://strike.me/faq/',
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

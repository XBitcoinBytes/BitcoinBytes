/**
 * Robinhood Informational Provider
 *
 * Robinhood has no sanctioned public API for Bitcoin purchase quotes.
 * Robinhood uses a spread-only model – no explicit purchase fee is disclosed.
 * The effective spread is not exposed via any public or accessible endpoint.
 * Robinhood's Terms of Service prohibit automated access without written permission.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';

const PURCHASE_URL = 'https://robinhood.com/crypto/BTC';

export const robinhoodAdapter: ProviderAdapter = {
  id: 'robinhood',
  name: 'Robinhood',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const unranked: UnrankedResult = {
      providerId: 'robinhood',
      providerName: 'Robinhood',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Robinhood uses a spread-only pricing model with no public API. ' +
        'The effective spread is not disclosed programmatically and cannot be verified without an authenticated session.',
      partialData: {
        publishedFeeNote: 'Robinhood charges no explicit fee but earns revenue through a bid-ask spread embedded in the execution price. Spread varies by market conditions.',
        feeUrl: 'https://robinhood.com/us/en/support/articles/cryptocurrency-trading/',
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

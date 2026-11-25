/**
 * Robinhood Informational Provider
 *
 * Robinhood has no sanctioned public API for Bitcoin purchase quotes.
 * Default (market maker) routing has no commission; the cost is in the spread,
 * which is not exposed via any public endpoint. Published details live in
 * shared/feeSchedule.ts UNRANKED_FEE_NOTES.
 * Robinhood's Terms of Service prohibit automated access without written permission.
 *
 * This adapter is permanently UNRANKED.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';
import { unrankedFeeNote } from '../../../shared/feeSchedule.js';

const PURCHASE_URL = 'https://robinhood.com/crypto/BTC';

export const robinhoodAdapter: ProviderAdapter = {
  id: 'robinhood',
  name: 'Robinhood',
  purchaseUrl: PURCHASE_URL,

  async getQuote(_usdAmount: number): Promise<ProviderResult> {
    const note = unrankedFeeNote('robinhood');
    const unranked: UnrankedResult = {
      providerId: 'robinhood',
      providerName: 'Robinhood',
      providerUrl: PURCHASE_URL,
      state: 'incomplete',
      reason:
        'Robinhood\'s default routing prices through a spread, and it has no public quote API. ' +
        'The effective spread is not disclosed programmatically and cannot be verified without an authenticated session.',
      partialData: {
        publishedFeeNote: note.text,
        feeUrl: note.sourceUrl,
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

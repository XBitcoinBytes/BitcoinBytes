/**
 * Strike Informational Provider
 *
 * Strike has NO public unauthenticated API. api.strike.me requires OAuth 2.0
 * for all resources. Published fee note comes from shared/feeSchedule.ts (STRIKE_FEE_NOTE).
 * Strike is not available in all US states (NY excluded as of last review).
 *
 * This adapter is permanently UNRANKED. It exists to show Strike in the UI
 * with an honest explanation of what is missing, per the requirement to display
 * at least six trusted provider options including unranked rows.
 */

import type { ProviderAdapter, ProviderResult, UnrankedResult } from '../types.js';
import { STRIKE_FEE_NOTE, formatCheckedOn } from '../../../shared/feeSchedule.js';

const PURCHASE_URL = 'https://strike.me/buy/';

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
        'Strike has no public API for purchase quotes, so an amount-specific price and fee cannot be ' +
        'verified without an account. Its published fees are shown for reference only.',
      partialData: {
        publishedFeeNote: `${STRIKE_FEE_NOTE.summary} Checked ${formatCheckedOn()}.`,
        feeUrl: STRIKE_FEE_NOTE.sourceUrl,
      },
      fetchedAt: Date.now(),
    };
    return unranked;
  },
};

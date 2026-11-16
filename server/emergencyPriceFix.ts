// Compatibility adapter: no price floors, generated quotes, or manual overrides.
import { publicPriceService } from './publicPriceService';
export const emergencyPriceFix = {
  async getAccurateBitcoinPrice() { return publicPriceService.getPrice(); },
  async getMultiExchangePrices() { return publicPriceService.getExchangeQuotes(); },
  async validatePriceAccuracy() { return { available: true, quote: await publicPriceService.getPrice() }; },
  async forceRefreshAllPrices() { await publicPriceService.getPrice(); return true; }
};

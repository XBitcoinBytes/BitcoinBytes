import { publicPriceService } from './publicPriceService';
export const cascadeApiManager = {
  async getCurrentBitcoinPrice() {
    return { ...await publicPriceService.getPrice(), confidence: null, isFromCache: false };
  },
  async getMultipleSources() { return publicPriceService.getQuotes(); },
  getStatus() { return { source: 'public-feeds', cacheSeconds: 45 }; },
  getPriceHistory() { return []; }
};

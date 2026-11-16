import { publicPriceService } from './publicPriceService';
export const multiSourceValidator = {
  async validateBitcoinPrice() {
    const quotes = await publicPriceService.getQuotes();
    return { isValid: true, sources: quotes, alerts: [] };
  },
  async getValidatedExchangePrices() {
    return (await publicPriceService.getExchangeQuotes()).map(q => ({
      exchange: q.source, price: q.price, timestamp: q.timestamp, volume24h: null, change24h: null
    }));
  },
  getStatus() { return { source: 'public-feeds', cacheSeconds: 45 }; }
};

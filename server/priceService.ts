import { publicPriceService } from './publicPriceService';
export const priceService = {
  async getCurrentPrices() {
    return new Map((await publicPriceService.getExchangeQuotes()).map(q => [q.source, {
      exchange: q.source, price: q.price, timestamp: q.timestamp,
      volume24h: null, change24h: null
    }]));
  }
};

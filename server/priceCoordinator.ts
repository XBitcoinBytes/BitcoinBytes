import { publicPriceService } from './publicPriceService';
export const priceCoordinator = {
  async coordinateExchangeUpdates() {
    return (await publicPriceService.getExchangeQuotes()).map(q => ({
      exchange: q.source, price: q.price, timestamp: q.timestamp, volume24h: null, change24h: null
    }));
  },
  shouldUpdate() { return true; },
  getStatus() { return { source: 'public-feeds', cacheSeconds: 45 }; }
};

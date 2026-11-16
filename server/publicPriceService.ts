/** Public USD quotes only. Expired quotes are never served after a refresh fails. */
export interface PublicQuote {
  source: string;
  price: number;
  timestamp: Date;
}
export class PriceUnavailableError extends Error {
  constructor() { super('Price unavailable'); }
}
const feeds = [
  { source: 'coinbase', url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot', parse: (d: any) => d?.data?.amount },
  { source: 'kraken', url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD', parse: (d: any) => d?.result?.XXBTZUSD?.c?.[0] },
  { source: 'coingecko', url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', parse: (d: any) => d?.bitcoin?.usd },
];
export class PublicPriceService {
  private quotes: PublicQuote[] = [];
  private expiresAt = 0;
  private pending: Promise<PublicQuote[]> | null = null;
  async getQuotes(): Promise<PublicQuote[]> {
    if (Date.now() < this.expiresAt) return this.quotes;
    if (!this.pending) {
      this.pending = this.refresh().finally(() => { this.pending = null; });
    }
    return this.pending;
  }
  private async refresh(): Promise<PublicQuote[]> {
    const results = await Promise.allSettled(feeds.map(async feed => {
      const response = await fetch(feed.url, { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new PriceUnavailableError();
      const raw = feed.parse(await response.json());
      const price = typeof raw === 'number' || typeof raw === 'string' ? Number(raw) : NaN;
      if (!Number.isFinite(price) || price <= 0) throw new PriceUnavailableError();
      return { source: feed.source, price, timestamp: new Date() };
    }));
    this.quotes = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    if (!this.quotes.length) { this.expiresAt = 0; throw new PriceUnavailableError(); }
    this.expiresAt = Math.min(...this.quotes.map(q => q.timestamp.getTime())) + 45000;
    return this.quotes;
  }
  async getPrice() { return (await this.getQuotes())[0]; }
  async getExchangeQuotes() {
    const quotes = (await this.getQuotes()).filter(q => q.source !== 'coingecko');
    if (!quotes.length) throw new PriceUnavailableError();
    return quotes;
  }
}
export const publicPriceService = new PublicPriceService();

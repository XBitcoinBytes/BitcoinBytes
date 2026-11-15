interface BinanceTickerResponse {
  symbol: string;
  price: string;
  priceChangePercent: string;
  volume: string;
  count: number;
}

interface BinanceExchangeInfoResponse {
  symbols: Array<{
    symbol: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
  }>;
}

class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';
  private cache: { [key: string]: { data: any; timestamp: number } } = {};
  private cacheTimeout = 60000; // 60 seconds cache
  private lastRequest = 0;
  private minRequestInterval = 2000; // 2 seconds between requests

  private async fetchData(url: string): Promise<any> {
    // Check cache first
    const cached = this.cache[url];
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    // Rate limiting - wait if needed
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequest = Date.now();
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    this.cache[url] = { data, timestamp: Date.now() };
    
    return data;
  }

  async getBitcoinPrice(): Promise<{ price: number; volume24h: number; change24h: number; timestamp: Date; }> {
    try {
      const url = `${this.baseUrl}/ticker/24hr?symbol=BTCUSDT`;
      const data: BinanceTickerResponse = await this.fetchData(url);
      
      return {
        price: parseFloat(data.price),
        volume24h: parseFloat(data.volume) * parseFloat(data.price), // Convert to USD volume
        change24h: parseFloat(data.priceChangePercent),
        timestamp: new Date()
      };
    } catch (error) {
      console.warn('Binance getBitcoinPrice failed:', error.message);
      throw error;
    }
  }

  async getExchangePrices(): Promise<Array<{
    exchange: string;
    price: number;
    volume24h: number;
    change24h: number;
    timestamp: Date;
  }>> {
    try {
      // Get multiple trading pairs for Bitcoin
      const symbols = ['BTCUSDT', 'BTCBUSD', 'BTCUSDC'];
      const timestamp = new Date();
      
      const promises = symbols.map(async (symbol) => {
        try {
          const url = `${this.baseUrl}/ticker/24hr?symbol=${symbol}`;
          const data: BinanceTickerResponse = await this.fetchData(url);
          
          return {
            exchange: `binance-${symbol.toLowerCase()}`,
            price: parseFloat(data.price),
            volume24h: parseFloat(data.volume) * parseFloat(data.price),
            change24h: parseFloat(data.priceChangePercent),
            timestamp
          };
        } catch (error) {
          console.warn(`Binance ${symbol} failed:`, error.message);
          return null;
        }
      });

      const results = await Promise.all(promises);
      return results.filter(result => result !== null);
      
    } catch (error) {
      console.warn('Binance getExchangePrices failed:', error.message);
      throw error;
    }
  }

  async getAllTickers(): Promise<BinanceTickerResponse[]> {
    try {
      const url = `${this.baseUrl}/ticker/24hr`;
      return await this.fetchData(url);
    } catch (error) {
      console.warn('Binance getAllTickers failed:', error.message);
      throw error;
    }
  }
}

export const binanceService = new BinanceService();
/**
 * 15-Expert Team Solution: Free API Sources for Accurate Bitcoin Pricing
 * Multiple reliable free data sources to ensure 24/7 accurate pricing
 */

interface BitcoinPriceData {
  price: number;
  source: string;
  timestamp: Date;
  confidence: number;
}

class FreeApiSources {
  private sources = [
    {
      name: 'coingecko-free',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      priority: 1,
      rateLimit: 100, // per minute
      confidence: 0.95
    },
    {
      name: 'coindesk',
      url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
      priority: 2,
      rateLimit: 1000, // no documented limit
      confidence: 0.90
    },
    {
      name: 'coinbase-public',
      url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
      priority: 3,
      rateLimit: 1000, // generous public API
      confidence: 0.92
    },
    {
      name: 'blockchain-info',
      url: 'https://blockchain.info/ticker',
      priority: 4,
      rateLimit: 1000,
      confidence: 0.88
    },
    {
      name: 'bitfinex-public',
      url: 'https://api-pub.bitfinex.com/v2/ticker/tBTCUSD',
      priority: 5,
      rateLimit: 30, // per minute
      confidence: 0.85
    },
    {
      name: 'kraken-public',
      url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
      priority: 6,
      rateLimit: 60, // per minute
      confidence: 0.90
    },
    {
      name: 'bitstamp-public',
      url: 'https://www.bitstamp.net/api/v2/ticker/btcusd/',
      priority: 7,
      rateLimit: 600, // per 10 minutes
      confidence: 0.87
    },
    {
      name: 'gemini-public',
      url: 'https://api.gemini.com/v1/pubticker/btcusd',
      priority: 8,
      rateLimit: 120, // per minute
      confidence: 0.89
    }
  ];

  private lastRequests: { [key: string]: number } = {};
  private cache: { [key: string]: { data: BitcoinPriceData; timestamp: number } } = {};
  private cacheTimeout = 60000; // 60 seconds - increased to reduce API calls

  async fetchFromSource(source: any): Promise<BitcoinPriceData | null> {
    try {
      // Check rate limiting
      const now = Date.now();
      const lastRequest = this.lastRequests[source.name] || 0;
      const timeSinceLastRequest = now - lastRequest;
      const minInterval = 60000 / source.rateLimit; // Convert rate limit to interval

      if (timeSinceLastRequest < minInterval) {
        console.log(`Rate limit protection: ${source.name} (${timeSinceLastRequest}ms < ${minInterval}ms)`);
        return null;
      }

      // Check cache
      const cached = this.cache[source.name];
      if (cached && (now - cached.timestamp) < this.cacheTimeout) {
        return cached.data;
      }

      this.lastRequests[source.name] = now;

      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'BitcoinBytes/1.0 (Educational Platform)',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const price = this.extractPrice(data, source.name);

      if (price && price > 50000 && price < 200000) { // Basic sanity check
        const priceData: BitcoinPriceData = {
          price,
          source: source.name,
          timestamp: new Date(),
          confidence: source.confidence
        };

        // Cache the result
        this.cache[source.name] = {
          data: priceData,
          timestamp: now
        };

        return priceData;
      }

      return null;
    } catch (error) {
      console.error(`Free API source ${source.name} failed:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private extractPrice(data: any, sourceName: string): number | null {
    try {
      switch (sourceName) {
        case 'coingecko-free':
          return data?.bitcoin?.usd || null;
        
        case 'coindesk':
          return data?.bpi?.USD?.rate_float || null;
        
        case 'coinbase-public':
          return parseFloat(data?.data?.rates?.USD) || null;
        
        case 'blockchain-info':
          return data?.USD?.last || null;
        
        case 'bitfinex-public':
          return Array.isArray(data) ? parseFloat(data[6]) : null;
        
        case 'kraken-public':
          return parseFloat(data?.result?.XXBTZUSD?.c?.[0]) || null;
        
        case 'bitstamp-public':
          return parseFloat(data?.last) || null;
        
        case 'gemini-public':
          return parseFloat(data?.last) || null;
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`Price extraction failed for ${sourceName}:`, error);
      return null;
    }
  }

  async getAccurateBitcoinPrice(): Promise<BitcoinPriceData[]> {
    const promises = this.sources
      .sort((a, b) => a.priority - b.priority)
      .map(source => this.fetchFromSource(source));

    const results = await Promise.allSettled(promises);
    const validPrices: BitcoinPriceData[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        validPrices.push(result.value);
      }
    }

    return validPrices;
  }

  async getBestPrice(): Promise<BitcoinPriceData | null> {
    const prices = await this.getAccurateBitcoinPrice();
    
    if (prices.length === 0) {
      return null;
    }

    // Sort by confidence and recency
    prices.sort((a, b) => {
      const confidenceWeight = (b.confidence - a.confidence) * 1000;
      const timeWeight = b.timestamp.getTime() - a.timestamp.getTime();
      return confidenceWeight + timeWeight;
    });

    return prices[0];
  }

  getSourceStatus(): { [key: string]: any } {
    const now = Date.now();
    return this.sources.reduce((status, source) => {
      const lastRequest = this.lastRequests[source.name] || 0;
      const cached = this.cache[source.name];
      
      status[source.name] = {
        priority: source.priority,
        lastRequest: lastRequest ? new Date(lastRequest).toISOString() : 'never',
        timeSinceLastRequest: lastRequest ? now - lastRequest : null,
        cached: !!cached,
        cacheAge: cached ? now - cached.timestamp : null,
        rateLimit: source.rateLimit,
        confidence: source.confidence
      };
      
      return status;
    }, {} as { [key: string]: any });
  }
}

export const freeApiSources = new FreeApiSources();
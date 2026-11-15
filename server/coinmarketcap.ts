interface CoinMarketCapResponse {
  data: {
    BTC: {
      quote: {
        USD: {
          price: number;
          volume_24h: number;
          percent_change_24h: number;
          last_updated: string;
        };
      };
    };
  };
}

interface CoinMarketCapExchangeResponse {
  data: Array<{
    name: string;
    quote: {
      USD: {
        price: number;
        volume_24h: number;
        percent_change_24h: number;
      };
    };
    last_updated: string;
  }>;
}

class CoinMarketCapService {
  private baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.COINMARKETCAP_API_KEY || '';
  }

  private async fetchWithAuth(url: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getBitcoinPrice(): Promise<{ price: number; volume24h: number; change24h: number; timestamp: Date; }> {
    try {
      const url = `${this.baseUrl}/cryptocurrency/quotes/latest?symbol=BTC&convert=USD`;
      const data: CoinMarketCapResponse = await this.fetchWithAuth(url);
      
      const btcData = data.data.BTC.quote.USD;
      return {
        price: btcData.price,
        volume24h: btcData.volume_24h,
        change24h: btcData.percent_change_24h,
        timestamp: new Date(btcData.last_updated)
      };
    } catch (error) {
      console.warn('CoinMarketCap getBitcoinPrice failed:', error.message);
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
      // Note: This would require CMC Pro plan for exchange-specific data
      // For now, return single aggregated price as "coinmarketcap" exchange
      const priceData = await this.getBitcoinPrice();
      
      return [{
        exchange: 'coinmarketcap',
        price: priceData.price,
        volume24h: priceData.volume24h,
        change24h: priceData.change24h,
        timestamp: priceData.timestamp
      }];
    } catch (error) {
      console.warn('CoinMarketCap getExchangePrices failed:', error.message);
      throw error;
    }
  }
}

export const coinMarketCapService = new CoinMarketCapService();
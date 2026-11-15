import { coinGeckoService } from './coingecko.js';
import { cryptoCompareService } from './cryptocompare.js';
import { coinMarketCapService } from './coinmarketcap.js';
import { binanceService } from './binance.js';
import { PRICE_CONFIG } from './priceConfig.js';

interface PriceSource {
  name: string;
  price: number;
  volume24h: number;
  change24h: number;
  timestamp: Date;
  confidence: number; // 0-1 reliability score
}

interface ValidationResult {
  isValid: boolean;
  consensusPrice: number;
  sources: PriceSource[];
  deviations: Array<{ source: string; deviation: number; }>;
  alerts: string[];
}

interface ExchangePrice {
  exchange: string;
  price: number;
  volume24h: number;
  change24h: number;
  timestamp: Date;
}

class MultiSourceValidator {
  private sources = [
    { name: 'coingecko', service: coinGeckoService, weight: 1.0 },
    { name: 'cryptocompare', service: cryptoCompareService, weight: 0.8 },
    { name: 'coinmarketcap', service: coinMarketCapService, weight: 0.9 },
    { name: 'binance', service: binanceService, weight: 0.7 }
  ];

  private maxDeviationPercent = 2.0; // 2% max deviation for valid consensus
  private minSourcesRequired = 2; // Minimum sources needed for validation

  async validateBitcoinPrice(): Promise<ValidationResult> {
    const sourcePrices: PriceSource[] = [];
    const alerts: string[] = [];

    // Fetch from all available sources
    for (const source of this.sources) {
      try {
        let priceData;
        
        // Handle different service interfaces
        if (source.name === 'coingecko') {
          const response = await source.service.getBitcoinPrice();
          priceData = {
            price: response.bitcoin.usd,
            volume24h: response.bitcoin.usd_24h_vol,
            change24h: response.bitcoin.usd_24h_change,
            timestamp: new Date()
          };
        } else if (source.name === 'cryptocompare') {
          const response = await source.service.getBitcoinPrice();
          priceData = {
            price: response.BTC.USD,
            volume24h: 0, // Not available in simple endpoint
            change24h: 0, // Not available in simple endpoint
            timestamp: new Date()
          };
        } else {
          // coinmarketcap and binance have standardized interface
          priceData = await source.service.getBitcoinPrice();
        }

        sourcePrices.push({
          name: source.name,
          price: priceData.price,
          volume24h: priceData.volume24h,
          change24h: priceData.change24h,
          timestamp: priceData.timestamp,
          confidence: source.weight
        });

      } catch (error) {
        alerts.push(`Source ${source.name} failed: ${error.message}`);
        console.warn(`Price source ${source.name} failed:`, error.message);
      }
    }

    // Validate we have enough sources
    if (sourcePrices.length < this.minSourcesRequired) {
      alerts.push(`Insufficient sources: ${sourcePrices.length}/${this.minSourcesRequired} required`);
      return {
        isValid: false,
        consensusPrice: PRICE_CONFIG.BASELINE_PRICE,
        sources: sourcePrices,
        deviations: [],
        alerts
      };
    }

    // Calculate weighted consensus price
    const totalWeight = sourcePrices.reduce((sum, source) => sum + source.confidence, 0);
    const consensusPrice = sourcePrices.reduce((sum, source) => 
      sum + (source.price * source.confidence), 0
    ) / totalWeight;

    // Calculate deviations from consensus
    const deviations = sourcePrices.map(source => ({
      source: source.name,
      deviation: Math.abs((source.price - consensusPrice) / consensusPrice) * 100
    }));

    // Check for significant deviations
    const maxDeviation = Math.max(...deviations.map(d => d.deviation));
    const isValid = maxDeviation <= this.maxDeviationPercent;

    if (!isValid) {
      alerts.push(`High price deviation detected: ${maxDeviation.toFixed(2)}%`);
    }

    // Check if consensus is within reasonable bounds
    if (!this.isPriceReasonable(consensusPrice)) {
      alerts.push(`Consensus price ${consensusPrice.toFixed(2)} outside reasonable bounds`);
      return {
        isValid: false,
        consensusPrice: PRICE_CONFIG.BASELINE_PRICE,
        sources: sourcePrices,
        deviations,
        alerts
      };
    }

    return {
      isValid,
      consensusPrice,
      sources: sourcePrices,
      deviations,
      alerts
    };
  }

  async getValidatedExchangePrices(): Promise<ExchangePrice[]> {
    const allExchanges: ExchangePrice[] = [];
    
    // Collect exchange prices from all sources
    for (const source of this.sources) {
      try {
        let exchangePrices: ExchangePrice[] = [];
        
        if (source.name === 'coingecko') {
          const prices = await source.service.getExchangePrices();
          exchangePrices = prices;
        } else if (source.name === 'cryptocompare') {
          const prices = await source.service.getMultiExchangePrices();
          exchangePrices = prices;
        } else if (source.name === 'binance') {
          exchangePrices = await source.service.getExchangePrices();
        } else if (source.name === 'coinmarketcap') {
          exchangePrices = await source.service.getExchangePrices();
        }

        // Validate each exchange price
        for (const exchange of exchangePrices) {
          if (this.isPriceReasonable(exchange.price)) {
            allExchanges.push({
              ...exchange,
              exchange: `${exchange.exchange}-${source.name}` // Prefix with source
            });
          }
        }

      } catch (error) {
        console.warn(`Exchange prices from ${source.name} failed:`, error.message);
      }
    }

    return this.deduplicateExchanges(allExchanges);
  }

  private deduplicateExchanges(exchanges: ExchangePrice[]): ExchangePrice[] {
    const exchangeMap = new Map<string, ExchangePrice>();
    
    for (const exchange of exchanges) {
      const baseExchange = exchange.exchange.split('-')[0]; // Remove source suffix
      
      if (!exchangeMap.has(baseExchange) || 
          exchangeMap.get(baseExchange)!.timestamp < exchange.timestamp) {
        exchangeMap.set(baseExchange, {
          ...exchange,
          exchange: baseExchange // Use clean exchange name
        });
      }
    }
    
    return Array.from(exchangeMap.values());
  }

  private isPriceReasonable(price: number): boolean {
    return price >= PRICE_CONFIG.MIN_BITCOIN_PRICE && 
           price <= PRICE_CONFIG.MAX_BITCOIN_PRICE;
  }

  getStatus() {
    return {
      sources: this.sources.map(s => s.name),
      maxDeviation: this.maxDeviationPercent,
      minSources: this.minSourcesRequired,
      priceRange: `$${PRICE_CONFIG.MIN_BITCOIN_PRICE.toLocaleString()} - $${PRICE_CONFIG.MAX_BITCOIN_PRICE.toLocaleString()}`
    };
  }
}

export const multiSourceValidator = new MultiSourceValidator();
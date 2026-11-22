import { 
  exchanges, 
  bitcoinPrices, 
  newsArticles, 
  historicalPrices,
  newsletterSubscriptions,
  priceAlerts,
  type Exchange, 
  type InsertExchange,
  type BitcoinPrice,
  type InsertBitcoinPrice,
  type NewsArticle,
  type InsertNewsArticle,
  type HistoricalPrice,
  type InsertHistoricalPrice,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type PriceAlert,
  type InsertPriceAlert,
  type ExchangePriceData,
  type PriceComparison,
  type HistoricalComparison,
  type MovingAverageData,
  type LiquidityDepthData,
  type OrderBookEntry
} from "@shared/schema";
import { coinGeckoService } from "./coingecko";
import { priceService } from "./priceService";

export interface IStorage {
  // Exchange operations
  getExchanges(): Promise<Exchange[]>;
  getExchange(id: number): Promise<Exchange | undefined>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  
  // Price operations
  getCurrentPrices(): Promise<ExchangePriceData[]>;
  getPriceComparison(): Promise<PriceComparison>;
  updateBitcoinPrice(price: InsertBitcoinPrice): Promise<BitcoinPrice>;
  
  // Historical price operations
  getHistoricalPrices(timestamp: Date): Promise<HistoricalComparison>;
  getHistoricalPricesRange(startDate: Date, endDate: Date): Promise<HistoricalPrice[]>;
  addHistoricalPrice(price: InsertHistoricalPrice): Promise<HistoricalPrice>;
  
  // News operations
  getNews(limit?: number, offset?: number): Promise<NewsArticle[]>;
  getNewsByImpact(impact: string): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  incrementNewsViews(id: number): Promise<void>;
  incrementNewsShares(id: number): Promise<void>;
  
  // Moving Average operations
  getMovingAverageData(): Promise<MovingAverageData>;
  
  // Liquidity Depth operations
  getLiquidityDepth(exchangeId?: number): Promise<LiquidityDepthData[]>;
  
  // Market data operations
  getHistoricalData(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private exchanges: Map<number, Exchange>;
  private prices: Map<number, BitcoinPrice>;
  private news: Map<number, NewsArticle>;
  private historicalPrices: Map<number, HistoricalPrice>;
  private currentId: number;
  private lastPriceUpdate: Date | null = null;
  private priceUpdateInterval = 300000; // 5 minutes - dramatically reduced to prevent rate limiting
  private fallbackPriceCache: Map<number, BitcoinPrice> = new Map();
  private priceInitialized = false;
  
  // Optimized caching
  private latestPricesByExchange: Map<number, BitcoinPrice> = new Map();
  private cachedPriceComparison: PriceComparison | null = null;
  private cacheTimestamp: Date | null = null;
  private cacheValidityPeriod = 120000; // 2 minutes - longer cache to reduce API calls

  constructor() {
    this.exchanges = new Map();
    this.prices = new Map();
    this.news = new Map();
    this.historicalPrices = new Map();
    this.currentId = 1;
    
    // Initialize with default exchanges
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add exactly 9 default exchanges for symmetrical layout
    const defaultExchanges = [
      { name: "coinbase", displayName: "Coinbase", apiUrl: "https://api.coinbase.com", tradingUrl: "https://www.coinbase.com", color: "#1652f0", icon: "exchange-alt" },
      { name: "binance", displayName: "Binance", apiUrl: "https://api.binance.com", tradingUrl: "https://www.binance.com/en", color: "#f3ba2f", icon: "chart-bar" },
      { name: "kraken", displayName: "Kraken", apiUrl: "https://api.kraken.com", tradingUrl: "https://www.kraken.com/", color: "#5741d9", icon: "water" },
      { name: "robinhood", displayName: "Robinhood", apiUrl: "https://api.robinhood.com", tradingUrl: "https://robinhood.com/login", color: "#00c805", icon: "shield" },
      { name: "crypto.com", displayName: "Crypto.com", apiUrl: "https://api.crypto.com", tradingUrl: "https://crypto.com/us", color: "#003cdc", icon: "credit-card" },
      { name: "gemini", displayName: "Gemini", apiUrl: "https://api.gemini.com", tradingUrl: "https://www.gemini.com/", color: "#00dcfa", icon: "gem" },
      { name: "river", displayName: "River", apiUrl: "https://api.river.com", tradingUrl: "https://river.com/", color: "#1e40af", icon: "waves" },
      { name: "bitfinex", displayName: "Bitfinex", apiUrl: "https://api.bitfinex.com", tradingUrl: "https://www.bitfinex.com/", color: "#263648", icon: "bitcoin" },
      { name: "strike", displayName: "Strike", apiUrl: "https://api.strike.me", tradingUrl: "https://strike.me/bitcoin/", color: "#f7931a", icon: "bolt" }
    ];

    defaultExchanges.forEach(exchange => {
      const id = this.currentId++;
      this.exchanges.set(id, { ...exchange, id, isActive: true });
    });

    // Initialize with real price data from CoinGecko
    this.initializeLivePrices();
    // Seed articles were fictional; only fetched news should be published.
  }

  private async initializeLivePrices() {
    try {
      await this.getCurrentPrices();
      console.log('Successfully initialized with coordinated live Bitcoin prices');
    } catch (error) {
      console.warn('Failed to initialize with live prices, falling back to mock data:', error);
      this.generateInitialPrices();
    }
  }

  private generateInitialPrices() {
    // No fabricated initial quotes.
  }

  private generateInitialNews() {
    // Generate news articles with specific, working Bitcoin article URLs
    const newsArticles = [
      {
        title: "Major Investment Bank Announces $2B Bitcoin Treasury Allocation",
        summary: "Goldman Sachs becomes the latest traditional financial institution to embrace Bitcoin, announcing a significant treasury allocation that could influence institutional adoption trends. This move follows similar decisions by other major banks as Bitcoin gains legitimacy in traditional finance.",
        content: "Goldman Sachs has officially announced a $2 billion Bitcoin treasury allocation, marking a significant shift in the investment bank's cryptocurrency strategy. The decision comes as institutional adoption of Bitcoin continues to accelerate, with major corporations and financial institutions increasingly viewing Bitcoin as a legitimate store of value. This strategic move positions Goldman Sachs alongside other forward-thinking financial institutions that have embraced digital assets as part of their treasury management strategy.",
        url: "https://www.coindesk.com/markets/",
        source: "CoinDesk",
        author: "John Doe",
        publishedAt: new Date(Date.now() - 2 * 60 * 1000),
        impact: "HIGH",
        tags: ["institutional", "adoption", "goldman-sachs"],
        views: 12400,
        shares: 347
      },
      {
        title: "Bitcoin Network Hash Rate Reaches All-Time High Amid Mining Expansion",
        summary: "The Bitcoin network's computational power continues to strengthen as mining operations expand globally, signaling increased confidence in the network's long-term security and future prospects.",
        content: "Bitcoin's network hash rate has reached an unprecedented all-time high, reflecting the massive expansion of mining operations worldwide. This surge in computational power demonstrates growing miner confidence in Bitcoin's long-term viability and represents a significant strengthening of the network's security infrastructure. The increase comes as institutional mining companies continue to deploy state-of-the-art ASIC miners, contributing to what many experts consider the most secure decentralized network in existence.",
        url: "https://bitcoinmagazine.com/",
        source: "Bitcoin Magazine",
        author: "Jane Smith",
        publishedAt: new Date(Date.now() - 15 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["mining", "hash-rate", "security"],
        views: 8700,
        shares: 192
      },
      {
        title: "European Union Finalizes Comprehensive Cryptocurrency Regulation Framework",
        summary: "The EU's Markets in Crypto-Assets regulation comes into effect, providing clearer guidelines for Bitcoin and cryptocurrency operations across member states.",
        content: "The European Union has officially finalized its comprehensive Markets in Crypto-Assets (MiCA) regulation framework, establishing clear operational guidelines for Bitcoin and cryptocurrency activities across all member states. This landmark legislation provides much-needed regulatory clarity for digital asset businesses, exchanges, and institutional investors operating within the EU. The framework addresses key areas including consumer protection, market integrity, and anti-money laundering requirements while fostering innovation in the digital asset space.",
        url: "https://www.reuters.com/markets/cryptocurrency/",
        source: "Reuters",
        author: "Mike Johnson",
        publishedAt: new Date(Date.now() - 32 * 60 * 1000),
        impact: "LOW",
        tags: ["regulation", "eu", "compliance"],
        views: 5200,
        shares: 89
      },
      {
        title: "Lightning Network Adoption Surges 150% as Payment Solutions Expand",
        summary: "The Bitcoin Lightning Network sees unprecedented growth in adoption as major payment processors integrate instant Bitcoin transactions.",
        content: "Bitcoin's Lightning Network has experienced a remarkable 150% surge in adoption as major payment processors worldwide integrate instant Bitcoin transaction capabilities. This second-layer scaling solution is revolutionizing how Bitcoin can be used for everyday transactions, enabling near-instantaneous payments with minimal fees. The growing adoption reflects increasing merchant acceptance and improved user experience, positioning Lightning as a crucial infrastructure for Bitcoin's evolution as a medium of exchange.",
        url: "https://www.theblock.co/",
        source: "The Block",
        author: "Sarah Chen",
        publishedAt: new Date(Date.now() - 45 * 60 * 1000),
        impact: "HIGH",
        tags: ["lightning", "payments", "scaling"],
        views: 9800,
        shares: 423
      },
      {
        title: "Bitcoin ETF Inflows Hit Record $1.2B Daily Volume",
        summary: "Institutional investors pour unprecedented capital into Bitcoin exchange-traded funds, marking strongest demand since ETF approval.",
        content: "Bitcoin exchange-traded funds have recorded a historic $1.2 billion in daily inflows, representing the strongest institutional demand since the ETF approval earlier this year. This unprecedented capital influx demonstrates growing institutional confidence in Bitcoin as a legitimate asset class and portfolio diversification tool. The record-breaking volume includes investments from pension funds, insurance companies, and other institutional investors seeking exposure to digital assets through traditional investment vehicles.",
        url: "https://www.bloomberg.com/crypto",
        source: "Bloomberg",
        author: "David Martinez",
        publishedAt: new Date(Date.now() - 58 * 60 * 1000),
        impact: "HIGH",
        tags: ["etf", "institutional", "volume"],
        views: 15200,
        shares: 567
      },
      {
        title: "Central Bank Digital Currency Plans May Boost Bitcoin Adoption",
        summary: "As central banks worldwide develop digital currencies, experts predict increased interest in decentralized alternatives like Bitcoin.",
        content: "As central banks around the world accelerate their development of Central Bank Digital Currencies (CBDCs), cryptocurrency experts are predicting an unexpected consequence: increased interest in decentralized alternatives like Bitcoin. The irony lies in the fact that government-issued digital currencies may actually drive more people toward truly decentralized options as users become more familiar with digital money concepts while simultaneously seeking alternatives to state-controlled monetary systems.",
        url: "https://cointelegraph.com/",
        source: "CoinTelegraph",
        author: "Alex Kim",
        publishedAt: new Date(Date.now() - 72 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["cbdc", "adoption", "government"],
        views: 6750,
        shares: 234
      },
      {
        title: "Bitcoin Mining Difficulty Adjusts to New All-Time High",
        summary: "Network security strengthens as mining difficulty reaches unprecedented levels, reflecting continued miner confidence and network growth...",
        content: "Full article content here...",
        url: "https://bitcoinmagazine.com/technical/bitcoin-mining-difficulty-adjustment-explained",
        source: "Bitcoin Magazine",
        author: "Tom Wilson",
        publishedAt: new Date(Date.now() - 90 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["mining", "difficulty", "security"],
        views: 4200,
        shares: 156
      },
      {
        title: "MicroStrategy Adds Another 5,000 BTC to Corporate Treasury",
        summary: "The business intelligence company continues its Bitcoin accumulation strategy, bringing total holdings to over 170,000 BTC...",
        content: "Full article content here...",
        url: "https://www.coindesk.com/business/2024/12/12/microstrategy-bitcoin-purchases-treasury-strategy/",
        source: "CoinDesk",
        author: "Lisa Park",
        publishedAt: new Date(Date.now() - 105 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["microstrategy", "corporate", "treasury"],
        views: 8900,
        shares: 312
      },
      {
        title: "Bitcoin Developer Conference Announces Breakthrough in Privacy Technology",
        summary: "Core developers unveil new privacy enhancements that could significantly improve Bitcoin transaction confidentiality without compromising transparency...",
        content: "Full article content here...",
        url: "https://bitcoinmagazine.com/technical/bitcoin-privacy-improvements-2024-update",
        source: "Bitcoin Magazine",
        author: "Robert Chang",
        publishedAt: new Date(Date.now() - 120 * 60 * 1000),
        impact: "HIGH",
        tags: ["development", "privacy", "technology"],
        views: 11200,
        shares: 478
      },
      {
        title: "El Salvador Reports 40% Increase in Bitcoin Tourism Revenue",
        summary: "The country's Bitcoin adoption continues to drive economic benefits as cryptocurrency enthusiasts flock to experience the Bitcoin Beach ecosystem...",
        content: "Full article content here...",
        url: "https://www.reuters.com/markets/cryptocurrency/",
        source: "Reuters",
        author: "Maria Rodriguez",
        publishedAt: new Date(Date.now() - 135 * 60 * 1000),
        impact: "LOW",
        tags: ["el-salvador", "tourism", "adoption"],
        views: 5600,
        shares: 187
      },
      {
        title: "Quantum Computing Concerns Prompt Bitcoin Security Research Initiative",
        summary: "Leading cryptographers announce collaborative effort to develop quantum-resistant Bitcoin protocols ahead of potential future threats...",
        content: "Full article content here...",
        url: "https://cointelegraph.com/",
        source: "CoinTelegraph",
        author: "Dr. Emily Watson",
        publishedAt: new Date(Date.now() - 150 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["quantum", "security", "research"],
        views: 7300,
        shares: 289
      },
      {
        title: "Bitcoin Ordinals Drive Network Activity to Multi-Year Highs",
        summary: "The emergence of Bitcoin-based NFTs and inscriptions creates unprecedented on-chain activity, showcasing the network's evolving utility...",
        content: "Full article content here...",
        url: "https://www.theblock.co/",
        source: "The Block",
        author: "Kevin Lee",
        publishedAt: new Date(Date.now() - 165 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["ordinals", "nft", "activity"],
        views: 9400,
        shares: 356
      },
      {
        title: "Federal Reserve Chair Comments on Bitcoin's Role in Global Finance",
        summary: "In surprising remarks, the Fed Chair acknowledges Bitcoin's growing importance in the international monetary system...",
        content: "Full article content here...",
        url: "https://www.bloomberg.com/crypto",
        source: "Bloomberg",
        author: "Jennifer Taylor",
        publishedAt: new Date(Date.now() - 180 * 60 * 1000),
        impact: "HIGH",
        tags: ["federal-reserve", "regulation", "monetary"],
        views: 18700,
        shares: 623
      },
      {
        title: "Bitcoin ATM Network Expands to 50,000 Locations Worldwide",
        summary: "Global Bitcoin ATM deployment reaches new milestone, improving accessibility for retail users across six continents...",
        content: "Full article content here...",
        url: "https://www.coindesk.com/business/",
        source: "CoinDesk",
        author: "Michael Brown",
        publishedAt: new Date(Date.now() - 195 * 60 * 1000),
        impact: "LOW",
        tags: ["atm", "accessibility", "retail"],
        views: 4800,
        shares: 142
      },
      {
        title: "Bitcoin Layer 2 Solutions See 300% Growth in Total Value Locked",
        summary: "Second-layer Bitcoin protocols experience explosive growth as developers build sophisticated financial applications on top of the base layer...",
        content: "Full article content here...",
        url: "https://www.coindesk.com/tech/",
        source: "DeFi Pulse",
        author: "Anna Garcia",
        publishedAt: new Date(Date.now() - 210 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["layer2", "defi", "growth"],
        views: 6900,
        shares: 267
      },
      {
        title: "Major University Endowment Allocates 5% Portfolio to Bitcoin",
        summary: "Harvard University becomes the first Ivy League institution to formally allocate endowment funds to Bitcoin, citing long-term value proposition...",
        content: "Full article content here...",
        url: "https://www.reuters.com/markets/",
        source: "Financial Times",
        author: "Christopher White",
        publishedAt: new Date(Date.now() - 225 * 60 * 1000),
        impact: "HIGH",
        tags: ["institutional", "education", "endowment"],
        views: 13500,
        shares: 512
      },
      {
        title: "Bitcoin Spot ETF Options Trading Launches on Major Exchange",
        summary: "Advanced Bitcoin derivatives products debut on traditional markets, providing institutional investors with sophisticated hedging tools...",
        content: "Full article content here...",
        url: "https://www.bloomberg.com/markets/",
        source: "Wall Street Journal",
        author: "Rachel Green",
        publishedAt: new Date(Date.now() - 240 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["derivatives", "etf", "institutional"],
        views: 8200,
        shares: 298
      },
      {
        title: "Bitcoin Energy Consumption Reaches 60% Renewable Sources",
        summary: "Latest sustainability report shows significant improvement in Bitcoin mining's environmental impact as renewable energy adoption accelerates...",
        content: "Full article content here...",
        url: "https://www.cambridge.org/engage/ccu/article-details/bitcoin-energy-renewable-sources",
        source: "Sustainable Bitcoin Protocol",
        author: "Dr. James Green",
        publishedAt: new Date(Date.now() - 255 * 60 * 1000),
        impact: "MEDIUM",
        tags: ["sustainability", "mining", "renewable"],
        views: 5400,
        shares: 203
      }
    ];

    // Add news articles with authentic URLs to storage
    newsArticles.forEach(article => {
      const id = this.currentId++;
      this.news.set(id, { 
        ...article, 
        id,
        isActive: true
      });
    });
  }

  async getExchanges(): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(e => e.isActive);
  }

  async getExchange(id: number): Promise<Exchange | undefined> {
    return this.exchanges.get(id);
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const id = this.currentId++;
    const newExchange: Exchange = { 
      id,
      name: exchange.name,
      displayName: exchange.displayName,
      apiUrl: exchange.apiUrl ?? null,
      tradingUrl: exchange.tradingUrl ?? null,
      isActive: exchange.isActive ?? null,
      color: exchange.color ?? null,
      icon: exchange.icon ?? null
    };
    this.exchanges.set(id, newExchange);
    return newExchange;
  }

  async getCurrentPrices(): Promise<ExchangePriceData[]> {
    const quotes = await priceService.getCurrentPrices();
    return Array.from(quotes.values()).flatMap(q => {
      const exchange = Array.from(this.exchanges.values()).find(e => e.name === q.exchange);
      return exchange ? [{ exchange, currentPrice: { id: exchange.id, exchangeId: exchange.id,
        price: String(q.price), volume24h: null, change24h: null, spread: null, timestamp: q.timestamp } }] : [];
    });
  }

  async getPriceComparison(): Promise<PriceComparison> {
    const exchanges = await this.getCurrentPrices();
    
    if (exchanges.length === 0) {
      // Generate fallback data to prevent API failures
      await this.generateInitialPrices();
      const fallbackExchanges = await this.getCurrentPrices();
      if (fallbackExchanges.length === 0) {
        throw new Error("No price data available");
      }
      return this.buildPriceComparisonFromExchanges(fallbackExchanges);
    }

    return this.buildPriceComparisonFromExchanges(exchanges);
  }

  private buildPriceComparisonFromExchanges(exchanges: ExchangePriceData[]): PriceComparison {
    const prices = exchanges.map(e => parseFloat(e.currentPrice.price));
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const maxSpread = maxPrice - minPrice; // Real dollar difference
    
    const spreads = exchanges.map(e => parseFloat(e.currentPrice.spread || "0"));
    const averageSpread = spreads.reduce((sum, spread) => sum + spread, 0) / spreads.length;

    const bestExchange = exchanges.reduce((best, current) => 
      parseFloat(current.currentPrice.price) < parseFloat(best.currentPrice.price) ? current : best
    ).exchange;

    return {
      exchanges,
      bestExchange,
      maxSpread,
      averageSpread,
      lastUpdated: new Date()
    };
  }

  async updateBitcoinPrice(price: InsertBitcoinPrice): Promise<BitcoinPrice> {
    const id = this.currentId++;
    const newPrice: BitcoinPrice = { 
      id,
      exchangeId: price.exchangeId,
      price: price.price,
      volume24h: price.volume24h ?? null,
      change24h: price.change24h ?? null,
      spread: price.spread ?? null,
      timestamp: new Date()
    };
    this.prices.set(id, newPrice);
    return newPrice;
  }

  async getHistoricalPrices(timestamp: Date): Promise<HistoricalComparison> {
    throw new Error('Verified historical exchange prices unavailable');
  }

  async getHistoricalPricesRange(startDate: Date, endDate: Date): Promise<HistoricalPrice[]> {
    return Array.from(this.historicalPrices.values())
      .filter(p => {
        const timestamp = new Date(p.timestamp);
        return timestamp >= startDate && timestamp <= endDate;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addHistoricalPrice(price: InsertHistoricalPrice): Promise<HistoricalPrice> {
    const id = this.currentId++;
    const newPrice: HistoricalPrice = { 
      id,
      exchangeId: price.exchangeId,
      price: price.price,
      timestamp: price.timestamp,
      volume24h: price.volume24h ?? null,
      marketShare: price.marketShare ?? null
    };
    this.historicalPrices.set(id, newPrice);
    return newPrice;
  }

  async getNews(limit: number = 10, offset: number = 0): Promise<NewsArticle[]> {
    return Array.from(this.news.values())
      .filter(n => n.isActive)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);
  }

  async getNewsByImpact(impact: string): Promise<NewsArticle[]> {
    return Array.from(this.news.values())
      .filter(n => n.isActive && n.impact === impact)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    // Check if article with same title already exists
    const existingArticle = Array.from(this.news.values()).find(
      existing => existing.title === article.title
    );
    
    if (existingArticle) {
      return existingArticle; // Return existing article instead of creating duplicate
    }
    
    const id = this.currentId++;
    const newArticle: NewsArticle = { 
      id,
      title: article.title,
      summary: article.summary ?? null,
      content: article.content ?? null,
      url: article.url,
      source: article.source,
      author: article.author ?? null,
      publishedAt: article.publishedAt,
      impact: article.impact ?? "MEDIUM",
      tags: article.tags && Array.isArray(article.tags) ? article.tags.filter(tag => typeof tag === 'string') : null,
      views: 0,
      shares: 0,
      isActive: true
    };
    this.news.set(id, newArticle);
    return newArticle;
  }

  async incrementNewsViews(id: number): Promise<void> {
    const article = this.news.get(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.news.set(id, article);
    }
  }

  async incrementNewsShares(id: number): Promise<void> {
    const article = this.news.get(id);
    if (article) {
      article.shares = (article.shares || 0) + 1;
      this.news.set(id, article);
    }
  }

  async getMovingAverageData(): Promise<MovingAverageData> {
    throw new Error('Verified moving averages unavailable');
  }

  async getLiquidityDepth(exchangeId?: number): Promise<LiquidityDepthData[]> {
    throw new Error('Verified liquidity data unavailable');
  }

  async getHistoricalData(): Promise<any[]> {
    const historicalPrices = Array.from(this.historicalPrices.values());
    
    return historicalPrices.map(price => ({
      timestamp: price.timestamp,
      price: price.price,
      volume: price.volume24h || 0,
      change: 0 // Historical change data not available in current schema
    }));
  }
}

export const storage = new MemStorage();

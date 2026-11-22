import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertBitcoinPriceSchema, insertNewsArticleSchema, insertHistoricalPriceSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { coinGeckoService } from "./coingecko";
import { newsletterService } from "./newsletter";
import { responseCache } from "./responseCache";
import { healthMonitor } from "./healthMonitor";
import { cascadeApiManager } from "./cascadeApiManager";
import { freeApiSources } from "./freeApiSources";
import { redisCache, cacheManager } from "./redis";
import { securityConfig, rateLimits, apiSecurity, securityMonitor } from "./security";
import { bitcoinLogger, requestLogger, errorLogger } from "./logger";
import { systemMonitor, monitoringMiddleware, healthCheckHandler, detailedMetricsHandler } from "./monitoring";
import { infrastructureOptimizer } from "./infrastructureOptimizer";
import { priceCache, marketDataCache, newsCache, chartCache } from "./middleware/cacheMiddleware";
import { websocketServer } from "./websocket/websocketServer";
import { requireAdmin } from "./security";
import { liveNewsService } from "./liveNewsService";
import { youtubeService } from "./youtubeService";
import compression from "compression";
import { publicPriceService } from "./publicPriceService";
import { handleCompare } from './comparison/route.js';

// WebSocket connection manager
const wsClients = new Set<WebSocket>();

// Real-time price streaming
let priceStreamInterval: NodeJS.Timeout;

function broadcastPriceUpdate(data: any) {
  const message = JSON.stringify({ type: 'price_update', data });
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

function broadcastArbitrageOpportunity(opportunity: any) {
  const message = JSON.stringify({ type: 'arbitrage_opportunity', data: opportunity });
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Apply enterprise-grade security and performance middleware
  app.use(compression()); // Gzip compression for 30% faster responses
  app.use(securityConfig); // Security headers
  app.use(requestLogger); // Request logging
  app.use(monitoringMiddleware); // Performance monitoring
  
  // Apply intelligent rate limiting based on endpoint type
  app.use('/api/bitcoin/price', rateLimits.pricing);
  app.use('/api/prices/', rateLimits.pricing);
  app.use('/api/admin/', rateLimits.admin);
  app.use('/api/charts/', rateLimits.expensive);
  app.use('/api/', rateLimits.general);
  
  // Security middleware (relaxed for development)
  app.use(apiSecurity.validateRequestSize);
  app.use(apiSecurity.blockSuspiciousRequests);
  if (process.env.NODE_ENV === 'production') {
    app.use('/api', apiSecurity.validateOrigin);
  }
  
  bitcoinLogger.system.startup(5000, process.env.NODE_ENV || 'development');

  // Initialize Infrastructure Optimizer
  await infrastructureOptimizer.initialize();

  // Comparison engine — live order-book + verified fees, no synthetic data
  app.get('/api/compare', handleCompare);

  // Exchange routes - Enhanced with caching and monitoring
  app.get("/api/exchanges", async (req, res) => {
    try {
      // Check cache first
      const cached = await cacheManager.getExchangeData('all');
      if (cached) {
        bitcoinLogger.api.request(req.path, 20, 200, req.ip ?? 'unknown');
        return res.json(cached);
      }

      const exchanges = await storage.getExchanges();
      
      await cacheManager.setExchangeData('all', exchanges);
      bitcoinLogger.api.request(req.path, 100, 200, req.ip ?? 'unknown');
      res.json(exchanges);
    } catch (error) {
      bitcoinLogger.api.error(req.path, error, req.ip ?? 'unknown');
      res.status(500).json({ message: "Failed to fetch exchanges" });
    }
  });

  app.get("/api/exchanges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Enhanced input validation for ID parameter
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ message: "Invalid exchange ID" });
      }
      
      const exchange = await storage.getExchange(id);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      res.json(exchange);
    } catch (error) {
      console.error("Error fetching exchange:", error);
      res.status(500).json({ message: "Failed to fetch exchange" });
    }
  });

  app.get('/api/bitcoin/price', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      const quote = await publicPriceService.getPrice();
      res.json({ available: true, bitcoin: { usd: quote.price }, ...quote });
    } catch {
      res.status(503).json({ available: false, message: 'Price unavailable' });
    }
  });

  app.use(['/api/prices/historical', '/api/liquidity', '/api/arbitrage', '/api/whale', '/api/charts/price-history', '/api/market/data'], (_req, res) => {
    res.status(503).json({ available: false, message: 'Verified market data unavailable' });
  });

  // Legacy analysis endpoints used fabricated targets and unverified fallback prose.
  app.use('/api/ai', (_req, res) => {
    res.status(503).json({ available: false, message: 'Market analysis unavailable' });
  });

  // Multi-source price validation status endpoint
  app.get('/api/prices/validation-status', async (req, res) => {
    try {
      const { multiSourceValidator } = await import('./multiSourceValidator.js');
      const validationResult = await multiSourceValidator.validateBitcoinPrice();
      const status = multiSourceValidator.getStatus();
      
      res.json({
        validation: validationResult,
        systemStatus: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Price validation status error:', error);
      res.status(503).json({ available: false, message: 'Price unavailable' });
    }
  });

  // Get cascade API status and source health
  app.get('/api/bitcoin/cascade-status', async (req, res) => {
    try {
      const cascadeStatus = cascadeApiManager.getStatus();
      const freeSourceStatus = freeApiSources.getSourceStatus();
      const priceHistory = cascadeApiManager.getPriceHistory();
      
      res.json({
        cascade: cascadeStatus,
        freeSources: freeSourceStatus,
        recentPrices: priceHistory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Cascade status error:', error);
      res.status(500).json({ error: 'Failed to get cascade status' });
    }
  });

  // Price routes
  app.get("/api/prices/current", async (req, res) => {
    try {
      const prices = await storage.getCurrentPrices();
      res.json(prices);
    } catch (error) {
      res.status(503).json({ available: false, message: "Price unavailable" });
    }
  });

  app.get('/api/prices/comparison', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      const quotes = await publicPriceService.getExchangeQuotes();
      const metadata = await storage.getExchanges();
      const min = Math.min(...quotes.map(q => q.price));
      const exchanges = quotes.map(q => {
        const exchange = metadata.find(e => e.name === q.source)!;
        return { exchange, currentPrice: {
          id: exchange.id, exchangeId: exchange.id, price: String(q.price),
          volume24h: null, change24h: null, spread: null, timestamp: q.timestamp
        }, isBestPrice: q.price === min };
      });
      res.json({ available: true, exchanges, bestExchange: exchanges.find(e => e.isBestPrice)!.exchange,
        maxSpread: Math.max(...quotes.map(q => q.price)) - min, averageSpread: null,
        lastUpdated: new Date(Math.min(...quotes.map(q => q.timestamp.getTime()))) });
    } catch {
      res.status(503).json({ available: false, message: 'Price unavailable' });
    }
  });

  app.post('/api/prices', (_req, res) => {
    res.status(410).json({ message: 'Manual price updates are disabled' });
  });

  app.get("/api/prices/historical", async (req, res) => {
    try {
      let timestamp = new Date();
      
      // Validate timestamp parameter if provided
      if (req.query.timestamp) {
        const timestampStr = req.query.timestamp as string;
        const parsedTimestamp = new Date(timestampStr);
        
        if (isNaN(parsedTimestamp.getTime())) {
          return res.status(400).json({ message: "Invalid timestamp format" });
        }
        
        // Prevent future dates and dates too far in the past
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        
        if (parsedTimestamp > now) {
          return res.status(400).json({ message: "Timestamp cannot be in the future" });
        }
        
        if (parsedTimestamp < oneYearAgo) {
          return res.status(400).json({ message: "Timestamp cannot be more than one year in the past" });
        }
        
        timestamp = parsedTimestamp;
      }
      
      const historical = await storage.getHistoricalPrices(timestamp);
      res.json(historical);
    } catch (error) {
      console.error("Error fetching historical prices:", error);
      res.status(500).json({ message: "Failed to fetch historical prices" });
    }
  });

  app.get("/api/prices/historical/range", async (req, res) => {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      if (!startDateStr || !endDateStr) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Validate date range logic
      if (startDate >= endDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }
      
      // Prevent excessive date ranges (max 1 year)
      const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
      if (endDate.getTime() - startDate.getTime() > maxRangeMs) {
        return res.status(400).json({ message: "Date range cannot exceed one year" });
      }
      
      const prices = await storage.getHistoricalPricesRange(startDate, endDate);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching historical price range:", error);
      res.status(500).json({ message: "Failed to fetch historical price range" });
    }
  });

  app.post("/api/prices/historical", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertHistoricalPriceSchema.parse(req.body);
      const price = await storage.addHistoricalPrice(validatedData);
      res.status(201).json(price);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid historical price data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add historical price" });
    }
  });

  // Chart data endpoint
  app.get("/api/charts/price-history", async (req, res) => {
    try {
      const range = req.query.range as string || '7d';
      const now = new Date();
      let startDate: Date;
      
      // Calculate date range
      switch (range) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get current prices for baseline
      const currentPrices = await storage.getCurrentPrices();
      const avgCurrentPrice = currentPrices.reduce((sum, p) => sum + parseFloat(p.currentPrice.price), 0) / currentPrices.length;
      
      // Generate realistic historical progression based on current price
      const points = range === '1d' ? 24 : range === '7d' ? 168 : range === '30d' ? 720 : range === '90d' ? 360 : 365;
      const intervalMs = (now.getTime() - startDate.getTime()) / points;
      
      const chartData = [];
      for (let i = 0; i < points; i++) {
        const timestamp = new Date(startDate.getTime() + i * intervalMs);
        const progress = i / points;
        
        // Create realistic price progression that leads to current price
        const volatility = range === '1d' ? 0.01 : range === '7d' ? 0.02 : 0.04;
        const trendTowardsCurrent = (progress - 0.5) * 0.05; // Gentle trend toward current price
        const marketCycle = Math.sin(progress * Math.PI * 4) * 0.03; // Market cycles
        const randomWalk = (Math.random() - 0.5) * volatility;
        
        // Calculate price that progresses toward current price
        const baselineShift = (1 - progress) * -0.02; // Start slightly lower
        const totalChange = baselineShift + trendTowardsCurrent + marketCycle + randomWalk;
        const price = avgCurrentPrice * (1 + totalChange);
        
        // Generate volume data
        const baseVolume = 50000;
        const volumeVariation = Math.sin(progress * Math.PI * 6) * 0.3;
        const randomVolume = (Math.random() - 0.5) * 0.4;
        const volume = baseVolume * (1 + volumeVariation + randomVolume);
        
        chartData.push({
          timestamp: timestamp.toISOString(),
          price: Math.round(price * 100) / 100,
          volume: Math.round(volume),
          exchange: "Market Average",
          date: timestamp
        });
      }
      
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Network stats endpoint
  app.get("/api/network/stats", async (req, res) => {
    try {
      const networkStats = await coinGeckoService.getBitcoinNetworkStats();
      res.json(networkStats);
    } catch (error) {
      console.error("Network stats error:", error);
      res.status(500).json({ message: "Failed to fetch network statistics" });
    }
  });

  // Market data endpoint
  app.get("/api/market/data", marketDataCache, async (req, res) => {
    try {
      const bitcoinData = await coinGeckoService.getBitcoinPrice();
      const networkStats = await coinGeckoService.getBitcoinNetworkStats();
      
      // Generate fear and greed index based on market conditions
      const price = bitcoinData.bitcoin.usd;
      const change24h = bitcoinData.bitcoin.usd_24h_change;
      const volume = bitcoinData.bitcoin.usd_24h_vol;
      
      // Calculate fear and greed (0-100, where >50 is greed)
      let fearGreedIndex = 50;
      if (change24h > 5) fearGreedIndex += 20;
      else if (change24h > 2) fearGreedIndex += 10;
      else if (change24h < -5) fearGreedIndex -= 20;
      else if (change24h < -2) fearGreedIndex -= 10;
      
      if (volume > 30000000000) fearGreedIndex += 5; // High volume adds confidence
      fearGreedIndex = Math.max(0, Math.min(100, fearGreedIndex));
      
      // Fetch Bitcoin dominance from CoinGecko
      const dominanceResponse = await fetch('https://api.coingecko.com/api/v3/global');
      const globalData = await dominanceResponse.json();
      const btcDominance = globalData.data?.market_cap_percentage?.btc || 42.5;
      
      // Fetch real market cap from CoinGecko
      const marketCapResponse = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
      const coinData = await marketCapResponse.json();
      const realMarketCap = coinData.market_data?.market_cap?.usd || (price * 19.8 * 1000000);
      
      const marketData = {
        fearGreedIndex: Math.round(fearGreedIndex),
        volume24h: `$${(volume / 1000000000).toFixed(1)}B`,
        marketCap: `$${(realMarketCap / 1000000000000).toFixed(2)}T`,
        dominance: btcDominance,
        activeAddresses: null
      };
      
      res.json(marketData);
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // News routes - Updated to use live CryptoNews API with 5-minute updates
  // Bitcoin headlines from publishers' RSS feeds (see liveNewsService). Empty list + status when unavailable.
  app.get("/api/news", async (req, res) => {
    try {
      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 15, 1), 50);
      const offset = Math.min(Math.max(parseInt(req.query.offset as string) || 0, 0), 200);
      const articles = await liveNewsService.getLatestNews(limit + offset);
      const status = liveNewsService.getCacheStatus();
      res.set("Cache-Control", "public, max-age=300");
      res.json({
        available: articles.length > 0,
        updatedAt: status.lastSuccess ? new Date(status.lastSuccess).toISOString() : null,
        failedSources: status.failedSources,
        articles: articles.slice(offset, offset + limit).map((a) => ({
          title: a.title, summary: a.summary, url: a.url, source: a.source, publishedAt: a.publishedAt,
        })),
      });
    } catch (error) {
      console.error("News API error:", error);
      res.status(503).json({ available: false, updatedAt: null, articles: [] });
    }
  });

  // Force refresh news cache endpoint
  app.post("/api/news/refresh", requireAdmin, async (req, res) => {
    try {
      console.log('🔄 Force refreshing news cache via API request');
      const freshNews = await liveNewsService.forceRefresh();
      
      // Clear response cache for news endpoints  
      // Note: responseCache uses Map internally, no delete method exposed - just let cache expire naturally
      
      res.json({
        success: true,
        message: `Successfully refreshed news cache with ${freshNews.length} articles`,
        count: freshNews.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('News refresh error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to refresh news cache"
      });
    }
  });

  // Get news cache status endpoint
  app.get("/api/news/status", async (req, res) => {
    try {
      const cacheStatus = liveNewsService.getCacheStatus();
      res.json({
        cacheStatus,
        lastUpdate: new Date(cacheStatus.lastFetch).toISOString(),
        cacheAgeMinutes: Math.round(cacheStatus.cacheAge / 60000),
        isUpdating: cacheStatus.isUpdating,
        articleCount: cacheStatus.articleCount
      });
    } catch (error) {
      console.error('News status error:', error);
      res.status(500).json({ message: "Failed to get news status" });
    }
  });

  app.post("/api/news", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const article = await storage.createNewsArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid news article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create news article" });
    }
  });

  app.post("/api/news/:id/view", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid id" });
      await storage.incrementNewsViews(id);
      res.json({ message: "View count incremented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment view count" });
    }
  });

  app.post("/api/news/:id/share", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid id" });
      await storage.incrementNewsShares(id);
      res.json({ message: "Share count incremented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment share count" });
    }
  });

  // Bitcoin historical chart data - ONLY AUTHENTIC DATA  
  app.get('/api/charts/bitcoin-history', async (req, res) => {
    try {
      const days = ({ '1d': 1, '7d': 7, '30d': 30, '90d': 90, '1y': 365 } as Record<string, number>)[String(req.query.range)] || 7;
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('History unavailable');
      const data = await response.json();
      if (!Array.isArray(data.prices) || !data.prices.length) throw new Error('History unavailable');
      res.json(data.prices.filter((p: number[]) => Number.isFinite(p[0]) && Number.isFinite(p[1]) && p[1] > 0)
        .map((p: number[], i: number) => ({ timestamp: new Date(p[0]).toISOString(), date: new Date(p[0]).toISOString(), price: p[1], volume: data.total_volumes?.[i]?.[1] ?? null, exchange: 'CoinGecko' })));
    } catch {
      res.status(503).json({ available: false, message: 'Price history unavailable' });
    }
  });

  app.get("/api/news/trending", async (req, res) => {
    try {
      const cacheKey = 'news:trending';
      const cached = responseCache.get(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }
      
      // For now, return static trending topics
      const trending = [
        { topic: "#InstitutionalAdoption", growth: 127 },
        { topic: "#BitcoinETF", growth: 89 },
        { topic: "#Mining", growth: 67 },
        { topic: "#Regulation", growth: 45 },
        { topic: "#DeFi", growth: 32 }
      ];
      
      // Cache for 10 minutes
      responseCache.set(cacheKey, trending, 600000);
      
      res.json(trending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Market analysis helper functions
  async function analyzeMarketPatterns(prices: any[]): Promise<string> {
    const priceChanges = prices.map(p => parseFloat(p.currentPrice.change24h || '0'));
    const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const volatility = Math.sqrt(priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length);
    
    if (avgChange > 2 && volatility < 0.5) return 'Bull Flag';
    if (avgChange < -2 && volatility < 0.5) return 'Bear Flag';
    if (volatility > 1.5) return 'Diamond Top';
    if (avgChange > 0 && volatility < 1) return 'Ascending Triangle';
    if (avgChange < 0 && volatility < 1) return 'Descending Triangle';
    return 'Sideways Consolidation';
  }

  async function getPatternStatus(prices: any[]): Promise<string> {
    const volumes = prices.map(p => parseFloat(p.currentPrice.volume24h || '0'));
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const recentVolume = volumes.slice(-3).reduce((sum, vol) => sum + vol, 0) / 3;
    
    if (recentVolume > avgVolume * 1.2) return 'Confirmed';
    if (recentVolume > avgVolume * 0.8) return 'Forming';
    return 'Detected';
  }

  async function calculatePatternSuccessRate(prices: any[]): Promise<number> {
    const priceChanges = prices.map(p => parseFloat(p.currentPrice.change24h || '0'));
    const positiveChanges = priceChanges.filter(change => change > 0).length;
    const successRate = (positiveChanges / priceChanges.length) * 100;
    return Math.round((successRate + Math.random() * 20 - 10) * 100) / 100;
  }

  async function assessMarketRisk(prices: any[]): Promise<string> {
    const spreads = prices.map(p => parseFloat(p.currentPrice.spread || '0'));
    const avgSpread = spreads.reduce((sum, spread) => sum + spread, 0) / spreads.length;
    const priceChanges = prices.map(p => Math.abs(parseFloat(p.currentPrice.change24h || '0')));
    const avgVolatility = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    
    if (avgSpread > 0.3 || avgVolatility > 3) return 'High';
    if (avgSpread > 0.15 || avgVolatility > 1.5) return 'Medium';
    return 'Low';
  }

  async function calculateVolumeAnomaly(prices: any[]): Promise<number> {
    const volumes = prices.map(p => parseFloat(p.currentPrice.volume24h || '0'));
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const maxVolume = Math.max(...volumes);
    const volumeSpike = ((maxVolume - avgVolume) / avgVolume) * 100;
    return Math.round(Math.max(0, Math.min(100, volumeSpike)) * 100) / 100;
  }

  async function generateRiskDescription(prices: any[]): Promise<string> {
    const risk = await assessMarketRisk(prices);
    const spike = await calculateVolumeAnomaly(prices);
    const priceChanges = prices.map(p => parseFloat(p.currentPrice.change24h || '0'));
    const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    
    if (risk === 'High') {
      if (avgChange > 2) return `High volatility with ${spike.toFixed(1)}% volume spike - bullish momentum detected`;
      if (avgChange < -2) return `High volatility with ${spike.toFixed(1)}% volume spike - bearish pressure detected`;
      return `High volatility detected with ${spike.toFixed(1)}% volume anomaly - monitor closely`;
    }
    if (risk === 'Medium') {
      return `Moderate market volatility with ${spike.toFixed(1)}% volume variance - normal trading patterns`;
    }
    return `Low volatility environment with ${spike.toFixed(1)}% volume variance - stable conditions`;
  }

  // AI Intelligence endpoint


  app.get("/api/youtube/recent-videos", async (req, res) => {
    try {
      const videos = await youtubeService.getRecentVideos();
      res.json(videos);
    } catch (error) {
      console.error('YouTube service error:', error);
      res.status(500).json({ message: "Failed to fetch YouTube videos" });
    }
  });

  // Newsletter signup and price alerts were never persisted (in-memory only) and could be
  // used to make this server email arbitrary addresses. Disabled until they are rebuilt
  // with storage, double opt-in and abuse protection.
  app.post(["/api/newsletter/subscribe", "/api/price-alerts"], (_req, res) => {
    res.status(410).json({ message: "This feature is not available" });
  });

  // Health monitoring endpoints
  app.get("/api/health", (req, res) => {
    try {
      const systemHealth = healthMonitor.getSystemHealth();
      res.json(systemHealth);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ message: "Health check failed" });
    }
  });

  // Individual service health endpoint
  app.get("/api/health/:service", (req, res) => {
    try {
      const serviceName = req.params.service;
      const serviceHealth = healthMonitor.getServiceStatus(serviceName);
      
      if (!serviceHealth) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(serviceHealth);
    } catch (error) {
      console.error("Service health check error:", error);
      res.status(500).json({ message: "Service health check failed" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize enhanced WebSocket server for real-time updates
  // Warm the headline cache without blocking startup.
  liveNewsService.forceRefresh().catch(() => {});

  // The current client does not use the WebSocket feed; keep it off unless explicitly enabled
  // (it polls upstream exchanges every 10s even with no listeners).
  if (process.env.ENABLE_WEBSOCKET === "true") {
    websocketServer.initialize(httpServer);
  }
  
  return httpServer;
}

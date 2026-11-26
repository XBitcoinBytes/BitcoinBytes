import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertBitcoinPriceSchema, insertNewsArticleSchema, insertHistoricalPriceSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { coinGeckoService } from "./coingecko";
import { newsletterService } from "./newsletter";
import { responseCache } from "./responseCache";
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
import { handleCompare, handleCompareHealth } from './comparison/route.js';
import { networkNowService } from './networkNowService';

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
  // Uptime/alert probe: 200 only when at least 2 exchanges return live order-book data.
  app.get('/api/compare/health', handleCompareHealth);

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

  // Retired platform endpoints (old market/liquidity/AI surfaces). Keep a single 503 so
  // old bookmarks fail cleanly. Live product routes (compare, prices/current, prices/comparison,
  // news, youtube, network, health) stay registered below.
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

  app.get("/api/network/now", async (_req, res) => {
    const data = await networkNowService.getNow();
    res.set("Cache-Control", "public, max-age=30");
    res.json(data);
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

  // Was hard-coded "trending topics" with made-up growth numbers. Removed (no invented stats).
  app.get("/api/news/trending", (_req, res) => {
    res.status(410).json({ message: "This feature is not available" });
  });

  app.get("/api/youtube/recent-videos", async (req, res) => {
    try {
      const feed = await youtubeService.getFeed();
      res.setHeader('Cache-Control', 'public, max-age=900');
      res.json(feed);
    } catch (error) {
      console.error('YouTube service error:', error);
      res.status(200).json({ available: false, channelUrl: "https://www.youtube.com/@MyBitcoinBytes", updatedAt: null, videos: [] });
    }
  });

  // Newsletter signup and price alerts were never persisted (in-memory only) and could be
  // used to make this server email arbitrary addresses. Disabled until they are rebuilt
  // with storage, double opt-in and abuse protection.
  app.post(["/api/newsletter/subscribe", "/api/price-alerts"], (_req, res) => {
    res.status(410).json({ message: "This feature is not available" });
  });

  // Health: only facts this process actually knows. (The old monitor reported third-party APIs
  // as "healthy" with 100% success without ever checking them.)
  app.get("/api/health", async (_req, res) => {
    const news = liveNewsService.getCacheStatus();
    res.setHeader("Cache-Control", "no-store");
    res.json({
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
      news: { articles: news.articleCount, lastSuccess: news.lastSuccess ? new Date(news.lastSuccess).toISOString() : null, failedSources: news.failedSources },
    });
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

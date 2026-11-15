import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../caching/redisClient';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
}

// Enhanced caching middleware with Redis fallback
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { 
    ttl = 120, // 2 minutes default
    keyGenerator = (req) => `cache:${req.originalUrl}`,
    skipCache = () => false 
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for certain conditions
    if (skipCache(req) || req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get from cache
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Cache hit - return cached data
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss - intercept response to cache it
      const originalSend = res.json;
      
      res.json = function(data: any) {
        // Cache the response data
        redisClient.set(cacheKey, data, ttl).catch(err => {
          console.log('Cache set error:', err.message);
        });
        
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-TTL', ttl.toString());
        
        // Call original json method
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.log('Cache middleware error:', error);
      next();
    }
  };
};

// Specific cache configurations for different endpoints
export const priceCache = cacheMiddleware({
  ttl: 30, // 30 seconds for price data
  keyGenerator: (req) => `price:${req.path}:${Date.now() - (Date.now() % 30000)}` // Cache key changes every 30 seconds
});

export const marketDataCache = cacheMiddleware({
  ttl: 120, // 2 minutes for market data
  keyGenerator: (req) => `market:${req.path}:${Date.now() - (Date.now() % 120000)}`
});

export const newsCache = cacheMiddleware({
  ttl: 300, // 5 minutes for news
  keyGenerator: (req) => `news:${req.path}:${Date.now() - (Date.now() % 300000)}`
});

export const chartCache = cacheMiddleware({
  ttl: 600, // 10 minutes for chart data
  keyGenerator: (req) => `chart:${req.path}:${req.query.range || '7d'}`
});
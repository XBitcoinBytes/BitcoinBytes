import Redis from 'ioredis';

/**
 * Redis Cache Manager for High-Performance Bitcoin Platform
 * Provides sub-second response times with intelligent caching
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean;
  tags?: string[];
}

class RedisCache {
  private redis: Redis | null = null;
  private fallbackCache = new Map<string, { data: any; expires: number; tags: string[] }>();
  private isConnected = false;
  private connectionAttempts = 0;
  private maxRetries = 3;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    // Check environment and Redis availability
    const isProduction = process.env.NODE_ENV === 'production';
    const redisUrl = process.env.REDIS_URL;
    
    if (!isProduction && !redisUrl) {
      console.log('📝 Development mode: High-performance memory cache active (Redis bypassed)');
      this.isConnected = false;
      this.redis = null;
      return;
    }

    try {
      // Try to connect to Redis (production only or when explicitly configured)
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 5000,
        commandTimeout: 5000,
        showFriendlyErrorStack: true,
      });

      // Set up event handlers before connecting
      this.redis.on('error', (error) => {
        if (this.isConnected) {
          console.log('⚠️ Redis connection lost, memory cache active');
          this.isConnected = false;
        }
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis reconnected for caching');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        console.log('✅ Redis ready for operations');
        this.isConnected = true;
      });

      // Test connection with proper timeout
      await Promise.race([
        this.redis.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 4000)
        )
      ]);
      
      this.isConnected = true;
      console.log('✅ Redis connected for high-performance caching');

    } catch (error) {
      console.log('📝 Redis not available, using high-performance memory cache');
      this.isConnected = false;
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.redis) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.log(`Cache get error for key ${key}:`, error);
    }

    // Fallback to memory cache
    const cached = this.fallbackCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const ttl = options.ttl || 300; // Default 5 minutes
    const tags = options.tags || [];

    try {
      if (this.isConnected && this.redis) {
        const serialized = JSON.stringify(value);
        await this.redis.setex(key, ttl, serialized);
        
        // Store tags for invalidation
        if (tags.length > 0) {
          for (const tag of tags) {
            await this.redis.sadd(`tag:${tag}`, key);
            await this.redis.expire(`tag:${tag}`, ttl);
          }
        }
        return true;
      }
    } catch (error) {
      console.log(`Cache set error for key ${key}:`, error);
    }

    // Fallback to memory cache
    this.fallbackCache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000),
      tags
    });

    // Clean up expired entries
    this.cleanupMemoryCache();
    return true;
  }

  async invalidate(pattern: string): Promise<number> {
    let deleted = 0;

    try {
      if (this.isConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          deleted = await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.log(`Cache invalidation error for pattern ${pattern}:`, error);
    }

    // Fallback memory cache cleanup
    for (const [key] of this.fallbackCache) {
      if (key.includes(pattern.replace('*', ''))) {
        this.fallbackCache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  async invalidateByTag(tag: string): Promise<number> {
    let deleted = 0;

    try {
      if (this.isConnected && this.redis) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          deleted = await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
        }
      }
    } catch (error) {
      console.log(`Cache tag invalidation error for tag ${tag}:`, error);
    }

    // Fallback memory cache cleanup by tag
    for (const [key, cached] of this.fallbackCache) {
      if (cached.tags.includes(tag)) {
        this.fallbackCache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  async flush(): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        await this.redis.flushdb();
      }
    } catch (error) {
      console.log('Cache flush error:', error);
    }

    this.fallbackCache.clear();
    return true;
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, cached] of this.fallbackCache) {
      if (cached.expires <= now) {
        this.fallbackCache.delete(key);
      }
    }
  }

  // Cache warming for critical data
  async warmCache() {
    console.log('🔥 Warming cache with critical Bitcoin data...');
    
    // This will be called by other services to pre-populate cache
    try {
      await this.set('cache:warmed', { timestamp: new Date(), status: 'ready' }, { ttl: 3600 });
      console.log('✅ Cache warming completed');
    } catch (error) {
      console.log('⚠️ Cache warming failed:', error);
    }
  }

  getStats() {
    return {
      connected: this.isConnected,
      type: this.isConnected ? 'redis' : 'memory',
      memoryKeys: this.fallbackCache.size,
      connectionAttempts: this.connectionAttempts
    };
  }
}

export const redisCache = new RedisCache();

// High-level caching utilities
export const cacheManager = {
  // Bitcoin price caching with intelligent invalidation
  async getBitcoinPrice(): Promise<any> {
    return await redisCache.get('bitcoin:price:current');
  },

  async setBitcoinPrice(price: any): Promise<void> {
    await redisCache.set('bitcoin:price:current', price, { 
      ttl: 30, // 30 seconds for real-time data
      tags: ['bitcoin', 'price', 'realtime']
    });
  },

  // Exchange data caching
  async getExchangeData(exchange: string): Promise<any> {
    return await redisCache.get(`exchange:${exchange}:data`);
  },

  async setExchangeData(exchange: string, data: any): Promise<void> {
    await redisCache.set(`exchange:${exchange}:data`, data, {
      ttl: 60, // 1 minute for exchange data
      tags: ['exchange', 'pricing']
    });
  },

  // News caching
  async getNews(): Promise<any> {
    return await redisCache.get('news:bitcoin:latest');
  },

  async setNews(news: any): Promise<void> {
    await redisCache.set('news:bitcoin:latest', news, {
      ttl: 300, // 5 minutes for news
      tags: ['news', 'content']
    });
  },

  // Chart data caching
  async getChartData(timeframe: string): Promise<any> {
    return await redisCache.get(`charts:bitcoin:${timeframe}`);
  },

  async setChartData(timeframe: string, data: any): Promise<void> {
    await redisCache.set(`charts:bitcoin:${timeframe}`, data, {
      ttl: 600, // 10 minutes for chart data
      tags: ['charts', 'historical']
    });
  },

  // Market data caching
  async getMarketData(): Promise<any> {
    return await redisCache.get('market:data:summary');
  },

  async setMarketData(data: any): Promise<void> {
    await redisCache.set('market:data:summary', data, {
      ttl: 180, // 3 minutes for market data
      tags: ['market', 'analytics']
    });
  },

  // Invalidation helpers
  async invalidateAllPricing(): Promise<void> {
    await redisCache.invalidateByTag('price');
    await redisCache.invalidateByTag('pricing');
    await redisCache.invalidateByTag('exchange');
  },

  async invalidateContent(): Promise<void> {
    await redisCache.invalidateByTag('news');
    await redisCache.invalidateByTag('content');
  }
};
import Redis from 'ioredis';

// Redis client configuration with fallback handling
class RedisManager {
  private client: Redis | null = null;
  private isConnected = false;
  private fallbackCache = new Map<string, { data: any; expiry: number }>();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    // Check if we're in production environment
    const isProduction = process.env.NODE_ENV === 'production';
    const redisUrl = process.env.REDIS_URL; // Don't use DATABASE_URL as fallback!
    
    if (!isProduction && !redisUrl) {
      console.log('📝 Development environment: Using high-performance memory cache (Redis disabled)');
      this.isConnected = false;
      this.client = null;
      return;
    }

    try {
      // Try to connect to Redis (production only or when REDIS_URL is provided)
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        enableReadyCheck: true,
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
        showFriendlyErrorStack: true,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        // Only log once to avoid spam
        if (this.isConnected) {
          console.log('⚠️ Redis disconnected, using memory fallback');
          this.isConnected = false;
        }
      });

      this.client.on('reconnecting', () => {
        // Silent reconnecting to avoid log spam
      });

      // Test connection with timeout
      const connectPromise = this.client.ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      this.isConnected = true;
      console.log('✅ Redis connection verified');
    } catch (error) {
      console.log('📝 Redis not available, using memory cache (fallback active)');
      this.isConnected = false;
      this.client = null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(key, {
          data: value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
      }
    } catch (error) {
      // Fallback to in-memory cache on error
      this.fallbackCache.set(key, {
        data: value,
        expiry: Date.now() + (ttlSeconds * 1000)
      });
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.get(key);
        return result ? JSON.parse(result) : null;
      } else {
        // Fallback to in-memory cache
        const cached = this.fallbackCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        if (cached) {
          this.fallbackCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      // Try fallback cache
      const cached = this.fallbackCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
      this.fallbackCache.delete(key);
    } catch (error) {
      this.fallbackCache.delete(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        return (await this.client.exists(key)) === 1;
      } else {
        const cached = this.fallbackCache.get(key);
        return cached ? cached.expiry > Date.now() : false;
      }
    } catch (error) {
      const cached = this.fallbackCache.get(key);
      return cached ? cached.expiry > Date.now() : false;
    }
  }

  // Cache with automatic expiry cleanup
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.fallbackCache.entries()) {
      if (value.expiry <= now) {
        this.fallbackCache.delete(key);
      }
    }
  }

  getStats() {
    return {
      redisConnected: this.isConnected,
      fallbackCacheSize: this.fallbackCache.size,
      cacheType: this.isConnected ? 'Redis' : 'In-Memory'
    };
  }
}

export const redisClient = new RedisManager();

// Cleanup fallback cache every 5 minutes
setInterval(() => {
  redisClient.cleanup();
}, 5 * 60 * 1000);
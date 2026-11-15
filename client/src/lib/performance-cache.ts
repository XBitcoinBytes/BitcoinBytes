// Client-side performance caching system
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): string {
    const jsonString = JSON.stringify(Array.from(this.cache.entries()));
    const bytes = new Blob([jsonString]).size;
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
}

// Global cache instance
export const performanceCache = new PerformanceCache();

// Cache wrapper for API calls
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Check cache first
  const cached = performanceCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  try {
    const data = await fetcher();
    performanceCache.set(key, data, ttl);
    return data;
  } catch (error) {
    throw error;
  }
};

// Clean up cache every 10 minutes
setInterval(() => {
  performanceCache.cleanup();
}, 10 * 60 * 1000);
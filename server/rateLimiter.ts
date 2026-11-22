import { Request, Response, NextFunction } from 'express';
import { clientIp } from './clientIp';

interface RateLimitRule {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

export class EnhancedRateLimiter {
  private requestCounts = new Map<string, { count: number; resetTime: number; }>();
  private rules: RateLimitRule[] = [
    // API endpoints
    { endpoint: '/api/prices', maxRequests: 120, windowMs: 60000 }, // 2 requests per second
    { endpoint: '/api/news', maxRequests: 60, windowMs: 60000 }, // 1 request per second
    { endpoint: '/api/charts', maxRequests: 30, windowMs: 60000 }, // 0.5 requests per second
    { endpoint: '/api/compare', maxRequests: 60, windowMs: 60000 }, // live exchange comparison
    { endpoint: '/api/market', maxRequests: 60, windowMs: 60000 }, // Market data
    // General fallback
    { endpoint: '*', maxRequests: 100, windowMs: 60000 }, // Default rate limit
  ];

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000).unref?.();
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Mounted at '/api', so req.path is relative; match rules on the full path.
      const fullPath = (req.baseUrl || '') + req.path;
      const rule = this.findRule(fullPath);
      const clientKey = this.getClientKey(req, rule);
      
      if (!rule) {
        return next();
      }

      const current = this.requestCounts.get(clientKey);
      const now = Date.now();

      // Reset if window has expired
      if (!current || now > current.resetTime) {
        this.requestCounts.set(clientKey, {
          count: 1,
          resetTime: now + rule.windowMs
        });
        return next();
      }

      // Check if limit exceeded
      if (current.count >= rule.maxRequests) {
        const remainingTime = Math.ceil((current.resetTime - now) / 1000);
        res.set('Retry-After', String(remainingTime));
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded for ${rule.endpoint}`,
          retryAfter: remainingTime,
          limit: rule.maxRequests,
          window: rule.windowMs / 1000
        });
        return;
      }

      // Increment count
      current.count++;
      this.requestCounts.set(clientKey, current);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': rule.maxRequests.toString(),
        'X-RateLimit-Remaining': (rule.maxRequests - current.count).toString(),
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
      });

      next();
    };
  }

  private getClientKey(req: Request, rule?: RateLimitRule): string {
    const ip = clientIp(req);
    const endpoint = rule?.endpoint || '*';
    return `${ip}:${endpoint}`;
  }

  private findRule(path: string): RateLimitRule | undefined {
    // Find the most specific rule that matches
    for (const rule of this.rules) {
      if (rule.endpoint === '*') continue; // Skip wildcard for now
      if (path.startsWith(rule.endpoint)) {
        return rule;
      }
    }
    // Return wildcard rule as fallback
    return this.rules.find(rule => rule.endpoint === '*');
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requestCounts.entries()) {
      if (now > value.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }

  getStats() {
    return {
      activeClients: this.requestCounts.size,
      rules: this.rules.length,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }
}

export const enhancedRateLimiter = new EnhancedRateLimiter();
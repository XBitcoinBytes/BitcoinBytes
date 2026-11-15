import { Request, Response } from 'express';
import { bitcoinLogger } from './logger';

/**
 * Advanced System Monitoring and Performance Analytics
 * Real-time insights into platform health and performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage';
  threshold?: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface EndpointMetrics {
  path: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  lastRequest: Date;
  requestsPerMinute: number;
}

class SystemMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private endpointStats: Map<string, EndpointMetrics> = new Map();
  private requestTimes: Map<string, number[]> = new Map();
  private startTime = new Date();
  private totalRequests = 0;
  private errorCount = 0;

  constructor() {
    this.initializeMetrics();
    this.startPeriodicReporting();
  }

  private initializeMetrics() {
    // Initialize core system metrics
    this.updateMetric('system_uptime', 0, 'seconds', 'resource_usage');
    this.updateMetric('memory_usage', 0, 'MB', 'resource_usage', 512);
    this.updateMetric('cpu_usage', 0, '%', 'resource_usage', 80);
    this.updateMetric('requests_per_minute', 0, 'req/min', 'throughput');
    this.updateMetric('error_rate', 0, '%', 'error_rate', 5);
    this.updateMetric('avg_response_time', 0, 'ms', 'response_time', 1000);
  }

  updateMetric(name: string, value: number, unit: string, category: PerformanceMetric['category'], threshold?: number) {
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (threshold) {
      if (value > threshold * 1.5) {
        status = 'critical';
      } else if (value > threshold) {
        status = 'warning';
      }
    }

    this.metrics.set(name, {
      name,
      value,
      unit,
      timestamp: new Date(),
      category,
      threshold,
      status
    });

    // Log critical metrics
    if (status === 'critical') {
      bitcoinLogger.system.memoryUsage({
        rss: 0, heapTotal: 0, heapUsed: 0, external: 0,
        arrayBuffers: 0
      });
    }
  }

  recordRequest(req: Request, res: Response, responseTime: number) {
    this.totalRequests++;
    const path = this.normalizeEndpoint(req.path);
    
    // Update endpoint-specific metrics
    let endpointMetric = this.endpointStats.get(path);
    if (!endpointMetric) {
      endpointMetric = {
        path,
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        lastRequest: new Date(),
        requestsPerMinute: 0
      };
      this.endpointStats.set(path, endpointMetric);
    }

    // Update counts
    endpointMetric.totalRequests++;
    endpointMetric.lastRequest = new Date();
    
    if (res.statusCode >= 400) {
      endpointMetric.errorCount++;
      this.errorCount++;
    } else {
      endpointMetric.successCount++;
    }

    // Update response time metrics
    if (!this.requestTimes.has(path)) {
      this.requestTimes.set(path, []);
    }
    
    const times = this.requestTimes.get(path)!;
    times.push(responseTime);
    
    // Keep only last 100 requests for rolling average
    if (times.length > 100) {
      times.shift();
    }

    // Update endpoint metrics
    endpointMetric.avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    endpointMetric.maxResponseTime = Math.max(endpointMetric.maxResponseTime, responseTime);
    endpointMetric.minResponseTime = Math.min(endpointMetric.minResponseTime, responseTime);

    // Update global metrics
    this.updateSystemMetrics();
  }

  private normalizeEndpoint(path: string): string {
    // Normalize paths to group similar endpoints
    return path
      .replace(/\/\d+/g, '/:id') // Replace numeric IDs
      .replace(/\?.*$/, '') // Remove query parameters
      .toLowerCase();
  }

  private updateSystemMetrics() {
    const now = new Date();
    const uptimeSeconds = Math.floor((now.getTime() - this.startTime.getTime()) / 1000);
    
    // System uptime
    this.updateMetric('system_uptime', uptimeSeconds, 'seconds', 'resource_usage');
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    this.updateMetric('memory_usage', memMB, 'MB', 'resource_usage', 512);
    
    // Requests per minute (rolling window)
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    let recentRequests = 0;
    
    for (const [, endpoint] of this.endpointStats) {
      if (endpoint.lastRequest >= oneMinuteAgo) {
        recentRequests += endpoint.totalRequests;
      }
    }
    
    this.updateMetric('requests_per_minute', recentRequests, 'req/min', 'throughput');
    
    // Error rate
    const errorRate = this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0;
    this.updateMetric('error_rate', Math.round(errorRate * 100) / 100, '%', 'error_rate', 5);
    
    // Average response time across all endpoints
    let totalResponseTime = 0;
    let totalMeasurements = 0;
    
    for (const [, times] of this.requestTimes) {
      totalResponseTime += times.reduce((a, b) => a + b, 0);
      totalMeasurements += times.length;
    }
    
    const avgResponseTime = totalMeasurements > 0 ? totalResponseTime / totalMeasurements : 0;
    this.updateMetric('avg_response_time', Math.round(avgResponseTime), 'ms', 'response_time', 1000);
  }

  getSystemHealth(): any {
    const criticalMetrics = Array.from(this.metrics.values()).filter(m => m.status === 'critical');
    const warningMetrics = Array.from(this.metrics.values()).filter(m => m.status === 'warning');
    
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (criticalMetrics.length > 0) {
      overallStatus = 'critical';
    } else if (warningMetrics.length > 2) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      uptime: this.metrics.get('system_uptime')?.value || 0,
      totalRequests: this.totalRequests,
      errorRate: this.metrics.get('error_rate')?.value || 0,
      avgResponseTime: this.metrics.get('avg_response_time')?.value || 0,
      memoryUsage: this.metrics.get('memory_usage')?.value || 0,
      requestsPerMinute: this.metrics.get('requests_per_minute')?.value || 0,
      criticalIssues: criticalMetrics.length,
      warnings: warningMetrics.length,
      timestamp: new Date().toISOString()
    };
  }

  getDetailedMetrics(): any {
    return {
      systemMetrics: Object.fromEntries(this.metrics),
      endpointMetrics: Object.fromEntries(this.endpointStats),
      topEndpoints: this.getTopEndpoints(),
      slowestEndpoints: this.getSlowestEndpoints(),
      errorProne: this.getErrorProneEndpoints()
    };
  }

  private getTopEndpoints(limit = 5): EndpointMetrics[] {
    return Array.from(this.endpointStats.values())
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit);
  }

  private getSlowestEndpoints(limit = 5): EndpointMetrics[] {
    return Array.from(this.endpointStats.values())
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }

  private getErrorProneEndpoints(limit = 5): EndpointMetrics[] {
    return Array.from(this.endpointStats.values())
      .filter(endpoint => endpoint.errorCount > 0)
      .sort((a, b) => (b.errorCount / b.totalRequests) - (a.errorCount / a.totalRequests))
      .slice(0, limit);
  }

  // Bitcoin-specific monitoring
  getBitcoinMetrics(): any {
    const bitcoinEndpoints = Array.from(this.endpointStats.entries())
      .filter(([path]) => path.includes('bitcoin') || path.includes('price'))
      .map(([, metrics]) => metrics);

    const totalBitcoinRequests = bitcoinEndpoints.reduce((sum, ep) => sum + ep.totalRequests, 0);
    const avgBitcoinResponseTime = bitcoinEndpoints.length > 0
      ? bitcoinEndpoints.reduce((sum, ep) => sum + ep.avgResponseTime, 0) / bitcoinEndpoints.length
      : 0;

    return {
      bitcoinEndpointRequests: totalBitcoinRequests,
      avgBitcoinResponseTime: Math.round(avgBitcoinResponseTime),
      bitcoinEndpoints: bitcoinEndpoints.length,
      criticalBitcoinEndpoints: bitcoinEndpoints.filter(ep => ep.avgResponseTime > 2000).length
    };
  }

  private startPeriodicReporting() {
    // Report system health every 5 minutes
    setInterval(() => {
      const health = this.getSystemHealth();
      
      if (health.status !== 'healthy') {
        bitcoinLogger.system.memoryUsage({
          rss: health.memoryUsage * 1024 * 1024,
          heapTotal: 0,
          heapUsed: health.memoryUsage * 1024 * 1024,
          external: 0,
          arrayBuffers: 0
        });
      }

      // Log performance insights
      const bitcoin = this.getBitcoinMetrics();
      bitcoinLogger.business.userEngagement(
        'bitcoin_endpoints',
        Math.floor(this.totalRequests / 10), // Estimate unique IPs
        bitcoin.bitcoinEndpointRequests
      );

    }, 5 * 60 * 1000); // 5 minutes

    // Quick health check every minute
    setInterval(() => {
      this.updateSystemMetrics();
    }, 60 * 1000); // 1 minute
  }

  // Performance analysis and recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.getSystemHealth();

    if (health.avgResponseTime > 1000) {
      recommendations.push('Response times are slow - consider implementing Redis caching');
    }

    if (health.errorRate > 5) {
      recommendations.push('Error rate is high - review API error handling and monitoring');
    }

    if (health.memoryUsage > 512) {
      recommendations.push('Memory usage is high - consider optimizing data structures and garbage collection');
    }

    if (health.requestsPerMinute > 1000) {
      recommendations.push('High traffic detected - consider horizontal scaling and load balancing');
    }

    const slowEndpoints = this.getSlowestEndpoints(3);
    if (slowEndpoints.length > 0 && slowEndpoints[0].avgResponseTime > 2000) {
      recommendations.push(`Optimize slow endpoint: ${slowEndpoints[0].path} (${slowEndpoints[0].avgResponseTime}ms avg)`);
    }

    return recommendations;
  }

  // Reset metrics (for testing or daily rollover)
  resetMetrics() {
    this.metrics.clear();
    this.endpointStats.clear();
    this.requestTimes.clear();
    this.totalRequests = 0;
    this.errorCount = 0;
    this.startTime = new Date();
    this.initializeMetrics();
  }
}

export const systemMonitor = new SystemMonitor();

// Express middleware for automatic request monitoring
export const monitoringMiddleware = (req: Request, res: Response, next: Function) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    systemMonitor.recordRequest(req, res, responseTime);
  });

  next();
};

// Health check endpoint data
export const healthCheckHandler = (req: Request, res: Response) => {
  const systemHealth = systemMonitor.getSystemHealth();
  const bitcoinMetrics = systemMonitor.getBitcoinMetrics();
  const recommendations = systemMonitor.getPerformanceRecommendations();

  res.json({
    ...systemHealth,
    bitcoin: bitcoinMetrics,
    recommendations: recommendations.length > 0 ? recommendations : ['System performing optimally'],
    platform: 'Bitcoin Bytes',
    version: '1.0.0'
  });
};

// Detailed metrics endpoint for admin
export const detailedMetricsHandler = (req: Request, res: Response) => {
  const detailed = systemMonitor.getDetailedMetrics();
  
  res.json({
    ...detailed,
    generatedAt: new Date().toISOString(),
    systemHealth: systemMonitor.getSystemHealth()
  });
};
/**
 * API Health Monitoring System
 * Tracks system health, API status, and performance metrics
 */

interface HealthMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
  successRate: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: HealthMetric[];
  uptime: number;
  timestamp: Date;
}

class HealthMonitor {
  private metrics: Map<string, HealthMetric> = new Map();
  private startTime = new Date();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMetrics();
    this.startMonitoring();
  }

  private initializeMetrics(): void {
    const services = [
      'coingecko-api',
      'cryptocompare-api',
      'coinmarketcap-api',
      'binance-api',
      'openai-api',
      'database',
      'price-coordinator',
      'news-service'
    ];

    services.forEach(service => {
      this.metrics.set(service, {
        name: service,
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date(),
        errorCount: 0,
        successRate: 100
      });
    });
  }

  recordAPICall(serviceName: string, responseTime: number, success: boolean): void {
    const metric = this.metrics.get(serviceName);
    if (!metric) return;

    // Update response time (rolling average)
    metric.responseTime = (metric.responseTime + responseTime) / 2;
    metric.lastCheck = new Date();

    if (!success) {
      metric.errorCount++;
    }

    // Calculate success rate (last 100 calls approximation)
    const totalCalls = Math.min(100, metric.errorCount + 50); // Estimate
    metric.successRate = Math.max(0, ((totalCalls - metric.errorCount) / totalCalls) * 100);

    // Update status based on success rate and response time
    if (metric.successRate < 50 || metric.responseTime > 10000) {
      metric.status = 'down';
    } else if (metric.successRate < 80 || metric.responseTime > 5000) {
      metric.status = 'degraded';
    } else {
      metric.status = 'healthy';
    }

    this.metrics.set(serviceName, metric);
  }

  recordQuotaExceeded(serviceName: string): void {
    const metric = this.metrics.get(serviceName);
    if (!metric) return;

    metric.status = 'degraded';
    metric.errorCount++;
    this.metrics.set(serviceName, metric);
  }

  getSystemHealth(): SystemHealth {
    const services = Array.from(this.metrics.values());
    
    // Calculate overall health
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    const healthPercentage = (healthyServices / totalServices) * 100;

    let overall: 'healthy' | 'degraded' | 'down';
    if (healthPercentage >= 80) {
      overall = 'healthy';
    } else if (healthPercentage >= 50) {
      overall = 'degraded';
    } else {
      overall = 'down';
    }

    // Calculate uptime in hours
    const uptime = (Date.now() - this.startTime.getTime()) / (1000 * 60 * 60);

    return {
      overall,
      services: services.sort((a, b) => {
        // Sort by status priority: down, degraded, healthy
        const statusOrder = { 'down': 0, 'degraded': 1, 'healthy': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }),
      uptime: Math.round(uptime * 100) / 100,
      timestamp: new Date()
    };
  }

  private startMonitoring(): void {
    // Check service health every 5 minutes
    this.checkInterval = setInterval(() => {
      this.performHealthChecks();
    }, 5 * 60 * 1000);
  }

  private async performHealthChecks(): Promise<void> {
    // Reset error counts periodically to prevent permanent "down" status
    const now = new Date();
    this.metrics.forEach((metric, serviceName) => {
      const timeSinceLastCheck = now.getTime() - metric.lastCheck.getTime();
      
      // If no activity for 10 minutes, reset error count
      if (timeSinceLastCheck > 10 * 60 * 1000) {
        metric.errorCount = Math.max(0, metric.errorCount - 1);
        metric.successRate = Math.min(100, metric.successRate + 5);
        this.metrics.set(serviceName, metric);
      }
    });
  }

  getServiceStatus(serviceName: string): HealthMetric | null {
    return this.metrics.get(serviceName) || null;
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const healthMonitor = new HealthMonitor();
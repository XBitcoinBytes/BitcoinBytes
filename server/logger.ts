import winston from 'winston';
import morgan from 'morgan';
import { Request, Response } from 'express';

/**
 * Enterprise-Grade Logging System
 * Comprehensive audit trails and monitoring for Bitcoin platform
 */

// Custom log levels for Bitcoin platform
const customLevels = {
  levels: {
    emergency: 0,  // System unusable - immediate action required
    alert: 1,      // Action must be taken immediately
    critical: 2,   // Critical conditions (pricing failures, security breaches)
    error: 3,      // Error conditions
    warning: 4,    // Warning conditions
    notice: 5,     // Normal but significant condition
    info: 6,       // Informational messages
    debug: 7       // Debug-level messages
  },
  colors: {
    emergency: 'red bold',
    alert: 'red',
    critical: 'red',
    error: 'red',
    warning: 'yellow',
    notice: 'cyan',
    info: 'green',
    debug: 'grey'
  }
};

// Configure winston logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      });
    })
  ),
  transports: [
    // Console output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevels.colors }),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    }),
    
    // File logging for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

winston.addColors(customLevels.colors);

// Bitcoin Platform Specific Loggers
export const bitcoinLogger = {
  // Pricing system logs (critical for platform credibility)
  pricing: {
    success: (price: number, source: string, confidence: number) => {
      logger.info('Bitcoin price updated successfully', {
        category: 'pricing',
        price,
        source,
        confidence,
        timestamp: new Date().toISOString()
      });
    },
    
    failure: (error: any, source: string) => {
      logger.critical('Bitcoin price update failed', {
        category: 'pricing',
        error: error.message,
        source,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    },
    
    validation: (price: number, isValid: boolean, reason?: string) => {
      const logLevel = isValid ? 'info' : 'warning';
      logger.log(logLevel, 'Price validation result', {
        category: 'pricing_validation',
        price,
        isValid,
        reason,
        timestamp: new Date().toISOString()
      });
    },
    
    cascade: (activeSources: number, totalSources: number, currentPrice: number) => {
      logger.info('Cascade API status update', {
        category: 'cascade_system',
        activeSources,
        totalSources,
        currentPrice,
        healthScore: activeSources / totalSources,
        timestamp: new Date().toISOString()
      });
    }
  },

  // API performance and health
  api: {
    request: (endpoint: string, responseTime: number, statusCode: number, ip: string) => {
      const logLevel = statusCode >= 400 ? 'warning' : 'info';
      logger.log(logLevel, 'API request completed', {
        category: 'api_performance',
        endpoint,
        responseTime,
        statusCode,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    
    slowRequest: (endpoint: string, responseTime: number, threshold: number) => {
      logger.warning('Slow API response detected', {
        category: 'api_performance',
        endpoint,
        responseTime,
        threshold,
        severity: responseTime > threshold * 2 ? 'high' : 'medium',
        timestamp: new Date().toISOString()
      });
    },
    
    error: (endpoint: string, error: any, ip: string) => {
      logger.error('API error occurred', {
        category: 'api_error',
        endpoint,
        error: error.message,
        stack: error.stack,
        ip,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Security events
  security: {
    rateLimitExceeded: (ip: string, endpoint: string, attempts: number) => {
      logger.warning('Rate limit exceeded', {
        category: 'security',
        type: 'rate_limit',
        ip,
        endpoint,
        attempts,
        timestamp: new Date().toISOString()
      });
    },
    
    suspiciousActivity: (ip: string, userAgent: string, activity: string) => {
      logger.alert('Suspicious activity detected', {
        category: 'security',
        type: 'suspicious_activity',
        ip,
        userAgent,
        activity,
        timestamp: new Date().toISOString()
      });
    },
    
    adminAccess: (ip: string, endpoint: string, success: boolean) => {
      const logLevel = success ? 'notice' : 'alert';
      logger.log(logLevel, 'Admin endpoint access attempt', {
        category: 'security',
        type: 'admin_access',
        ip,
        endpoint,
        success,
        timestamp: new Date().toISOString()
      });
    }
  },

  // System health and performance
  system: {
    startup: (port: number, environment: string) => {
      logger.notice('Bitcoin Bytes platform started', {
        category: 'system',
        type: 'startup',
        port,
        environment,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      });
    },
    
    shutdown: (reason: string) => {
      logger.notice('Bitcoin Bytes platform shutting down', {
        category: 'system',
        type: 'shutdown',
        reason,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    },
    
    memoryUsage: (usage: NodeJS.MemoryUsage) => {
      logger.debug('Memory usage report', {
        category: 'system',
        type: 'memory_usage',
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
        timestamp: new Date().toISOString()
      });
    },
    
    cachePerformance: (hitRate: number, operations: number) => {
      logger.info('Cache performance metrics', {
        category: 'system',
        type: 'cache_performance',
        hitRate,
        operations,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Business intelligence and analytics
  business: {
    userEngagement: (endpoint: string, uniqueIPs: number, totalRequests: number) => {
      logger.info('User engagement metrics', {
        category: 'business',
        type: 'user_engagement',
        endpoint,
        uniqueIPs,
        totalRequests,
        avgRequestsPerUser: Math.round(totalRequests / uniqueIPs),
        timestamp: new Date().toISOString()
      });
    },
    
    popularContent: (contentType: string, requests: number, period: string) => {
      logger.info('Popular content analytics', {
        category: 'business',
        type: 'content_analytics',
        contentType,
        requests,
        period,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// HTTP request logging with Morgan
export const httpLogger = morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim(), { category: 'http_access' });
    }
  }
});

// Custom request logging middleware
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    bitcoinLogger.api.request(
      req.path,
      responseTime,
      res.statusCode,
      req.ip
    );
    
    // Log slow requests
    if (responseTime > 2000) {
      bitcoinLogger.api.slowRequest(req.path, responseTime, 2000);
    }
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (error: any, req: Request, res: Response, next: Function) => {
  bitcoinLogger.api.error(req.path, error, req.ip);
  next(error);
};

// System monitoring
export const systemMonitor = {
  startMonitoring: () => {
    // Log memory usage every 5 minutes
    setInterval(() => {
      bitcoinLogger.system.memoryUsage(process.memoryUsage());
    }, 5 * 60 * 1000);
    
    logger.info('System monitoring started');
  },
  
  logStartup: (port: number) => {
    bitcoinLogger.system.startup(port, process.env.NODE_ENV || 'development');
  },
  
  logShutdown: (reason: string = 'Normal shutdown') => {
    bitcoinLogger.system.shutdown(reason);
  }
};

// Graceful shutdown logging
process.on('SIGTERM', () => systemMonitor.logShutdown('SIGTERM received'));
process.on('SIGINT', () => systemMonitor.logShutdown('SIGINT received'));

export default logger;
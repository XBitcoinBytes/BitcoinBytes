import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise-Grade Security Configuration
 * Implements comprehensive security hardening for Bitcoin platform
 */

// Rate limiting configuration
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests in some cases
    skip: (req) => {
      // Skip rate limiting for health checks
      if (req.path === '/api/health') return true;
      return false;
    },
    // Custom key generator for more sophisticated limiting
    keyGenerator: (req) => {
      // Use IP + User-Agent for better identification
      return `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'unknown'}`;
    }
  });
};

// Progressive rate limiting - slow down before blocking
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes at full speed
  delayMs: () => 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 2000, // Maximum delay of 2 seconds
  validate: { delayMs: false } // Disable warning
});

// Different rate limits for different endpoint types
export const rateLimits = {
  // Strict limits for pricing endpoints (most critical)
  pricing: createRateLimit(60 * 1000, 120, 'Price data rate limit exceeded'), // 120 per minute
  
  // Standard limits for general API
  general: createRateLimit(60 * 1000, 100, 'API rate limit exceeded'), // 100 per minute
  
  // Relaxed limits for static content
  content: createRateLimit(60 * 1000, 200, 'Content rate limit exceeded'), // 200 per minute
  
  // Very strict for admin/emergency endpoints
  admin: createRateLimit(60 * 1000, 10, 'Admin endpoint rate limit exceeded'), // 10 per minute
  
  // Burst protection for expensive operations
  expensive: createRateLimit(60 * 1000, 20, 'Resource-intensive operation limit exceeded'), // 20 per minute
};

// Helmet security configuration for Bitcoin platform
export const securityConfig = helmet({
  // Content Security Policy - Allow necessary resources for crypto platform and development
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        "'self'",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:", // For embedded fonts
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts
        "'unsafe-eval'", // Required for dynamic imports
        "https://www.googletagmanager.com", // Google Analytics
        "https://www.google-analytics.com",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:", // Allow HTTPS images (for logos, charts)
        "blob:", // For generated charts
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      connectSrc: [
        "'self'",
        "https://api.coingecko.com",
        "https://api.coindesk.com", 
        "https://api.coinbase.com",
        "https://api.blockchain.info",
        "https://api-pub.bitfinex.com",
        "https://api.kraken.com",
        "https://www.bitstamp.net",
        "https://api.gemini.com",
        "https://www.google-analytics.com",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org",
        "wss://bitcoinbytes.org",
        "wss://www.bitcoinbytes.org",
        "ws://localhost:*", // Dev WebSocket
        "wss:", // WebSocket connections
        "ws:" // WebSocket connections (dev)
      ],
      mediaSrc: [
        "'self'", 
        "data:", 
        "blob:",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: [
        "'self'",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      formAction: [
        "'self'",
        "https://bitcoinbytes.org",
        "https://www.bitcoinbytes.org"
      ],
      frameAncestors: ["'self'"],
      scriptSrcAttr: ["'none'"]
    },
  },
  
  // Strict Transport Security - Force HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Block pages from loading when XSS detected
  xssFilter: true,
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer policy for privacy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// API Security Middleware
export const apiSecurity = {
  // Validate API key format (if implemented)
  validateApiKey: (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-Key');
    
    if (req.path.startsWith('/api/admin/') || req.path.includes('emergency-update')) {
      if (!apiKey || apiKey.length < 32) {
        return res.status(401).json({ 
          error: 'Invalid or missing API key for admin endpoint',
          code: 'INVALID_API_KEY'
        });
      }
    }
    
    next();
  },

  // Validate request origin (relaxed for development)
  validateOrigin: (req: Request, res: Response, next: NextFunction) => {
    // Skip origin validation in development to allow Vite HMR
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const origin = req.get('Origin');
    if (!origin) return next();

    // Exact-match allowlist (substring matching allowed look-alike hosts such as
    // bitcoinbytes.org.evil.example). Same-host requests are always allowed so the
    // app works on any deploy URL (e.g. a Railway preview domain).
    const allowedOrigins = new Set([
      'https://bitcoinbytes.org',
      'https://www.bitcoinbytes.org',
      'http://localhost:5000',
      ...(process.env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean),
    ]);

    let sameHost = false;
    try {
      sameHost = new URL(origin).host === req.get('host');
    } catch {
      sameHost = false;
    }

    if (sameHost || allowedOrigins.has(origin)) {
      next();
    } else {
      res.status(403).json({
        error: 'Origin not allowed',
        code: 'INVALID_ORIGIN'
      });
    }
  },

  // Request size limiting
  validateRequestSize: (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('Content-Length');
    const maxSize = 1024 * 1024; // 1MB limit
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE'
      });
    }
    
    next();
  },

  // Block suspicious patterns
  blockSuspiciousRequests: (req: Request, res: Response, next: NextFunction) => {
    const suspiciousPatterns = [
      /\.\.\//, // Path traversal
      /<script/i, // XSS attempt
      /union\s+select/i, // SQL injection
      /javascript:/i, // JavaScript injection
      /vbscript:/i, // VBScript injection
    ];

    const userAgent = req.get('User-Agent') || '';
    const url = req.url;
    const body = JSON.stringify(req.body);

    const suspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(body) || pattern.test(userAgent)
    );

    if (suspicious) {
      console.warn(`🚨 Suspicious request blocked: ${req.ip} - ${url}`);
      return res.status(400).json({
        error: 'Request blocked by security filter',
        code: 'SUSPICIOUS_REQUEST'
      });
    }

    next();
  }
};

// Security monitoring and logging
export const securityMonitor = {
  logSecurityEvent: (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      type: 'security'
    };

    if (severity === 'high') {
      console.error('🚨 HIGH SEVERITY SECURITY EVENT:', logEntry);
    } else if (severity === 'medium') {
      console.warn('⚠️ SECURITY EVENT:', logEntry);
    } else {
      console.log('📝 Security log:', logEntry);
    }

    // In production, this would send to security monitoring service
    // Example: await sendToSecurityService(logEntry);
  },

  trackFailedAttempts: (() => {
    const attempts = new Map<string, { count: number; lastAttempt: number }>();
    
    return (ip: string, endpoint: string) => {
      const key = `${ip}:${endpoint}`;
      const now = Date.now();
      const existing = attempts.get(key);
      
      if (existing) {
        // Reset if more than 1 hour passed
        if (now - existing.lastAttempt > 3600000) {
          attempts.set(key, { count: 1, lastAttempt: now });
        } else {
          existing.count++;
          existing.lastAttempt = now;
          
          // Alert on suspicious activity
          if (existing.count > 10) {
            securityMonitor.logSecurityEvent('excessive_failed_attempts', {
              ip,
              endpoint,
              count: existing.count
            }, 'high');
          }
        }
      } else {
        attempts.set(key, { count: 1, lastAttempt: now });
      }
      
      return attempts.get(key)!.count;
    };
  })()
};

// IP whitelist for admin functions (can be configured via environment)
export const ipWhitelist = {
  adminIPs: (process.env.ADMIN_IPS || '127.0.0.1,::1').split(','),
  
  checkAdminAccess: (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/admin/') || req.path.includes('emergency-update')) {
      const clientIP = req.ip;
      
      if (!ipWhitelist.adminIPs.includes(clientIP)) {
        securityMonitor.logSecurityEvent('unauthorized_admin_access', {
          ip: clientIP,
          path: req.path,
          userAgent: req.get('User-Agent')
        }, 'high');
        
        return res.status(403).json({
          error: 'Access denied: IP not whitelisted for admin access',
          code: 'IP_NOT_WHITELISTED'
        });
      }
    }
    
    next();
  }
};

// Emergency security measures
export const emergencySecurity = {
  enableEmergencyMode: () => {
    console.log('🚨 EMERGENCY SECURITY MODE ACTIVATED');
    
    // This would trigger additional security measures
    // - Stricter rate limiting
    // - Enhanced logging
    // - Possible temporary endpoint disabling
    
    securityMonitor.logSecurityEvent('emergency_mode_activated', {
      reason: 'Manual activation',
      timestamp: new Date().toISOString()
    }, 'high');
  },
  
  disableEmergencyMode: () => {
    console.log('✅ Emergency security mode deactivated');
    
    securityMonitor.logSecurityEvent('emergency_mode_deactivated', {
      timestamp: new Date().toISOString()
    }, 'medium');
  }
};
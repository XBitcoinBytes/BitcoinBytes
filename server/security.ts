import { timingSafeEqual } from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response, NextFunction } from 'express';
import { clientIp } from './clientIp';

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
    // Key on client IP only (trust proxy is set). Including the User-Agent let clients
    // bypass the limit just by rotating that header.
    keyGenerator: (req) => clientIp(req)
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
  // Content Security Policy. The client only talks to its own origin (all exchange
  // data is fetched server-side), so connect-src is 'self'. No inline or eval'd script.
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      // React inline style attributes and Radix positioning need inline styles.
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },

  // Strict Transport Security - Force HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: false // only opt into the preload list deliberately, once the domain is final
  },
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  
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

/**
 * Admin gate for maintenance endpoints. Requires ADMIN_TOKEN to be set (>= 32 chars)
 * and sent as "Authorization: Bearer <token>". Without ADMIN_TOKEN the endpoints 404.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN || '';
  if (expected.length < 32) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const header = req.get('Authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  next();
}

/** Redirect plain-HTTP requests to HTTPS in production (behind a TLS-terminating proxy). */
export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production' || req.path === '/healthz') return next();
  const proto = (req.get('X-Forwarded-Proto') || '').split(',')[0].trim();
  if (proto === 'http') {
    const host = req.get('host');
    if (host) return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  next();
}

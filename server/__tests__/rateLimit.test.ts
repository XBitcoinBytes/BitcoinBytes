/** Red-team: flooding the API from one client must hit 429, per-endpoint rules must apply. */
import { describe, it, expect } from 'vitest';
import { EnhancedRateLimiter } from '../rateLimiter';

function hit(mw: any, path: string, ip = '203.0.113.9') {
  const req: any = { baseUrl: '/api', path, ip, socket: {} };
  const res: any = { statusCode: 200, headers: {} as Record<string, string>,
    set(k: any, v?: any) { if (typeof k === 'string') this.headers[k] = v; else Object.assign(this.headers, k); return this; },
    status(c: number) { this.statusCode = c; return this; }, json() { return this; } };
  let passed = false; mw(req, res, () => { passed = true; });
  return { passed, res };
}

describe('API rate limiting (mounted at /api)', () => {
  it('limits /api/compare to 60 per minute per IP, with Retry-After', () => {
    const mw = new EnhancedRateLimiter().middleware();
    let ok = 0, last: any;
    for (let i = 0; i < 80; i++) { last = hit(mw, '/compare'); if (last.passed) ok++; }
    expect(ok).toBe(60);
    expect(last.res.statusCode).toBe(429);
    expect(Number(last.res.headers['Retry-After'])).toBeGreaterThan(0);
  });
  it('keeps clients separate', () => {
    const mw = new EnhancedRateLimiter().middleware();
    for (let i = 0; i < 70; i++) hit(mw, '/compare', '198.51.100.1');
    expect(hit(mw, '/compare', '198.51.100.2').passed).toBe(true);
  });
  it('applies the news rule (60/min), not the default', () => {
    const mw = new EnhancedRateLimiter().middleware();
    let ok = 0; for (let i = 0; i < 100; i++) if (hit(mw, '/news').passed) ok++;
    expect(ok).toBe(60);
  });
  it('falls back to the default 100/min for other routes', () => {
    const mw = new EnhancedRateLimiter().middleware();
    let ok = 0; for (let i = 0; i < 120; i++) if (hit(mw, '/exchanges').passed) ok++;
    expect(ok).toBe(100);
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { requireAdmin, httpsRedirect } from '../security';

function mockRes() {
  const res: any = { statusCode: 200, redirected: '' as string };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = () => res;
  res.redirect = (c: number, url: string) => { res.statusCode = c; res.redirected = url; return res; };
  return res;
}
const req = (headers: Record<string, string>, extra: any = {}) => ({
  get: (h: string) => headers[h.toLowerCase()],
  path: '/', originalUrl: '/x?y=1', ...extra,
}) as any;

const envBackup = { ...process.env };
afterEach(() => { process.env = { ...envBackup }; });

describe('requireAdmin', () => {
  it('404s when ADMIN_TOKEN is not configured', () => {
    delete process.env.ADMIN_TOKEN;
    const res = mockRes(); const next = vi.fn();
    requireAdmin(req({ authorization: 'Bearer anything' }), res, next);
    expect(next).not.toHaveBeenCalled(); expect(res.statusCode).toBe(404);
  });
  it('401s on a wrong token and passes on the right one', () => {
    process.env.ADMIN_TOKEN = 'a'.repeat(40);
    const bad = mockRes(); const n1 = vi.fn();
    requireAdmin(req({ authorization: 'Bearer ' + 'b'.repeat(40) }), bad, n1);
    expect(n1).not.toHaveBeenCalled(); expect(bad.statusCode).toBe(401);
    const n2 = vi.fn();
    requireAdmin(req({ authorization: 'Bearer ' + 'a'.repeat(40) }), mockRes(), n2);
    expect(n2).toHaveBeenCalledOnce();
  });
});

describe('httpsRedirect', () => {
  it('redirects http to https in production', () => {
    process.env.NODE_ENV = 'production';
    const res = mockRes(); const next = vi.fn();
    httpsRedirect(req({ 'x-forwarded-proto': 'http', host: 'bitcoinbytes.org' }), res, next);
    expect(res.statusCode).toBe(301); expect(res.redirected).toBe('https://bitcoinbytes.org/x?y=1');
  });
  it('leaves https and the health check alone', () => {
    process.env.NODE_ENV = 'production';
    const n1 = vi.fn(); httpsRedirect(req({ 'x-forwarded-proto': 'https', host: 'h' }), mockRes(), n1);
    const n2 = vi.fn(); httpsRedirect(req({ 'x-forwarded-proto': 'http', host: 'h' }, { path: '/healthz' }), mockRes(), n2);
    expect(n1).toHaveBeenCalledOnce(); expect(n2).toHaveBeenCalledOnce();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { apiSecurity } from '../security';

function run(origin: string | undefined, host = 'bitcoinbytes.org') {
  const req: any = { get: (h: string) => (h.toLowerCase() === 'origin' ? origin : h.toLowerCase() === 'host' ? host : undefined) };
  const res: any = { statusCode: 200, status(c: number) { this.statusCode = c; return this; }, json() { return this; } };
  const next = vi.fn();
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  apiSecurity.validateOrigin(req, res, next);
  process.env.NODE_ENV = prev;
  return { allowed: next.mock.calls.length === 1, status: res.statusCode };
}

describe('validateOrigin', () => {
  it('allows requests with no Origin header', () => expect(run(undefined).allowed).toBe(true));
  it('allows apex and www', () => {
    expect(run('https://bitcoinbytes.org').allowed).toBe(true);
    expect(run('https://www.bitcoinbytes.org', 'www.bitcoinbytes.org').allowed).toBe(true);
  });
  it('allows same-host preview deployments', () =>
    expect(run('https://x.up.railway.app', 'x.up.railway.app').allowed).toBe(true));
  it('rejects look-alike hosts that only contain the allowed origin', () => {
    const r = run('https://bitcoinbytes.org.evil.example');
    expect(r.allowed).toBe(false);
    expect(r.status).toBe(403);
  });
  it('rejects unrelated origins', () => expect(run('https://evil.example').allowed).toBe(false));
});

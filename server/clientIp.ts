import type { Request } from 'express';

/**
 * Client IP for rate limiting.
 * Railway's edge overwrites X-Real-IP with the caller's address on every request (and maps
 * CF-Connecting-IP when fronted by Cloudflare), while its X-Forwarded-For hop count is not fixed,
 * so `trust proxy = 1` can land on a rotating proxy address. Use X-Real-IP on Railway, or the
 * header named in CLIENT_IP_HEADER on another host whose edge overwrites it. Otherwise req.ip.
 */
export function clientIpHeader(env: NodeJS.ProcessEnv = process.env): string | null {
  const configured = env.CLIENT_IP_HEADER?.trim().toLowerCase();
  if (configured) return configured === 'none' ? null : configured;
  return env.RAILWAY_ENVIRONMENT_ID ? 'x-real-ip' : null;
}

const HEADER = clientIpHeader();

export function clientIp(req: Request, header: string | null = HEADER): string {
  if (header) {
    const raw = req.headers?.[header];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.split(',')[0]?.trim();
    if (value && value.length <= 64 && /^[0-9a-fA-F:.]+$/.test(value)) return value;
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

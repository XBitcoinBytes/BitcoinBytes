import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { renderShell, CLIENT_ROUTES } from '../static';
import { ROUTE_META } from '../../shared/routeMeta';

const SHELL = fs.readFileSync(path.resolve(__dirname, '../../client/index.html'), 'utf8');

describe('per-route share cards', () => {
  it('has meta for every client route', () => {
    for (const r of CLIENT_ROUTES) expect(ROUTE_META[r], r).toBeTruthy();
  });
  it('writes the route title, description, canonical and og/twitter tags', () => {
    const html = renderShell(SHELL, '/learn');
    expect(html).toContain('<title>Learn Bitcoin | BitcoinBytes</title>');
    expect(html).toContain('<link rel="canonical" href="https://www.bitcoinbytes.org/learn" />');
    expect(html).toContain('<meta property="og:url" content="https://www.bitcoinbytes.org/learn" />');
    expect(html).toContain('<meta property="og:title" content="Learn Bitcoin | BitcoinBytes" />');
    expect(html).toContain('<meta name="twitter:title" content="Learn Bitcoin | BitcoinBytes" />');
    expect(html).toContain('<meta name="twitter:image"');
    expect(html).toMatch(/<div id="root"><\/div><noscript><main[^>]*><h1>Learn Bitcoin<\/h1>/);
  });
  it('does not double the brand on the home title', () => {
    expect(renderShell(SHELL, '/')).toContain('<title>BitcoinBytes: Compare Bitcoin Purchase Estimates</title>');
  });
  it('escapes and never echoes the request', () => {
    const html = renderShell(SHELL, '/beginners');
    expect(html).toContain('New to Bitcoin? Beginner&#39;s Guide'.replace('&#39;', "'"));
    expect(html).not.toMatch(/<script>alert/);
  });
  it('marks unknown pages noindex', () => {
    const html = renderShell(SHELL, '404');
    expect(html).toContain('noindex');
    expect(html).toContain('<title>Page not found | BitcoinBytes</title>');
  });
});

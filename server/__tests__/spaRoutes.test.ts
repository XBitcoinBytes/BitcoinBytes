import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CLIENT_ROUTES, isClientRoute } from '../static';

describe('SPA fallback status', () => {
  it('serves known routes as 200 and others as 404', () => {
    expect(isClientRoute('/')).toBe(true);
    expect(isClientRoute('/learn?x=1')).toBe(true);
    expect(isClientRoute('/learn/')).toBe(true);
    expect(isClientRoute('/nope')).toBe(false);
    expect(isClientRoute('/learn/../../etc/passwd')).toBe(false);
  });
  it('matches the routes declared in App.tsx', () => {
    const app = readFileSync('client/src/App.tsx', 'utf8');
    const declared = [...app.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]);
    expect(new Set(declared)).toEqual(CLIENT_ROUTES);
  });
});

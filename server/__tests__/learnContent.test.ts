import { describe, it, expect } from 'vitest';
import { CONCEPTS, GLOSSARY, RESOURCES } from '../../client/src/content/learn';

describe('learn content', () => {
  it('has unique concept ids and complete entries', () => {
    expect(new Set(CONCEPTS.map((c) => c.id)).size).toBe(CONCEPTS.length);
    for (const c of CONCEPTS) {
      expect(c.title && c.summary && c.explanation && c.example).toBeTruthy();
      expect(c.keyPoints.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('covers the core topics', () => {
    const ids = CONCEPTS.map((c) => c.id);
    for (const id of ['what-is-bitcoin', 'supply', 'mining', 'keys-and-wallets']) expect(ids).toContain(id);
  });
  it('links only to https resources', () => {
    for (const r of RESOURCES) expect(r.url.startsWith('https://')).toBe(true);
  });
  it('has a glossary', () => expect(GLOSSARY.length).toBeGreaterThanOrEqual(6));
});

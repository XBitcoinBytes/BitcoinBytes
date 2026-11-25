import { describe, it, expect } from 'vitest';
import { CONCEPTS, GLOSSARY, GLOSSARY_GROUPS, RESOURCES } from '../../client/src/content/learn';

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
  it('has a glossary of about 25 terms', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(24);
    expect(GLOSSARY.length).toBeLessThanOrEqual(30);
  });
  it('gives every glossary term a unique, url-safe #anchor that no concept card uses', () => {
    const ids = GLOSSARY.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const conceptIds = new Set(CONCEPTS.map((c) => c.id));
    for (const id of ids) expect(conceptIds.has(id)).toBe(false);
    for (const id of ['difficulty-adjustment', 'block-height', 'block', 'halving']) expect(ids).toContain(id);
    for (const g of GLOSSARY) expect(GLOSSARY_GROUPS).toContain(g.group);
  });
  it('keeps glossary definitions free of prices', () => {
    for (const g of GLOSSARY) expect(g.definition).not.toMatch(/\$\s?\d|price target|USD/i);
  });
});

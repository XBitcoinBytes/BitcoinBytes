/**
 * Red-team: RSS content is untrusted. Markup, script, javascript: links, off-domain links
 * and banned copy must never reach the client.
 */
import { describe, it, expect } from 'vitest';
import { parseFeed, decodeText, safeArticleUrl, FEEDS } from '../liveNewsService';

const feed = { source: 'Test', url: 'https://example.test/rss', hosts: ['news.example.test'], filterBitcoin: true };
const item = (title: string, link: string, desc = 'Bitcoin network update', date = 'Sat, 21 Nov 2026 18:01:02 +0000') =>
  `<item><title>${title}</title><link>${link}</link><description>${desc}</description><pubDate>${date}</pubDate></item>`;

describe('news feed parsing', () => {
  it('parses a normal item and decodes CDATA/entities', () => {
    const xml = `<rss><channel>${item('<![CDATA[Bitcoin &amp; Lightning: what&#8217;s new]]>', 'https://news.example.test/a')}</channel></rss>`;
    const [a] = parseFeed(xml, feed);
    expect(a.title).toBe('Bitcoin & Lightning: what’s new');
    expect(a.url).toBe('https://news.example.test/a');
  });
  it('strips markup and encoded script from titles', () => {
    const xml = item('Bitcoin &lt;script&gt;alert(1)&lt;/script&gt;<img src=x onerror=alert(1)> rally', 'https://news.example.test/b');
    const [a] = parseFeed(xml, feed);
    expect(a.title).not.toMatch(/[<>]/);
    expect(a.title).not.toMatch(/onerror/);
  });
  it('drops javascript:, http: and off-domain links', () => {
    expect(safeArticleUrl('javascript:alert(1)', feed.hosts)).toBeNull();
    expect(safeArticleUrl('http://news.example.test/x', feed.hosts)).toBeNull();
    expect(safeArticleUrl('https://evil.test/x', feed.hosts)).toBeNull();
    expect(safeArticleUrl('https://news.example.test.evil.test/x', feed.hosts)).toBeNull();
    const xml = item('Bitcoin', 'javascript:alert(1)') + item('Bitcoin two', 'https://evil.test/x');
    expect(parseFeed(xml, feed)).toEqual([]);
  });
  it('drops banned copy and non-Bitcoin items when filtering', () => {
    const xml = item('Bitcoin is on sale, buy the dip', 'https://news.example.test/c') +
      item('Ethereum upgrade ships', 'https://news.example.test/d', 'An Ethereum story');
    expect(parseFeed(xml, feed)).toEqual([]);
  });
  it('drops items with invalid dates', () => {
    expect(parseFeed(item('Bitcoin', 'https://news.example.test/e', 'Bitcoin', 'not a date'), feed)).toEqual([]);
  });
  it('decodeText handles numeric entities safely', () => expect(decodeText('&#x1F600; &#0; ok')).toBe('😀 ok'));
  it('only uses https feeds', () => { for (const f of FEEDS) expect(f.url.startsWith('https://')).toBe(true); });
});

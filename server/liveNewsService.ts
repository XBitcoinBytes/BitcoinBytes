/**
 * Live News Service: Bitcoin headlines from publishers' public RSS feeds.
 *
 * Replaces the old Python sidecar (which could not run off Replit) and its hard-coded
 * "fallback" articles. If every feed fails we return an empty list plus a status;
 * we never invent articles.
 */

export interface LiveNewsArticle {
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string | Date;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  tags: string[];
  views: number;
  shares: number;
  isActive: boolean;
}

interface Feed {
  source: string;
  url: string;
  /** Article links must be https on one of these hosts. */
  hosts: string[];
  /** Feed is not Bitcoin-only, so keep only items that mention Bitcoin. */
  filterBitcoin: boolean;
}

export const FEEDS: Feed[] = [
  { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss', hosts: ['www.coindesk.com', 'coindesk.com'], filterBitcoin: true },
  { source: 'Cointelegraph', url: 'https://cointelegraph.com/rss/tag/bitcoin', hosts: ['cointelegraph.com'], filterBitcoin: false },
  { source: 'Decrypt', url: 'https://decrypt.co/feed', hosts: ['decrypt.co'], filterBitcoin: true },
];

/** Headlines are dropped if they use copy BitcoinBytes must never display. */
const BANNED_COPY = /on sale|buy the dip|price target|price prediction/i;
const BITCOIN_RE = /\bbitcoin\b|\bbtc\b/i;
const CACHE_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const MAX_ITEMS = 50;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeText(raw: string): string {
  let s = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  s = s.replace(/<[^>]*>/g, ' '); // strip any markup
  s = s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : '';
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
  s = s.replace(/<[^>]*>/g, ' '); // entities may have produced markup
  return s.replace(/\s+/g, ' ').trim();
}

function tag(item: string, name: string): string {
  const m = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

/** Returns the URL only if it is https and on an allowed host. */
export function safeArticleUrl(raw: string, hosts: string[]): string | null {
  try {
    const u = new URL(decodeText(raw));
    if (u.protocol !== 'https:' || !hosts.includes(u.hostname)) return null;
    u.username = ''; u.password = '';
    return u.toString();
  } catch {
    return null;
  }
}

export function parseFeed(xml: string, feed: Feed): LiveNewsArticle[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  const out: LiveNewsArticle[] = [];
  for (const item of items.slice(0, MAX_ITEMS)) {
    const title = decodeText(tag(item, 'title')).slice(0, 300);
    const summary = decodeText(tag(item, 'description')).slice(0, 400);
    const url = safeArticleUrl(tag(item, 'link'), feed.hosts);
    const date = new Date(decodeText(tag(item, 'pubDate')));
    if (!title || !url || Number.isNaN(date.getTime())) continue;
    if (feed.filterBitcoin && !BITCOIN_RE.test(`${title} ${summary}`)) continue;
    if (BANNED_COPY.test(`${title} ${summary}`)) continue;
    out.push({
      title, summary, content: summary, url, source: feed.source,
      author: decodeText(tag(item, 'dc:creator')).slice(0, 120) || feed.source,
      publishedAt: date.toISOString(), impact: 'LOW', tags: ['bitcoin'],
      views: 0, shares: 0, isActive: true,
    });
  }
  return out;
}

class LiveNewsService {
  private cachedNews: LiveNewsArticle[] = [];
  private lastFetch = 0;
  private lastSuccess = 0;
  private failedSources: string[] = [];
  private pending: Promise<LiveNewsArticle[]> | null = null;

  async getLatestNews(limit = 15): Promise<LiveNewsArticle[]> {
    if (Date.now() - this.lastFetch > CACHE_MS) await this.refresh();
    return this.cachedNews.slice(0, limit);
  }

  async forceRefresh(): Promise<LiveNewsArticle[]> {
    return this.refresh();
  }

  getCacheStatus() {
    return {
      lastFetch: this.lastFetch,
      lastSuccess: this.lastSuccess,
      cacheAge: this.lastFetch ? Date.now() - this.lastFetch : 0,
      isUpdating: this.pending !== null,
      articleCount: this.cachedNews.length,
      failedSources: this.failedSources,
    };
  }

  private refresh(): Promise<LiveNewsArticle[]> {
    if (!this.pending) this.pending = this.doRefresh().finally(() => { this.pending = null; });
    return this.pending;
  }

  private async doRefresh(): Promise<LiveNewsArticle[]> {
    const results = await Promise.allSettled(FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: 'follow',
        headers: { 'User-Agent': 'BitcoinBytes/1.0 (+https://bitcoinbytes.org)', Accept: 'application/rss+xml, application/xml, text/xml' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.length > 2_000_000) throw new Error('Feed too large');
      return parseFeed(text, feed);
    }));
    this.lastFetch = Date.now();
    this.failedSources = FEEDS.filter((_, i) => results[i].status === 'rejected').map((f) => f.source);
    const fresh = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    if (fresh.length) {
      const seen = new Set<string>();
      this.cachedNews = fresh
        .filter((a) => (seen.has(a.url) ? false : (seen.add(a.url), true)))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, MAX_ITEMS);
      this.lastSuccess = this.lastFetch;
    } else if (Date.now() - this.lastSuccess > 6 * 60 * 60 * 1000) {
      // Keep the last good headlines for a while, but never serve very old ones as "latest".
      this.cachedNews = [];
    }
    return this.cachedNews;
  }
}

export const liveNewsService = new LiveNewsService();

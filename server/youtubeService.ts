/**
 * Latest videos from the BitcoinBytes YouTube channel (@MyBitcoinBytes), read from the
 * channel's public RSS feed. No API key, no invented data: the old hard-coded "fallback"
 * videos (with made-up view counts and stock thumbnails) are gone. If the feed fails and we
 * have nothing recent, we return { available: false } and the page links to the channel.
 */
import { decodeText } from './liveNewsService';

export const CHANNEL_ID = 'UC8Ewji3JwVCCyN0mjNKWMxw';
export const CHANNEL_URL = 'https://www.youtube.com/@MyBitcoinBytes';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_MS = 60 * 60 * 1000;            // re-read the feed at most hourly
const KEEP_LAST_GOOD_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export interface ChannelVideo {
  id: string;
  title: string;
  /** Short label parsed from "Episode N - … - "Title"" when present. */
  shortTitle: string;
  episode: number | null;
  publishedAt: string;
  url: string;
  thumbnailUrl: string;
}

export interface ChannelFeed {
  available: boolean;
  channelUrl: string;
  updatedAt: string | null;
  videos: ChannelVideo[];
}

function tag(entry: string, name: string): string {
  const m = entry.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

export function shortLabel(title: string): { shortTitle: string; episode: number | null } {
  const m = title.match(/^Episode\s+(\d+)\b.*?["“](.+?)["”]\s*$/i);
  if (m) return { episode: Number(m[1]), shortTitle: m[2] };
  return { episode: null, shortTitle: title };
}

export function parseChannelFeed(xml: string, max = 12): ChannelVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
  const out: ChannelVideo[] = [];
  for (const e of entries) {
    const id = decodeText(tag(e, 'yt:videoId'));
    const title = decodeText(tag(e, 'title')).slice(0, 200);
    const date = new Date(decodeText(tag(e, 'published')));
    if (!VIDEO_ID_RE.test(id) || !title || Number.isNaN(date.getTime())) continue;
    out.push({
      id, title, ...shortLabel(title),
      publishedAt: date.toISOString(),
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    });
    if (out.length >= max) break;
  }
  return out;
}

export class YouTubeService {
  private videos: ChannelVideo[] = [];
  private lastFetch = 0;
  private lastSuccess = 0;
  private pending: Promise<void> | null = null;

  constructor(private fetchImpl: typeof fetch = fetch, private feedUrl = FEED_URL) {}

  async getFeed(): Promise<ChannelFeed> {
    if (Date.now() - this.lastFetch > CACHE_MS) {
      if (!this.pending) this.pending = this.refresh().finally(() => { this.pending = null; });
      await this.pending;
    }
    const fresh = this.lastSuccess > 0 && Date.now() - this.lastSuccess < KEEP_LAST_GOOD_MS;
    return {
      available: fresh && this.videos.length > 0,
      channelUrl: CHANNEL_URL,
      updatedAt: this.lastSuccess ? new Date(this.lastSuccess).toISOString() : null,
      videos: fresh ? this.videos : [],
    };
  }

  private async refresh(): Promise<void> {
    this.lastFetch = Date.now();
    try {
      const res = await this.fetchImpl(this.feedUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'User-Agent': 'BitcoinBytes/1.0 (+https://www.bitcoinbytes.org)', Accept: 'application/atom+xml, application/xml' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.length > 2_000_000) throw new Error('Feed too large');
      const parsed = parseChannelFeed(text);
      if (parsed.length) { this.videos = parsed; this.lastSuccess = this.lastFetch; }
    } catch (err) {
      console.warn('[youtube] feed fetch failed:', err instanceof Error ? err.message : err);
    }
  }
}

export const youtubeService = new YouTubeService();

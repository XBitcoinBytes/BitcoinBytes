import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseChannelFeed, shortLabel, YouTubeService } from '../youtubeService';

const XML = fs.readFileSync(path.join(__dirname, 'fixtures/youtube-feed.xml'), 'utf8');

describe('YouTube channel feed', () => {
  it('parses real entries with safe ids and youtube-only links', () => {
    const v = parseChannelFeed(XML);
    expect(v.length).toBeGreaterThan(5);
    for (const x of v) {
      expect(x.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(x.url).toBe(`https://www.youtube.com/watch?v=${x.id}`);
      expect(x.thumbnailUrl.startsWith('https://i.ytimg.com/vi/')).toBe(true);
      expect(x.title).not.toMatch(/&quot;|<|>/);
    }
  });
  it('never carries invented stats (no views/durations)', () => {
    const v = parseChannelFeed(XML) as unknown as Record<string, unknown>[];
    for (const x of v) { expect(x).not.toHaveProperty('viewCount'); expect(x).not.toHaveProperty('duration'); }
  });
  it('rejects hostile ids and markup', () => {
    const bad = '<entry><yt:videoId>"><script>x</script></yt:videoId><title>t</title><published>2026-01-01T00:00:00Z</published></entry>';
    expect(parseChannelFeed(bad)).toEqual([]);
  });
  it('labels podcast episodes', () => {
    expect(shortLabel('Episode 20 - The Sound Money and Individual Freedom Podcast - "Mastering the Lightning Network"'))
      .toEqual({ episode: 20, shortTitle: 'Mastering the Lightning Network' });
    expect(shortLabel('Bitcoin Group Meeting 5')).toEqual({ episode: null, shortTitle: 'Bitcoin Group Meeting 5' });
  });
  it('reports unavailable (not fake videos) when the feed is down', async () => {
    const svc = new YouTubeService((async () => { throw new Error('offline'); }) as unknown as typeof fetch);
    const f = await svc.getFeed();
    expect(f.available).toBe(false);
    expect(f.videos).toEqual([]);
    expect(f.channelUrl).toMatch(/youtube\.com\/@MyBitcoinBytes/);
  });
  it('serves parsed videos when the feed is up', async () => {
    const svc = new YouTubeService((async () => new Response(XML, { status: 200 })) as unknown as typeof fetch);
    const f = await svc.getFeed();
    expect(f.available).toBe(true);
    expect(f.videos.length).toBeGreaterThan(5);
  });
});

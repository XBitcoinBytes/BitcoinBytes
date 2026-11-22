import { useQuery } from '@tanstack/react-query';
import { Youtube, ExternalLink } from 'lucide-react';
import { CHANNEL_URL } from '@/content/channel';

interface Video { id: string; title: string; shortTitle: string; episode: number | null; publishedAt: string; url: string; thumbnailUrl: string }
interface Feed { available: boolean; channelUrl: string; videos: Video[] }

/** Latest uploads from the BitcoinBytes YouTube channel (real RSS feed; honest fallback). */
export default function ChannelVideos({ limit = 6 }: { limit?: number }) {
  const { data, isLoading } = useQuery<Feed>({ queryKey: ['/api/youtube/recent-videos'], staleTime: 30 * 60 * 1000, retry: 1 });

  if (isLoading) {
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading videos">
        {Array.from({ length: limit }).map((_, i) => <li key={i} className="aspect-video rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />)}
      </ul>
    );
  }

  if (!data?.available || !data.videos.length) {
    return (
      <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80 hover:text-white hover:border-[#f7931a]/40">
        <Youtube className="h-5 w-5 text-[#f7931a]" aria-hidden="true" />
        Watch the latest episodes on YouTube <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.videos.slice(0, limit).map((v) => (
        <li key={v.id}>
          <a href={v.url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-[#f7931a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7931a]">
            <img src={v.thumbnailUrl} alt="" width={320} height={180} loading="lazy" decoding="async" className="w-full aspect-video object-cover bg-black/40" />
            <div className="p-3">
              <div className="text-xs text-white/60">
                {v.episode ? `Episode ${v.episode} · ` : ''}<time dateTime={v.publishedAt}>{new Date(v.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              </div>
              <div className="mt-1 text-sm font-medium text-white group-hover:text-[#f7931a]">{v.shortTitle}</div>
              <span className="sr-only">(opens YouTube in a new tab)</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

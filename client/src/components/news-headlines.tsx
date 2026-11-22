import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';

interface Headline { title: string; summary: string; url: string; source: string; publishedAt: string }
interface NewsResponse { available: boolean; updatedAt: string | null; articles: Headline[] }

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 48 ? `${hrs} h ago` : new Date(iso).toLocaleDateString();
}

/** Latest Bitcoin headlines from publishers' RSS feeds. Shows an honest "unavailable" state. */
export default function NewsHeadlines({ limit = 8 }: { limit?: number }) {
  const { data, isLoading, isError } = useQuery<NewsResponse>({
    queryKey: [`/api/news?limit=${limit}`],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <ul className="space-y-3" aria-busy="true" aria-label="Loading headlines">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="h-16 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />
        ))}
      </ul>
    );
  }

  if (isError || !data?.available || !data.articles.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70" role="status">
        Headlines are unavailable right now
        {data?.updatedAt ? ` (last updated ${new Date(data.updatedAt).toLocaleString()})` : ''}. Please check back later.
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
        {data.articles.map((a) => (
          <li key={a.url} className="p-4">
            <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" className="group inline-flex items-start gap-1.5 font-medium text-white hover:text-[#f7931a]">
              <span>{a.title}</span>
              <ExternalLink className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-white/60 group-hover:text-[#f7931a]" aria-hidden="true" />
              <span className="sr-only">(opens {a.source} in a new tab)</span>
            </a>
            <div className="mt-1 text-xs text-white/60">
              {a.source} · <time dateTime={a.publishedAt}>{timeAgo(a.publishedAt)}</time>
            </div>
          </li>
        ))}
      </ul>
      {data.updatedAt && (
        <p className="mt-2 text-xs text-white/60">Updated {new Date(data.updatedAt).toLocaleTimeString()}</p>
      )}
    </div>
  );
}

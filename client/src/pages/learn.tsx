import { usePageMeta } from '@/hooks/usePageMeta';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import InteractiveBitcoinConcepts from '@/components/interactive-bitcoin-concepts';
import NewsHeadlines from '@/components/news-headlines';
import ChannelVideos from '@/components/channel-videos';
import { CHANNEL_URL, PODCAST_NAME } from '@/content/channel';
import { GLOSSARY, RESOURCES } from '@/content/learn';
import { ExternalLink } from 'lucide-react';

export default function Learn() {
  usePageMeta({
    title: 'Learn Bitcoin',
    description:
      'Plain-language Bitcoin education: how the network works, supply and halvings, mining, wallets and keys, fees, and Lightning, plus a glossary and trusted primary sources.',
    canonical: '/learn',
  });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex flex-col">
      <Header />
      <main id="main-content" className="relative z-10 max-w-5xl w-full mx-auto px-4 pt-24 pb-16 flex-1">
        <h1 className="text-3xl font-bold text-white mb-2">Learn Bitcoin</h1>
        <p className="text-white/70 text-base mb-3 max-w-2xl">
          Short, neutral explanations of how Bitcoin works. Start with the basics, then go deeper.
        </p>
        <p className="text-white/60 text-sm mb-10 max-w-2xl">
          Educational content only. Nothing here is financial advice or a recommendation to buy or sell.
          New to buying? Read the <a href="/beginners" className="text-[#f7931a] underline underline-offset-2 hover:text-[#ffb04d]">beginner’s guide</a>.
        </p>

        <section aria-labelledby="concepts-heading" className="mb-14">
          <h2 id="concepts-heading" className="text-xl font-bold text-white mb-4">Core concepts</h2>
          <InteractiveBitcoinConcepts />
        </section>

        <section aria-labelledby="channel-heading" className="mb-14">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
            <div>
              <h2 id="channel-heading" className="text-xl font-bold text-white">Watch and listen</h2>
              <p className="text-white/60 text-sm mt-1">Latest from {PODCAST_NAME} on the BitcoinBytes YouTube channel.</p>
            </div>
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[#f7931a] underline underline-offset-2 hover:text-[#ffb04d]">
              All episodes <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <ChannelVideos limit={6} />
        </section>

        <section aria-labelledby="glossary-heading" className="mb-14">
          <h2 id="glossary-heading" className="text-xl font-bold text-white mb-4">Glossary</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="border-b border-white/10 pb-3">
                <dt className="font-semibold text-white text-sm">{g.term}</dt>
                <dd className="text-white/70 text-sm mt-1">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="news-heading" className="mb-14">
          <h2 id="news-heading" className="text-xl font-bold text-white mb-1">Latest Bitcoin headlines</h2>
          <p className="text-white/60 text-sm mb-4">From the publishers’ public feeds, linking to the original articles. Headlines are not endorsements.</p>
          <NewsHeadlines />
        </section>

        <section aria-labelledby="resources-heading">
          <h2 id="resources-heading" className="text-xl font-bold text-white mb-4">Primary sources and further reading</h2>
          <ul className="space-y-3">
            {RESOURCES.map((r) => (
              <li key={r.url} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[#f7931a]">
                  {r.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <div className="text-xs text-white/60 mt-0.5">{r.author}</div>
                <p className="text-sm text-white/70 mt-1">{r.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}

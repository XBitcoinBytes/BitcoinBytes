import { usePageMeta } from '@/hooks/usePageMeta';
import { ComparisonTool } from '@/components/comparison-tool';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Bitcoin, ShieldCheck, ExternalLink, Youtube, BookOpen, GraduationCap, Receipt } from 'lucide-react';
import { CHANNEL_URL, X_URL, X_HANDLE, PODCAST_NAME } from '@/content/channel';

export default function Home() {
  usePageMeta({ canonical: '/' });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white relative">
      <Header />

      <main id="main-content" className="relative z-10">
        {/* Hero */}
        <section
          className="pt-24 pb-12 px-4 text-center"
          aria-label="Page headline"
        >
          <div className="inline-flex items-center gap-2 bg-[#f7931a]/10 border border-[#f7931a]/25 text-[#f7931a] text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <Bitcoin className="w-3.5 h-3.5" />
            Verified sources · Live order books · No fabricated data
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
            Compare Bitcoin{' '}
            <span className="text-[#f7931a]">purchase estimates</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl mx-auto mb-2 leading-relaxed">
            Enter the USD amount you want to spend. We walk the live order book
            for each exchange and rank by estimated Bitcoin received
            after fees.
          </p>
          <p className="text-xs text-white/60 max-w-lg mx-auto">
            Assumes USD already funded via the platform's free/default method.
            Immediate market purchase. Withdrawal and network fees excluded.
            Standard US retail customer. Results are estimates, not guaranteed quotes.
          </p>
        </section>

        {/* Comparison tool */}
        <section className="px-4 pb-16" aria-label="Bitcoin price comparison">
          <ComparisonTool />
        </section>

        {/* Trust strip */}
        <section
          className="border-t border-white/8 px-4 py-10"
          aria-label="How this works"
        >
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <ShieldCheck className="w-6 h-6 text-[#f7931a] mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">Verified fees only</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                We use only published entry-tier taker fees from official exchange fee schedules.
                Quotes remain estimates; fee schedules can change.
              </p>
            </div>
            <div>
              <Bitcoin className="w-6 h-6 text-[#f7931a] mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">Live order-book depth</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Results simulate walking the ask side of each exchange's live order book for
                your specific USD amount.
              </p>
            </div>
            <div>
              <ExternalLink className="w-6 h-6 text-[#f7931a] mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">Unranked is honest</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Providers without a public price-and-fee API appear unranked with a plain
                explanation. We never fill missing data with guesses.
              </p>
            </div>
          </div>
        </section>

        {/* Learner path + channel ties */}
        <section className="border-t border-white/8 px-4 py-12" aria-labelledby="start-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="start-heading" className="text-xl font-bold text-white mb-1">New to Bitcoin? Start here</h2>
            <p className="text-sm text-white/60 mb-6">Three short reads before you compare. Education only, not financial advice.</p>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { n: 1, href: '/learn#what-is-bitcoin', icon: BookOpen, title: 'What Bitcoin is', note: 'The ledger, keys and the 21 million supply in plain words.' },
                { n: 2, href: '/beginners', icon: GraduationCap, title: "Beginner's guide", note: 'Choosing an exchange and keeping your bitcoin safe.' },
                { n: 3, href: '/fees', icon: Receipt, title: 'Fees and spreads', note: 'Why the same $100 buys different amounts on each app.' },
              ].map(({ n, href, icon: Icon, title, note }) => (
                <li key={n}>
                  <a href={href} className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#f7931a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7931a]">
                    <div className="flex items-center gap-2 text-xs text-[#f7931a] font-semibold mb-2"><Icon className="w-4 h-4" aria-hidden="true" />Step {n}</div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{note}</p>
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#f7931a]/40">
                <Youtube className="w-6 h-6 text-[#f7931a] flex-shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-white">Watch the podcast</span>
                  <span className="block text-xs text-white/60 mt-0.5">{PODCAST_NAME}, on YouTube</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
              <a href={X_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#f7931a]/40">
                <span className="w-6 text-center text-lg font-bold text-[#f7931a] flex-shrink-0" aria-hidden="true">𝕏</span>
                <span>
                  <span className="block text-sm font-semibold text-white">Follow {X_HANDLE}</span>
                  <span className="block text-xs text-white/60 mt-0.5">Bitcoin news and commentary, several times a day</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Learn more strip */}
        <section
          className="border-t border-white/8 px-4 py-8 bg-white/2"
          aria-label="Learn more links"
        >
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-4 text-sm">
            <a href="/methodology" className="text-[#f7931a] hover:text-[#f7931a] underline underline-offset-4 transition-colors">
              How we calculate results
            </a>
            <span className="text-white/60 hidden sm:inline">·</span>
            <a href="/fees" className="text-[#f7931a] hover:text-[#f7931a] underline underline-offset-4 transition-colors">
              Spreads &amp; fees explained
            </a>
            <span className="text-white/60 hidden sm:inline">·</span>
            <a href="/beginners" className="text-[#f7931a] hover:text-[#f7931a] underline underline-offset-4 transition-colors">
              New to Bitcoin?
            </a>
            <span className="text-white/60 hidden sm:inline">·</span>
            <a href="/data-status" className="text-[#f7931a] hover:text-[#f7931a] underline underline-offset-4 transition-colors">
              Data &amp; provider status
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

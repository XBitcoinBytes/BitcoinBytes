import { usePageMeta } from '@/hooks/usePageMeta';
import { ComparisonTool } from '@/components/comparison-tool';
import ParticleBackground from '@/components/particle-background';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Bitcoin, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Home() {
  usePageMeta({
    title: 'BitcoinBytes — Compare Bitcoin Purchase Prices',
    description:
      'Find the best price to buy Bitcoin across exchanges. Ranked by BTC received after fees, using live order books and verified published fee schedules. No fabricated data.',
    canonical: '/',
  });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white relative">
      <ParticleBackground />
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
            Buy Bitcoin at the{' '}
            <span className="text-[#f7931a]">best price</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl mx-auto mb-2 leading-relaxed">
            Enter the USD amount you want to spend. We walk the live order book
            for each exchange and rank by how much Bitcoin you actually receive
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
                No estimates or invented values.
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

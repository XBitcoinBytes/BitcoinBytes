import { usePageMeta } from '@/hooks/usePageMeta';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import ParticleBackground from '@/components/particle-background';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">{title}</h2>
      <div className="text-white/60 space-y-4 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function Methodology() {
  usePageMeta({
    title: 'Methodology',
    description:
      'How BitcoinBytes calculates estimated Bitcoin purchase costs using live order-book depth walking and verified published exchange fee schedules.',
    canonical: '/methodology',
  });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <ParticleBackground />
      <Header />
      <main id="main-content" className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Methodology</h1>
        <p className="text-white/40 text-sm mb-10">
          How we calculate estimated Bitcoin purchase costs — and what we cannot calculate.
        </p>

        <Section id="overview" title="Overview">
          <p>
            BitcoinBytes estimates how much Bitcoin a US retail customer would receive for a given USD
            amount by combining two pieces of verified public information: <strong className="text-white">live
            order-book depth</strong> from each exchange's public API, and the <strong className="text-white">
            published entry-tier taker fee</strong> from each exchange's official fee schedule.
          </p>
          <p>
            Results are ranked by BTC received in descending order — the most Bitcoin for your money
            appears first. Only providers for which both pieces of data can be obtained without
            authentication are ranked. All others appear in an unranked section with a plain
            explanation of what is missing.
          </p>
        </Section>

        <Section id="order-book-walking" title="Order-book depth walking">
          <p>
            A market buy does not execute at a single price. It consumes ask-side liquidity from the
            order book starting at the best (lowest) ask price and working upward until the full USD
            notional is spent.
          </p>
          <p>
            For each ranked provider we fetch the live public ask-side order book (top 50 levels),
            then simulate this "walk":
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Start at the best ask level.</li>
            <li>Consume as many BTC as available at that price, up to the remaining USD.</li>
            <li>Advance to the next level and repeat until the full USD amount is spent.</li>
            <li>Compute the weighted-average execution price across all levels consumed.</li>
          </ol>
          <p>
            This correctly accounts for market impact: larger orders may consume multiple price levels
            and receive a slightly worse weighted price than small orders. A provider with deep
            liquidity at tight prices will rank higher than one with thin books even at a comparable
            headline price.
          </p>
          <p className="text-yellow-400/70 bg-yellow-900/10 border border-yellow-700/20 rounded-lg p-3">
            If the order book does not have sufficient depth to fill the entire order amount, that
            provider is listed as "incomplete" and excluded from ranking. No partial result is
            fabricated to fill the gap.
          </p>
        </Section>

        <Section id="fee-calculation" title="Fee calculation">
          <p>
            After the order-book walk we apply the provider's published entry-tier taker fee to the
            USD notional:
          </p>
          <pre className="bg-black/30 border border-white/10 rounded-lg p-4 font-mono text-xs text-white/70 overflow-x-auto">
{`fee_USD       = usd_amount × taker_fee_rate
fee_BTC       = fee_USD / weighted_avg_price
btc_received  = btc_pre_fee − fee_BTC
effective_rate = usd_amount / btc_received`}
          </pre>
          <p>
            Only the entry-tier taker rate is used — the rate a first-time buyer with no loyalty
            tokens or volume discounts would pay. Fee rates sourced from each exchange's official
            published schedule on the date listed in the data source citation shown with each result.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-white/10 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-3 py-2 text-white/60">Provider</th>
                  <th className="text-right px-3 py-2 text-white/60">Entry taker fee</th>
                  <th className="text-left px-3 py-2 text-white/60">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr><td className="px-3 py-2 text-white/80">Kraken</td><td className="px-3 py-2 text-right font-mono text-[#f7931a]">0.26%</td><td className="px-3 py-2 text-white/40">kraken.com/en-us/features/fee-schedule</td></tr>
                <tr><td className="px-3 py-2 text-white/80">Crypto.com Exchange</td><td className="px-3 py-2 text-right font-mono text-[#f7931a]">0.075%</td><td className="px-3 py-2 text-white/40">crypto.com/exchange/document/fees-limits</td></tr>
                <tr><td className="px-3 py-2 text-white/80">Binance.US</td><td className="px-3 py-2 text-right font-mono text-[#f7931a]">0.60%</td><td className="px-3 py-2 text-white/40">binance.us/fees</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="assumptions" title="Stated assumptions">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong className="text-white">User:</strong> Standard US retail customer with a verified account.</li>
            <li><strong className="text-white">Funding:</strong> USD already deposited via the platform's free or default funding method. ACH/bank transfer fees are excluded.</li>
            <li><strong className="text-white">Order type:</strong> Immediate market buy at current prices.</li>
            <li><strong className="text-white">Excluded:</strong> Withdrawal fees, Bitcoin network (miner) fees, payment-method surcharges, account verification fees.</li>
            <li><strong className="text-white">Fee tier:</strong> Entry-tier taker fee (no volume discounts, no loyalty-token discounts).</li>
            <li><strong className="text-white">Geographic:</strong> US market. Some providers have state-level restrictions.</li>
          </ul>
        </Section>

        <Section id="staleness" title="Data freshness and staleness">
          <p>
            Order-book data is cached for up to 45 seconds per provider to limit API load.
            Expired quotes are excluded from ranking. If no current quotes are available,
            the comparison shows “Price unavailable” and you can retry.
          </p>
          <p>
            A minimum of 3 fresh or stale (within the hard cutoff) ranked results must be present
            before any provider is declared the "best deal." If fewer than 3 qualify, no winner is
            declared and a degraded-data notice is shown.
          </p>
        </Section>

        <Section id="what-we-cannot-calculate" title="What we cannot calculate">
          <p>
            Several popular providers — including Coinbase Simple Buy, Strike, River, Cash App,
            Robinhood, and Swan — do not expose a public, unauthenticated API that returns both an
            amount-specific price and a verifiable fee. For these providers:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>No value is fabricated, estimated, or borrowed from another source.</li>
            <li>They appear in the unranked section with the specific reason ranking is impossible.</li>
            <li>Where available, an indicative price (with a clear "not a fee-inclusive quote" label) or a link to their published fee information is shown.</li>
            <li>The only way to obtain a genuine quote from these providers is to go to their site and initiate a purchase.</li>
          </ul>
        </Section>

        <Section id="not-advice" title="Not financial or investment advice">
          <p>
            BitcoinBytes is an informational tool. Rankings show the highest estimated BTC received
            based on mechanical calculation — they are not a recommendation to use any particular
            provider. Before purchasing Bitcoin, consider factors not captured here: provider
            reliability and regulatory status, self-custody options, customer support quality,
            security practices, geographic availability, and your own risk tolerance.
          </p>
          <p className="text-red-400/70">
            Cryptocurrency purchases involve risk. Prices can change between this estimate and
            execution. Past performance and rankings do not guarantee future results.
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

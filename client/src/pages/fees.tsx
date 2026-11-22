import { usePageMeta } from '@/hooks/usePageMeta';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PUBLISHED_FEES, STRIKE_FEE_NOTE, formatCheckedOn, formatFeePercent } from '@shared/feeSchedule';

const FEE_ROWS = Object.values(PUBLISHED_FEES).sort((a, b) => a.takerRate - b.takerRate);
const EXAMPLE_FEE = PUBLISHED_FEES.kraken;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">{title}</h2>
      <div className="text-white/60 space-y-4 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function Fees() {
  usePageMeta({ canonical: '/fees' });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      <main id="main-content" className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Spreads &amp; Fees Guide</h1>
        <p className="text-white/60 text-sm mb-10">
          Understanding what you actually pay when buying Bitcoin.
        </p>

        <Section id="types-of-costs" title="Types of costs">
          <p>
            When you buy Bitcoin the headline price is rarely the all-in cost. There are typically
            three categories of charges:
          </p>
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">1. Trading / taker fee</h3>
              <p>
                A percentage of the order value charged by the exchange for executing your trade.
                Called a "taker" fee because you are taking liquidity from the order book. This is
                the fee BitcoinBytes uses in its ranking calculations — it is published publicly and
                stable enough to verify.
              </p>
              <div className="mt-3 text-xs font-mono text-[#f7931a] bg-black/20 rounded p-2">
                Example: $500 × {formatFeePercent(EXAMPLE_FEE.takerRate)} = ${(500 * EXAMPLE_FEE.takerRate).toFixed(2)} fee on {EXAMPLE_FEE.providerName} (Tier 1, checked {formatCheckedOn()})
              </div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">2. Bid-ask spread</h3>
              <p>
                The difference between the best buy price (bid) and best sell price (ask) in the
                order book. When you place a market buy you pay the ask, not the mid-market price.
                BitcoinBytes accounts for this by walking the actual ask-side of the order book — the
                spread is embedded in the result naturally.
              </p>
              <p>
                Some providers (notably Robinhood) embed all their revenue in the spread with no
                separate explicit fee. This is harder to compare fairly because the spread is not
                publicly disclosed as a fixed rate.
              </p>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">3. Payment method fee</h3>
              <p>
                Many providers charge extra for certain funding methods. Instant bank transfers,
                debit cards, and credit cards often carry higher fees than ACH (bank transfer).
              </p>
              <p className="text-yellow-300">
                BitcoinBytes assumes USD already funded via the platform's free/default method
                (typically ACH bank transfer). It does not include payment-method fees. Always check
                the provider's fee page for your specific funding method.
              </p>
            </div>
          </div>
        </Section>

        <Section id="withdrawal-fees" title="Self-custody and withdrawal fees">
          <p>
            To move Bitcoin off an exchange to your own wallet ("self-custody") you pay a Bitcoin
            network fee (also called a miner fee). This fee goes to Bitcoin miners, not the exchange,
            and fluctuates with network demand.
          </p>
          <p>
            Some exchanges also charge their own withdrawal fee on top of the miner fee. These are
            excluded from all BitcoinBytes calculations because they depend on timing, network
            congestion, and wallet choice — not the purchase itself.
          </p>
          <p>
            For long-term Bitcoin storage, self-custody is generally recommended. See our{' '}
            <a href="/beginners" className="text-[#f7931a] hover:text-[#f7931a] underline">
              beginner's guide
            </a>{' '}
            for more on this.
          </p>
        </Section>

        <Section id="verified-fees" title="Published entry-tier fees used in rankings">
          <p>
            We only rank providers where we can verify the fee from an official public source.
            "Entry tier" means the fee rate for a new customer with no volume history or loyalty
            discounts.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-white/70">Exchange</th>
                  <th className="text-right px-4 py-3 text-white/70">Entry taker</th>
                  <th className="text-left px-4 py-3 text-white/70">Official source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {FEE_ROWS.map((f) => (
                  <tr key={f.providerId}>
                    <td className="px-4 py-3 text-white font-medium">
                      {f.providerName}
                      <div className="text-white/50 font-normal mt-0.5">{f.tier}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#f7931a]">{formatFeePercent(f.takerRate)}</td>
                    <td className="px-4 py-3">
                      <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#f7931a] underline">
                        {f.sourceLabel}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-white/60 text-xs">
            Exchange fees change. We cite the fee schedule source with each result — check it before
            transacting. <strong className="text-white" data-testid="fees-checked">Fees checked {formatCheckedOn()}</strong>{' '}
            on each exchange's official fee page (linked above). If a check is more than 30 days old, the comparison
            stops showing a lowest-cost badge until the rates are re-verified. See{' '}
            <a href="/methodology" className="text-[#f7931a] hover:text-[#f7931a] underline">Methodology</a>{' '}
            for how fees are applied.
          </p>
        </Section>

        <Section id="unranked-fees" title="Fees for unranked providers">
          <p>
            The following providers have no publicly accessible API for real-time purchase quotes.
            Their fees are taken from published marketing or help pages and may not reflect your
            actual purchase cost. Verify directly with each provider.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-white/70">Provider</th>
                  <th className="text-left px-4 py-3 text-white/70">Published fee note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/50">
                <tr><td className="px-4 py-3 text-white/70">Coinbase (simple buy)</td><td className="px-4 py-3">Variable — depends on payment method, order size, location. Check at checkout. (Coinbase Advanced is ranked above.)</td></tr>
                <tr>
                  <td className="px-4 py-3 text-white/70">Strike</td>
                  <td className="px-4 py-3" data-testid="strike-fee-note">
                    {STRIKE_FEE_NOTE.summary} Checked {formatCheckedOn()} on{' '}
                    <a href={STRIKE_FEE_NOTE.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#f7931a]">
                      {STRIKE_FEE_NOTE.sourceLabel}
                    </a>.
                  </td>
                </tr>
                <tr><td className="px-4 py-3 text-white/70">River</td><td className="px-4 py-3">~1.3% for instant purchases. Verify at river.com.</td></tr>
                <tr><td className="px-4 py-3 text-white/70">Cash App</td><td className="px-4 py-3">Service fee + spread. Shown only at point of sale.</td></tr>
                <tr><td className="px-4 py-3 text-white/70">Robinhood</td><td className="px-4 py-3">No explicit fee; revenue through embedded spread. Amount undisclosed.</td></tr>
                <tr><td className="px-4 py-3 text-white/70">Swan Bitcoin</td><td className="px-4 py-3">Up to 0.99% recurring; up to 2.29% one-time. Verify at swanbitcoin.com.</td></tr>
              </tbody>
            </table>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

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

export default function Legal() {
  usePageMeta({
    title: 'Disclosures, Terms & Privacy',
    description:
      'BitcoinBytes legal disclosures, terms of use, privacy policy, and support contact information.',
    canonical: '/legal',
  });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <ParticleBackground />
      <Header />
      <main id="main-content" className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Disclosures, Terms &amp; Privacy</h1>
        <p className="text-white/40 text-sm mb-10">
          Last updated: August 2026. This page governs your use of BitcoinBytes.
        </p>

        <Section id="disclosures" title="Disclosures">
          <p>
            <strong className="text-white">Not financial advice.</strong> BitcoinBytes is an
            informational comparison tool. Nothing on this site constitutes financial, investment,
            legal, or tax advice. Rankings reflect mechanical calculations — highest estimated Bitcoin
            received for a given USD amount — and are not a recommendation to use any particular
            provider, purchase Bitcoin, or make any investment.
          </p>
          <p>
            <strong className="text-white">Estimates, not quotes.</strong> All comparison results are
            estimates based on live order-book depth and published entry-tier taker fees at the time of
            calculation. They are not guaranteed executable quotes. Actual amounts received may differ
            due to order routing, payment method, account tier, promotional rates, and market movement
            between the estimate and execution. See our{' '}
            <a href="/methodology" className="text-[#f7931a]/70 hover:text-[#f7931a] underline">
              Methodology
            </a>{' '}
            for full details.
          </p>
          <p>
            <strong className="text-white">No affiliation.</strong> BitcoinBytes is not affiliated
            with, endorsed by, or compensated by any exchange or provider listed on this site.
            Provider names, logos, and trademarks are the property of their respective owners.
          </p>
          <p>
            <strong className="text-white">No guarantee of accuracy.</strong> Exchange fees, APIs, and
            product terms change without notice. While we use only verified public data sources, we
            cannot guarantee that information is current or accurate at the time you read it. Always
            verify fees and terms directly with the provider before transacting.
          </p>
          <p>
            <strong className="text-white">Cryptocurrency risk.</strong> Bitcoin and other
            cryptocurrencies are highly volatile. Their value can fall to zero. Past comparisons do
            not predict future prices or relative value. Only purchase what you can afford to lose.
          </p>
          <p>
            <strong className="text-white">Geographic limitations.</strong> Provider availability
            varies by US state. Some providers listed here may not be available in your jurisdiction.
            Check directly with each provider.
          </p>
        </Section>

        <Section id="terms" title="Terms of use">
          <p>
            By using BitcoinBytes you agree to these terms. If you do not agree, do not use the site.
          </p>
          <p>
            <strong className="text-white">Permitted use.</strong> BitcoinBytes is provided for
            personal, non-commercial informational use only. You may not scrape, systematically copy,
            reproduce, or redistribute the comparison data or any portion of this site without written
            permission.
          </p>
          <p>
            <strong className="text-white">No warranty.</strong> BitcoinBytes is provided "as is"
            without warranty of any kind, express or implied, including warranties of merchantability,
            fitness for a particular purpose, or non-infringement.
          </p>
          <p>
            <strong className="text-white">Limitation of liability.</strong> To the maximum extent
            permitted by law, BitcoinBytes and its operators are not liable for any direct, indirect,
            incidental, special, or consequential damages arising from your use of, or inability to
            use, this site or reliance on its content.
          </p>
          <p>
            <strong className="text-white">Third-party sites.</strong> Links to external providers are
            provided for convenience. We are not responsible for the content, accuracy, or practices
            of any third-party site.
          </p>
          <p>
            <strong className="text-white">Changes.</strong> We reserve the right to modify these
            terms at any time. Continued use of the site after changes constitutes acceptance.
          </p>
        </Section>

        <Section id="privacy" title="Privacy policy">
          <p>
            <strong className="text-white">What we collect.</strong> BitcoinBytes does not require
            account creation. We do not collect your name, email address, or payment information.
          </p>
          <p>
            <strong className="text-white">Usage data.</strong> Like most websites, our server logs
            standard access information: IP address, browser type, pages visited, and timestamps. This
            is used solely for security monitoring and aggregate traffic analysis. Logs are not sold
            or shared with third parties for marketing purposes.
          </p>
          <p>
            <strong className="text-white">Analytics.</strong> This site may use privacy-respecting
            analytics to understand aggregate usage. No personally identifiable information is
            transmitted to analytics services.
          </p>
          <p>
            <strong className="text-white">Cookies.</strong> We do not use tracking cookies. We may
            use session-local storage to remember your last comparison amount (stored in your browser,
            not on our servers).
          </p>
          <p>
            <strong className="text-white">Third-party APIs.</strong> To provide comparison results,
            our servers make requests to public APIs operated by Kraken, Binance.US, Crypto.com, and
            Coinbase. Your IP address is not forwarded in these requests.
          </p>
          <p>
            <strong className="text-white">Data retention.</strong> We do not store your comparison
            queries. Results are computed in real time and not logged to a database.
          </p>
        </Section>

        <Section id="support" title="Support">
          <p>
            BitcoinBytes is a small independent project. For questions, corrections to fee data, or
            to report a data error, contact us on X (Twitter):
          </p>
          <a
            href="https://twitter.com/xbitcoinbytes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#f7931a]/40 rounded-xl px-4 py-3 text-white/70 hover:text-white transition-colors text-sm"
          >
            @xbitcoinbytes on X (Twitter)
          </a>
          <p>
            For fee schedule corrections, please include a link to the official exchange source. We
            prioritize correcting fee data quickly as errors directly affect comparison accuracy.
          </p>
          <p>
            BitcoinBytes does not provide support for third-party exchange platforms. For help with
            your exchange account, contact that exchange directly.
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

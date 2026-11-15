import { usePageMeta } from '@/hooks/usePageMeta';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { ShieldCheck, Key, AlertTriangle, ExternalLink } from 'lucide-react';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">{title}</h2>
      <div className="text-white/60 space-y-4 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function Beginners() {
  usePageMeta({
    title: 'New to Bitcoin? Beginner\'s Guide',
    description:
      'A plain-language guide to buying Bitcoin safely in the US: what Bitcoin is, how to choose an exchange, fees to expect, and how to keep your Bitcoin secure.',
    canonical: '/beginners',
  });

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <ParticleBackground />
      <Header />
      <main id="main-content" className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">New to Bitcoin?</h1>
        <p className="text-white/40 text-sm mb-10">
          A plain-language guide for first-time buyers in the United States.
          Not financial advice — do your own research before purchasing.
        </p>

        <div className="bg-[#f7931a]/10 border border-[#f7931a]/25 rounded-xl p-4 mb-10 text-sm text-[#f7931a]/80">
          <strong className="text-[#f7931a]">Not financial advice.</strong> This page explains how Bitcoin
          purchases work mechanically. It does not recommend any investment or provider. Cryptocurrency
          purchases involve substantial risk of loss.
        </div>

        <Section id="what-is-bitcoin" title="What is Bitcoin?">
          <p>
            Bitcoin is a decentralized digital currency. Unlike dollars in a bank account, Bitcoin
            exists on a public ledger (the blockchain) that no single company or government controls.
            You can send Bitcoin anywhere in the world without a bank or payment processor.
          </p>
          <p>
            Bitcoin has a fixed supply cap of 21 million coins. New coins are created through a
            process called mining, which secures the network. The supply schedule is written into the
            protocol and cannot be changed.
          </p>
        </Section>

        <Section id="how-to-buy" title="How to buy Bitcoin">
          <p>
            For most US retail buyers the process is:
          </p>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <strong className="text-white">Choose an exchange</strong> — a regulated platform where
              you can convert USD to Bitcoin. Use our{' '}
              <a href="/" className="text-[#f7931a]/70 hover:text-[#f7931a] underline">comparison tool</a>{' '}
              to see estimated costs across providers.
            </li>
            <li>
              <strong className="text-white">Create and verify your account</strong> — US regulations
              require exchanges to verify your identity (KYC). This typically involves a government ID
              and sometimes a selfie.
            </li>
            <li>
              <strong className="text-white">Fund your account</strong> — link a bank account (ACH) for
              the lowest fees, or use a debit card for faster settlement at higher cost.
            </li>
            <li>
              <strong className="text-white">Place a market buy order</strong> — specify the USD amount
              you want to spend. You receive Bitcoin at the current market price minus the exchange's fee.
            </li>
            <li>
              <strong className="text-white">Decide where to store it</strong> — see the self-custody
              section below.
            </li>
          </ol>
        </Section>

        <Section id="fees-to-expect" title="Fees to expect">
          <p>
            Every exchange charges at least one type of fee. See our{' '}
            <a href="/fees" className="text-[#f7931a]/70 hover:text-[#f7931a] underline">full fees guide</a>{' '}
            for details. The main ones are:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong className="text-white">Trading fee</strong> — charged on each purchase (commonly 0.075%–2%)</li>
            <li><strong className="text-white">Spread</strong> — some providers embed their revenue in the buy/sell price gap</li>
            <li><strong className="text-white">Payment method fee</strong> — debit cards and instant transfers often cost more than ACH</li>
            <li><strong className="text-white">Withdrawal fee</strong> — to move Bitcoin to your own wallet (excluded from our comparisons)</li>
          </ul>
          <p>
            Our comparison tool shows the estimated all-in cost (trading fee + price spread) for a
            given USD amount. Payment method fees and withdrawal fees are not included.
          </p>
        </Section>

        <Section id="self-custody" title="Self-custody and wallets">
          <div className="flex items-start gap-3 bg-white/3 border border-white/10 rounded-xl p-4">
            <Key className="w-5 h-5 text-[#f7931a] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong className="text-white">"Not your keys, not your coins."</strong> When Bitcoin is
              held on an exchange, the exchange controls the private keys. If the exchange fails,
              is hacked, or freezes withdrawals, you may not be able to access your Bitcoin.
            </p>
          </div>
          <p>
            Self-custody means holding Bitcoin in a wallet you control, secured by a private key or
            seed phrase that only you possess. Options include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong className="text-white">Software wallets</strong> — apps on your phone or computer. Convenient but connected to the internet.</li>
            <li><strong className="text-white">Hardware wallets</strong> — physical devices (e.g. Ledger, Trezor) that store keys offline. Recommended for larger amounts.</li>
            <li><strong className="text-white">Paper wallets</strong> — keys printed on paper. Secure if generated offline, fragile physically.</li>
          </ul>
          <div className="flex items-start gap-3 bg-red-900/10 border border-red-700/20 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-red-400/70">
              <strong className="text-red-300">Never share your seed phrase.</strong> Anyone with access
              to your 12 or 24 word seed phrase can permanently steal all your Bitcoin. No legitimate
              wallet, exchange, or support agent will ever ask for it.
            </p>
          </div>
        </Section>

        <Section id="security" title="Staying safe">
          <div className="flex items-start gap-3 bg-white/3 border border-white/10 rounded-xl p-4 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#f7931a] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <ul className="space-y-2">
              <li>Enable two-factor authentication (2FA) on any exchange account — use an authenticator app, not SMS.</li>
              <li>Use a unique, strong password for each platform.</li>
              <li>Verify you are on the correct website before entering credentials (bookmark exchange URLs).</li>
              <li>Be skeptical of unsolicited messages offering investment advice or "recovery" services.</li>
              <li>Withdraw Bitcoin to your own wallet if you plan to hold long-term.</li>
            </ul>
          </div>
        </Section>

        <Section id="us-regulations" title="US regulations">
          <p>
            Bitcoin purchases are legal in the United States. Exchanges serving US customers must
            register with FinCEN, comply with Bank Secrecy Act rules, and in most states obtain a
            money transmission license. This is why identity verification (KYC) is required.
          </p>
          <p>
            Bitcoin is treated as property by the IRS. Selling or exchanging Bitcoin is generally a
            taxable event. Keep records of your purchases, including date, amount, and price paid.
            Consult a tax professional for your specific situation.
          </p>
          <p>
            Some exchanges are not available in all US states. Geographic restrictions are noted
            in our data-status page where known.
          </p>
        </Section>

        <Section id="further-reading" title="Further reading">
          <p className="text-white/40 text-xs mb-3">
            These are third-party resources. BitcoinBytes has no affiliation with any of them.
          </p>
          <ul className="space-y-2">
            {[
              { href: 'https://bitcoin.org/bitcoin.pdf', label: 'Bitcoin whitepaper (Satoshi Nakamoto, 2008)' },
              { href: 'https://www.irs.gov/businesses/small-businesses-self-employed/digital-assets', label: 'IRS guidance on digital assets' },
              { href: 'https://www.consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams', label: 'FTC: Cryptocurrency scam guide' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#f7931a]/60 hover:text-[#f7931a] transition-colors text-sm"
                >
                  {label} <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

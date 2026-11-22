import { Bitcoin, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

const COLUMNS = [
  {
    heading: 'Tools',
    links: [
      { label: 'Compare prices', href: '/' },
      { label: 'Data & provider status', href: '/data-status' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'Methodology', href: '/methodology' },
      { label: 'Spreads & fees', href: '/fees' },
      { label: 'New to Bitcoin?', href: '/beginners' },
      { label: 'Learn Bitcoin', href: '/learn' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Disclosures & terms', href: '/legal' },
      { label: 'Privacy', href: '/legal#privacy' },
      { label: 'Support', href: '/legal#support' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#07070f] text-white/50 text-sm mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
              <Bitcoin className="w-5 h-5 text-[#f7931a]" aria-hidden="true" />
              Bitcoin<span className="text-[#f7931a]">Bytes</span>
            </div>
            <p className="text-xs leading-relaxed text-white/60 mb-4">
              Transparent Bitcoin purchase price comparison. Live order books,
              verified fees, no fabricated data.
            </p>
            <a
              href="https://twitter.com/xbitcoinbytes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#f7931a] transition-colors"
              aria-label="@xbitcoinbytes on X (Twitter)"
            >
              @xbitcoinbytes <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

          {/* Nav columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs text-white/60 hover:text-white/70 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} BitcoinBytes. Not financial advice.</p>
          <p className="text-center sm:text-right leading-relaxed max-w-md">
            Results are estimates based on live order books and published entry-tier taker fees.
            Not guaranteed retail checkout quotes. Withdrawal and network fees excluded.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Bitcoin, Menu, X, ExternalLink } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Compare' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/fees', label: 'Fees Guide' },
  { href: '/beginners', label: 'New to Bitcoin?' },
  { href: '/learn', label: 'Learn' },
  { href: '/data-status', label: 'Data Status' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-[#0a0a12]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg hover:text-[#f7931a] transition-colors" aria-label="BitcoinBytes home">
          <Bitcoin className="w-6 h-6 text-[#f7931a]" aria-hidden="true" />
          <span>Bitcoin<span className="text-[#f7931a]">Bytes</span></span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location === href
                  ? 'bg-[#f7931a]/15 text-[#f7931a]'
                  : 'text-white/60 hover:text-white hover:bg-white/6'
              }`}
              aria-current={location === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://twitter.com/xbitcoinbytes"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1 text-xs text-white/60 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors"
            aria-label="@xbitcoinbytes on X (Twitter)"
          >
            @xbitcoinbytes <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/8 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-white/8 bg-[#0a0a12]/95 px-4 py-3 space-y-1"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                location === href
                  ? 'bg-[#f7931a]/15 text-[#f7931a]'
                  : 'text-white/70 hover:text-white hover:bg-white/6'
              }`}
              onClick={() => setMenuOpen(false)}
              aria-current={location === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://twitter.com/xbitcoinbytes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 text-sm text-white/60 hover:text-white/70 transition-colors"
          >
            @xbitcoinbytes <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      )}
    </header>
  );
}

export default Header;

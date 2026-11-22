import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Bitcoin, Menu, X, ExternalLink, Youtube } from 'lucide-react';
import { CHANNEL_URL, X_URL, X_HANDLE } from '@/content/channel';

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
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
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
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1 whitespace-nowrap text-xs text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors"
            aria-label="BitcoinBytes on YouTube (opens in a new tab)"
          >
            <Youtube className="w-3.5 h-3.5 text-[#f7931a]" aria-hidden="true" /> YouTube
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex items-center gap-1 whitespace-nowrap text-xs text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors"
            aria-label={`${X_HANDLE} on X (opens in a new tab)`}
          >
            <span aria-hidden="true" className="font-semibold">𝕏</span><span className="hidden xl:inline">{X_HANDLE}</span>
          </a>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/8 transition-colors"
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
          className="lg:hidden border-t border-white/8 bg-[#0a0a12]/95 px-4 py-3 space-y-1"
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
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Youtube className="w-4 h-4 text-[#f7931a]" aria-hidden="true" /> YouTube <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            {X_HANDLE} on X <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  );
}

export default Header;

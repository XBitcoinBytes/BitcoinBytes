import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: 'Page not found', description: 'The page you were looking for does not exist.' });
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-md">
          <p className="text-[#f7931a] font-mono text-sm mb-3">404</p>
          <h1 className="text-3xl font-bold mb-3">Page not found</h1>
          <p className="text-white/70 mb-8">That page doesn’t exist or has moved.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/" className="rounded-lg bg-[#f7931a] px-5 py-2.5 font-semibold text-black hover:bg-[#ffa733]">Compare prices</a>
            <a href="/learn" className="rounded-lg border border-white/15 px-5 py-2.5 font-semibold text-white hover:border-[#f7931a]/60">Learn Bitcoin</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { usePageMeta } from '@/hooks/usePageMeta';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Info } from 'lucide-react';

interface ProviderStatus {
  providerId: string;
  providerName: string;
  providerUrl: string;
  state: string;
  reason?: string;
  fetchedAt: number;
  dataAgeMs?: number;
  feeRateSource?: string;
  orderBookSource?: string;
  takerFeeRate?: number;
  btcReceived?: number;
  bestAsk?: number;
}

interface StatusResponse {
  ranked: ProviderStatus[];
  unranked: ProviderStatus[];
  generatedAt: string;
  hasWinner: boolean;
}

function StatusBadge({ state }: { state: string }) {
  if (state === 'live') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-700/30">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
    </span>
  );
  if (state === 'stale') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700/30">
      <Clock className="w-3 h-3" />Stale
    </span>
  );
  if (state === 'incomplete') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700/30">
      <Info className="w-3 h-3" />Incomplete
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400 border border-red-700/30">
      <AlertTriangle className="w-3 h-3" />Unavailable
    </span>
  );
}

export default function DataStatus() {
  usePageMeta({
    title: 'Data & Provider Status',
    description:
      'Live status of Bitcoin price data sources used in BitcoinBytes comparisons. See which exchanges are currently providing verified data.',
    canonical: '/data-status',
  });

  const { data, isFetching, error, refetch } = useQuery<StatusResponse, Error>({
    queryKey: ['data-status'],
    queryFn: async () => {
      const res = await fetch('/api/compare?amount=500');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 30_000,
    gcTime: 120_000,
    retry: 1,
  });

  const all: ProviderStatus[] = data
    ? [...(data.ranked as ProviderStatus[]), ...(data.unranked as ProviderStatus[])]
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <ParticleBackground />
      <Header />
      <main id="main-content" className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-start justify-between mb-2 gap-4">
          <h1 className="text-3xl font-bold text-white">Data &amp; Provider Status</h1>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition-colors disabled:opacity-40"
            aria-label="Refresh provider status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <p className="text-white/40 text-sm mb-8">
          Live status of data sources used in comparison rankings.
          {data && (
            <span className="ml-1">Updated {new Date(data.generatedAt).toLocaleTimeString()}.</span>
          )}
        </p>

        {error && (
          <div className="rounded-xl border border-red-700/40 bg-red-900/10 p-4 mb-6 text-sm text-red-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Could not fetch provider status</p>
              <p className="text-red-400/60">{error.message}</p>
            </div>
          </div>
        )}

        {isFetching && !data && (
          <div className="flex items-center gap-3 py-16 text-white/40">
            <RefreshCw className="w-5 h-5 animate-spin" />Checking all providers…
          </div>
        )}

        {all.length > 0 && (
          <div className="space-y-3 mb-10">
            {all.map((p) => (
              <div key={p.providerId} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <StatusBadge state={p.state} />
                    <span className="text-white font-medium text-sm">{p.providerName}</span>
                    {p.takerFeeRate !== undefined && (
                      <span className="text-xs text-white/30 font-mono">
                        {(p.takerFeeRate * 100).toFixed(3)}% taker
                      </span>
                    )}
                  </div>
                  {p.bestAsk !== undefined && (
                    <span className="text-xs font-mono text-white/50">
                      Ask: ${p.bestAsk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {p.reason && (
                  <p className="text-xs text-white/35 mt-2 leading-relaxed">{p.reason}</p>
                )}
                {p.feeRateSource && (
                  <p className="text-xs text-white/25 mt-1">Fee source: {p.feeRateSource}</p>
                )}
                {p.orderBookSource && (
                  <p className="text-xs text-white/25">Order book: {p.orderBookSource}</p>
                )}
                {p.dataAgeMs !== undefined && (
                  <p className="text-xs text-white/20 mt-1">
                    Data age: {Math.round(p.dataAgeMs / 1000)}s
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/8 pt-8">
          <h2 className="text-lg font-semibold text-white mb-4">About our data sources</h2>
          <div className="space-y-4 text-sm text-white/55 leading-relaxed">
            <p>
              <strong className="text-white">Ranked providers</strong> (Kraken, Crypto.com Exchange,
              Binance.US) supply live order-book data via their public REST APIs. Order books are
              cached for up to 90 seconds per provider to limit API load.
            </p>
            <p>
              <strong className="text-white">Unranked providers</strong> (Coinbase, Strike, River,
              Cash App, Robinhood, Swan) do not expose a public, unauthenticated endpoint that
              returns both an amount-specific price and a verifiable fee. Their status will remain
              "incomplete" unless they publish such an API.
            </p>
            <p>
              <strong className="text-white">No synthetic data.</strong> If a provider's API is
              unreachable, we show "unavailable" — never a fabricated or estimated price in its place.
              Rankings require a minimum of 3 live/stale verified results.
            </p>
            <p>
              <strong className="text-white">Data integrity</strong> — all order-book data is validated
              on receipt. Entries with non-finite prices or quantities are discarded. Only prices
              between $10,000 and $500,000 USD/BTC are accepted to catch obvious API errors.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

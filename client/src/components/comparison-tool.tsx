import { usePriceClock } from '@/hooks/use-bitcoin-price';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, RefreshCw, AlertTriangle, Clock, CheckCircle, Info, Trophy } from 'lucide-react';

interface RankedResult {
  providerId: string;
  providerName: string;
  providerUrl: string;
  state: 'live' | 'stale';
  btcReceived: number;
  effectivePricePerBtc: number;
  feeUsd: number;
  feePercent: number;
  usdSpent: number;
  bestAsk: number;
  levelsConsumed: number;
  takerFeeRate: number;
  feeRateSource: string;
  orderBookSource: string;
  fetchedAt: number;
  dataAgeMs: number;
}

interface UnrankedResult {
  providerId: string;
  providerName: string;
  providerUrl: string;
  state: 'unavailable' | 'incomplete' | 'error';
  reason: string;
  partialData?: {
    indicativeAsk?: number;
    publishedFeeNote?: string;
    feeUrl?: string;
  };
  fetchedAt: number;
}

interface ComparisonResponse {
  usdAmount: number;
  ranked: RankedResult[];
  unranked: UnrankedResult[];
  hasWinner: boolean;
  generatedAt: string;
  engineVersion: string;
  hasStaleData: boolean;
  disclaimer: string;
}

const PRESETS = [50, 100, 250, 500, 1000];

function formatBtc(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  return n.toFixed(8);
}

function formatUsd(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatAge(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  return `${Math.round(ms / 60_000)}m ago`;
}

function StatePill({ state }: { state: RankedResult['state'] | UnrankedResult['state'] }) {
  if (state === 'live') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-700/40">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
    </span>
  );
  if (state === 'stale') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 border border-yellow-700/40">
      <Clock className="w-3 h-3" />Stale
    </span>
  );
  if (state === 'incomplete') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/40">
      <Info className="w-3 h-3" />Incomplete data
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-700/40">
      <AlertTriangle className="w-3 h-3" />Unavailable
    </span>
  );
}

function RankedCard({ result, rank, isWinner }: { result: RankedResult; rank: number; isWinner: boolean }) {
  return (
    <div className={`relative rounded-xl border transition-all ${
      isWinner
        ? 'border-[#f7931a] bg-[#f7931a]/5 shadow-lg shadow-[#f7931a]/10'
        : 'border-white/10 bg-white/3 hover:border-white/20'
    }`}>
      {isWinner && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 bg-[#f7931a] text-black text-xs font-bold px-3 py-1 rounded-full">
          <Trophy className="w-3 h-3" />Lowest estimated cost
        </div>
      )}
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-white/60 font-mono">#{rank}</span>
              <h3 className="text-white font-semibold text-lg">{result.providerName}</h3>
              <StatePill state={result.state} />
            </div>
            <div className="text-xs text-white/60">
              Data fetched {formatAge(result.dataAgeMs)} · {result.levelsConsumed} order book level{result.levelsConsumed !== 1 ? 's' : ''} consumed
            </div>
          </div>
          <a
            href={result.providerUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex-shrink-0 flex items-center gap-1 text-xs text-[#f7931a] hover:text-[#f7931a] border border-[#f7931a]/30 hover:border-[#f7931a]/60 rounded-lg px-3 py-1.5 transition-colors"
            aria-label={`Visit ${result.providerName} (opens in a new tab)`}
          >
            Visit site <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-white/60 mb-1">BTC Received</div>
            <div className={`font-mono font-bold ${isWinner ? 'text-[#f7931a]' : 'text-white'} text-sm sm:text-base leading-tight`}>
              {formatBtc(result.btcReceived)}
            </div>
            <div className="text-xs text-white/60 mt-0.5">BTC</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-white/60 mb-1">Effective Rate</div>
            <div className="font-mono text-white text-sm leading-tight">{formatUsd(result.effectivePricePerBtc)}</div>
            <div className="text-xs text-white/60 mt-0.5">per BTC all-in</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-white/60 mb-1">Fee Paid</div>
            <div className="font-mono text-white text-sm leading-tight">{formatUsd(result.feeUsd)}</div>
            <div className="text-xs text-white/60 mt-0.5">{result.feePercent.toFixed(2)}% taker</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-white/60 mb-1">Best Ask</div>
            <div className="font-mono text-white text-sm leading-tight">{formatUsd(result.bestAsk)}</div>
            <div className="text-xs text-white/60 mt-0.5">mid-market ref</div>
          </div>
        </div>

        <details className="mt-3">
          <summary className="text-xs text-white/60 cursor-pointer hover:text-white/50 select-none">
            Data sources & methodology
          </summary>
          <div className="mt-2 text-xs text-white/60 space-y-1">
            <p><span className="text-white/60">Order book:</span> {result.orderBookSource}</p>
            <p><span className="text-white/60">Fee rate:</span> {result.feeRateSource}</p>
          </div>
        </details>
      </div>
    </div>
  );
}

function UnrankedCard({ result }: { result: UnrankedResult }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white/70 font-medium text-sm">{result.providerName}</h3>
            <StatePill state={result.state} />
          </div>
          <p className="text-xs text-white/60 mb-2 leading-relaxed">{result.reason}</p>
          {result.partialData?.publishedFeeNote && (
            <p className="text-xs text-white/60 italic">
              {result.partialData.publishedFeeNote}
              {result.partialData.feeUrl && (
                <> · <a href={result.partialData.feeUrl} target="_blank" rel="noopener noreferrer" className="text-[#f7931a] hover:text-[#f7931a] underline">fee details</a></>
              )}
            </p>
          )}
          {result.partialData?.indicativeAsk && (
            <p className="text-xs text-white/60 mt-1">
              Indicative ask: <span className="font-mono text-white/60">{formatUsd(result.partialData.indicativeAsk)}</span>
              <span className="ml-1 text-white/60">(fee unknown — not ranked)</span>
            </p>
          )}
        </div>
        <a
          href={result.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xs text-white/60 hover:text-white/60 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1"
          aria-label={`Visit ${result.providerName}`}
        >
          Visit <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

async function fetchComparison(amount: number): Promise<ComparisonResponse> {
  const res = await fetch(`/api/compare?amount=${amount}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function ComparisonTool() {
  const now = usePriceClock();
  const [inputValue, setInputValue] = useState('100');
  const [submittedAmount, setSubmittedAmount] = useState(100);

  const { data, isFetching, error, refetch } = useQuery<ComparisonResponse, Error>({
    queryKey: ['compare', submittedAmount],
    queryFn: () => fetchComparison(submittedAmount),
    staleTime: 0,
    refetchInterval: 30000,
    gcTime: 120_000,
    retry: 1,
  });

  const expired = !!data?.ranked.some(result => now - result.fetchedAt > 45000);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(inputValue.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n >= 1 && n <= 1_000_000) {
      setSubmittedAmount(n);
    }
  }, [inputValue]);

  const handlePreset = useCallback((n: number) => {
    setInputValue(String(n));
    setSubmittedAmount(n);
  }, []);

  return (
    <section aria-label="Bitcoin purchase comparison" className="w-full max-w-3xl mx-auto">
      {/* Input */}
      <div className="bg-white/4 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">How much USD do you want to spend?</h2>
        <p className="text-sm text-white/50 mb-4">
          We'll show you how much Bitcoin each provider would give you after their fees.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 font-semibold select-none">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="1000000"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-black/30 border border-white/15 text-white rounded-xl pl-8 pr-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#f7931a]/50 focus:border-[#f7931a]/50 transition-all"
              aria-label="USD amount to spend on Bitcoin"
            />
          </div>
          <button
            type="submit"
            className="bg-[#f7931a] hover:bg-[#f7931a]/85 text-black font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
            disabled={isFetching}
          >
            Compare
          </button>
        </form>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Preset amounts">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                submittedAmount === preset
                  ? 'bg-[#f7931a]/15 border-[#f7931a]/50 text-[#f7931a]'
                  : 'border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
              }`}
              aria-pressed={submittedAmount === preset}
            >
              ${preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isFetching && (
        <div className="flex items-center justify-center gap-3 py-16 text-white/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Fetching live order books…</span>
        </div>
      )}

      {(error || expired) && !isFetching && (
        <div className="rounded-xl border border-red-700/40 bg-red-900/10 p-5 text-sm text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Price unavailable</p>
            <p className="text-red-300">{error?.message || 'Quotes have expired. Refresh to fetch current prices.'}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-red-400 underline hover:text-red-300"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {data && !error && !expired && !isFetching && (
        <div>
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-white/60 text-sm">
                Results for{' '}
                <span className="text-white font-semibold font-mono">{formatUsd(data.usdAmount)}</span>
                {' '}USD
              </span>
              {data.hasStaleData && (
                <span className="ml-2 text-xs text-yellow-300">· some data may be stale</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Clock className="w-3 h-3" />
              {new Date(data.generatedAt).toLocaleTimeString()}
              <button
                onClick={() => refetch()}
                className="ml-1 text-white/60 hover:text-white/70 transition-colors"
                aria-label="Refresh results"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Degraded-data notice */}
          {!data.hasWinner && (
            <div className="rounded-xl border border-yellow-700/40 bg-yellow-900/10 p-4 mb-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-300 font-medium mb-1">Not enough data to rank providers</p>
                <p className="text-yellow-300">
                  Fewer than 3 providers returned verified results. No winner is declared.
                  {data.ranked.length > 0
                    ? ` ${data.ranked.length} result${data.ranked.length !== 1 ? 's' : ''} shown for reference.`
                    : ' Please try again shortly.'}
                </p>
              </div>
            </div>
          )}

          {/* Ranked results */}
          {data.ranked.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Ranked by BTC received
              </h3>
              {data.ranked.map((result, i) => (
                <RankedCard
                  key={result.providerId}
                  result={result}
                  rank={i + 1}
                  isWinner={data.hasWinner && i === 0}
                />
              ))}
            </div>
          )}

          {/* Unranked providers */}
          {data.unranked.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4" />
                Other providers — not ranked
              </h3>
              <p className="text-xs text-white/60 mb-3">
                These providers could not supply verified amount-specific price and fee data.
                No values are fabricated. Visit each provider directly for a real quote.
              </p>
              {data.unranked.map((result) => (
                <UnrankedCard key={result.providerId} result={result} />
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-xl border border-white/6 bg-white/2 p-4 text-xs text-white/60 leading-relaxed">
            <span className="text-white/50 font-medium">Estimates only. </span>
            {data.disclaimer}
            {' '}
            <a href="/methodology" className="text-[#f7931a] hover:text-[#f7931a] underline">
              Full methodology →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

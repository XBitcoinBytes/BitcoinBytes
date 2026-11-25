import { useQuery } from '@tanstack/react-query';

interface NetworkNow {
  available: boolean;
  blockHeight: number | null;
  avgBlockTimeSeconds: number | null;
  blocksUntilAdjustment: number | null;
  nextAdjustmentHeight: number | null;
  source: string | null;
  sourceUrl: string | null;
  fetchedAt: string | null;
  stale: boolean;
}

function formatBlockTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

function Fact({ label, value, note, href, linkText }: { label: string; value: string; note: string; href: string; linkText: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <dt className="text-xs text-white/60">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-white font-mono tabular-nums">{value}</dd>
      <dd className="mt-1 text-xs text-white/60">
        {note} <a href={href} className="underline underline-offset-2 hover:text-[#f7931a]">{linkText}</a>
      </dd>
    </div>
  );
}

/** "Network right now": block height, average block time, blocks to the next difficulty adjustment. Facts only, no price. */
export default function NetworkNowPanel() {
  const { data, isLoading } = useQuery<NetworkNow>({
    queryKey: ['/api/network/now'],
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });

  if (!isLoading && (!data?.available || data.blockHeight == null)) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70" data-testid="network-now-unavailable">
        Live network facts are unavailable right now. You can check the current block on{' '}
        <a href="https://mempool.space/" target="_blank" rel="noopener noreferrer" className="text-[#f7931a] underline underline-offset-2 hover:text-[#ffb04d]">mempool.space</a>
        <span className="sr-only"> (opens in a new tab)</span>.
      </p>
    );
  }

  const loading = isLoading || !data;
  const v = (x: string) => (loading ? '…' : x);
  const updated = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div data-testid="network-now" aria-busy={loading}>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Fact label="Block height" value={v(data?.blockHeight?.toLocaleString('en-US') ?? '')} note="Blocks in the chain so far." href="#block-height" linkText="Block height, defined" />
        <Fact
          label="Average block time"
          value={v(data?.avgBlockTimeSeconds != null ? formatBlockTime(data.avgBlockTimeSeconds) : 'Unavailable')}
          note="So far this difficulty period. The target is 10 min."
          href="#block"
          linkText="Block, defined"
        />
        <Fact
          label="Blocks until difficulty adjustment"
          value={v(data?.blocksUntilAdjustment != null ? data.blocksUntilAdjustment.toLocaleString('en-US') : 'Unavailable')}
          note={data?.nextAdjustmentHeight != null ? `Next adjustment at block ${data.nextAdjustmentHeight.toLocaleString('en-US')}.` : 'Every 2,016 blocks.'}
          href="#difficulty-adjustment"
          linkText="Difficulty adjustment, defined"
        />
      </dl>
      <p className="mt-2 text-xs text-white/60">
        {loading ? (
          'Loading network facts…'
        ) : (
          <>
            {data.stale ? 'Last good reading' : 'Updated'}{updated ? ` ${updated}` : ''} from{' '}
            <a href={data.sourceUrl ?? 'https://mempool.space/'} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#f7931a]">{data.source}</a>
            <span className="sr-only"> (opens in a new tab)</span>. Network facts only; no price.
          </>
        )}
      </p>
    </div>
  );
}

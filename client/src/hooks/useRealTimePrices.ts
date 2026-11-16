import { usePriceClock } from './use-bitcoin-price';
import { useQuery } from '@tanstack/react-query';

interface PriceResponse {
  available: boolean;
  bitcoin: { usd: number };
  source: string;
  timestamp: string;
}

// Poll the same public-feed service as the comparison cards. Hide failed quotes.
export const useRealTimePrices = () => {
  const now = usePriceClock();
  const query = useQuery<PriceResponse>({
    queryKey: ['/api/bitcoin/price'], refetchInterval: 30000, staleTime: 0, retry: false
  });
  const data = !query.isError && query.data && now - new Date(query.data.timestamp).getTime() <= 45000 ? query.data : undefined;
  return {
    current: data?.available ? { price: data.bitcoin.usd, source: data.source, timestamp: new Date(data.timestamp), confidence: null } : null,
    previous: null,
    isLoading: query.isLoading,
    error: query.isError ? 'Price unavailable' : null,
    lastUpdate: data ? new Date(data.timestamp) : null,
    connectionStatus: data ? 'connected' as const : 'disconnected' as const,
    isRealTime: false
  };
};

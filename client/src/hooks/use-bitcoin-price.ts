import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PriceComparison } from "@shared/schema";

export function usePriceClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function useBitcoinPrice() {
  const now = usePriceClock();
  const query = useQuery<PriceComparison>({
    queryKey: ["/api/prices/comparison"],
    refetchInterval: 30000,
    staleTime: 0,
    gcTime: 600000, // Keep in cache for 10 minutes
    retry: false,
    retryDelay: 1000,
  });
  return { ...query, data: query.isError || (query.data && now - Math.min(...query.data.exchanges.map(e => new Date(e.currentPrice.timestamp).getTime())) > 45000) ? undefined : query.data };
}

export function useCurrentPrices() {
  return useQuery({
    queryKey: ["/api/prices/current"],
    refetchInterval: 30000,
    staleTime: 0,
    gcTime: 600000,
    retry: false,
    retryDelay: 1000,
  });
}

export function useHistoricalPrices(timestamp?: Date) {
  return useQuery({
    queryKey: ["/api/prices/historical", timestamp?.toISOString()],
    enabled: !!timestamp,
  });
}

import { useQuery } from "@tanstack/react-query";
import type { PriceComparison } from "@shared/schema";

export function useBitcoinPrice() {
  return useQuery<PriceComparison>({
    queryKey: ["/api/prices/comparison"],
    refetchInterval: 120000, // Reduced to 2 minutes to prevent rate limiting
    staleTime: 90000, // Consider data stale after 90 seconds
    gcTime: 600000, // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

export function useCurrentPrices() {
  return useQuery({
    queryKey: ["/api/prices/current"],
    refetchInterval: 120000, // Reduced to 2 minutes
    staleTime: 90000,
    gcTime: 600000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useHistoricalPrices(timestamp?: Date) {
  return useQuery({
    queryKey: ["/api/prices/historical", timestamp?.toISOString()],
    enabled: !!timestamp,
  });
}

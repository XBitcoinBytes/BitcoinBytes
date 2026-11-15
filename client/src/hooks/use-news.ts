import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@shared/schema";

export function useNews(limit = 10, offset = 0) {
  return useQuery<NewsArticle[]>({
    queryKey: ["/api/news", limit, offset],
    refetchInterval: 300000, // Reduced to 5 minutes for better performance
    staleTime: 240000, // Consider data stale after 4 minutes
    gcTime: 900000, // Keep in cache for 15 minutes
    retry: 2,
    retryDelay: 2000,
  });
}

export function useNewsByImpact(impact: string) {
  return useQuery<NewsArticle[]>({
    queryKey: ["/api/news/impact", impact],
    refetchInterval: 300000, // Reduced to 5 minutes
    staleTime: 240000,
    gcTime: 900000,
    retry: 2,
    retryDelay: 2000,
  });
}

export function useTrendingTopics() {
  return useQuery({
    queryKey: ["/api/news/trending"],
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
  });
}

import { apiRequest } from "./queryClient";
import type { 
  Exchange, 
  ExchangePriceData, 
  PriceComparison, 
  NewsArticle, 
  HistoricalComparison 
} from "@shared/schema";

export const api = {
  // Exchange API
  getExchanges: async (): Promise<Exchange[]> => {
    const response = await apiRequest("GET", "/api/exchanges");
    return response.json();
  },

  getExchange: async (id: number): Promise<Exchange> => {
    const response = await apiRequest("GET", `/api/exchanges/${id}`);
    return response.json();
  },

  // Price API
  getCurrentPrices: async (): Promise<ExchangePriceData[]> => {
    const response = await apiRequest("GET", "/api/prices/current");
    return response.json();
  },

  getPriceComparison: async (): Promise<PriceComparison> => {
    const response = await apiRequest("GET", "/api/prices/comparison");
    return response.json();
  },

  getHistoricalPrices: async (timestamp?: Date): Promise<HistoricalComparison> => {
    const params = timestamp ? `?timestamp=${timestamp.toISOString()}` : "";
    const response = await apiRequest("GET", `/api/prices/historical${params}`);
    return response.json();
  },

  // News API
  getNews: async (limit = 10, offset = 0): Promise<NewsArticle[]> => {
    const response = await apiRequest("GET", `/api/news?limit=${limit}&offset=${offset}`);
    return response.json();
  },

  getNewsByImpact: async (impact: string): Promise<NewsArticle[]> => {
    const response = await apiRequest("GET", `/api/news/impact/${impact}`);
    return response.json();
  },

  getTrendingTopics: async (): Promise<Array<{ topic: string; growth: number }>> => {
    const response = await apiRequest("GET", "/api/news/trending");
    return response.json();
  },

  incrementNewsViews: async (id: number): Promise<void> => {
    await apiRequest("POST", `/api/news/${id}/view`);
  },

  incrementNewsShares: async (id: number): Promise<void> => {
    await apiRequest("POST", `/api/news/${id}/share`);
  },
};

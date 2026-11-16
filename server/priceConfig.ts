// Price validation must not assume a market level or generate a baseline.
export const PRICE_CONFIG = {
  CACHE_DURATION: 45000,
  UPDATE_INTERVAL: 30000,
};
export function isPriceValid(price: number): boolean {
  return Number.isFinite(price) && price > 0;
}

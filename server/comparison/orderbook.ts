/**
 * Order-Book Depth Walker
 *
 * Simulates a market buy for a given USD notional by consuming ask-side
 * levels from best (lowest) to worst. Returns the BTC amount received and
 * the effective all-in price before the taker fee is applied.
 *
 * This is the closest approximation to a real market execution that is
 * achievable without an authenticated order preview endpoint.
 */

export interface OrderBookLevel {
  /** Ask price in USD per BTC */
  price: number;
  /** BTC quantity available at this price */
  quantity: number;
}

export interface WalkResult {
  /** BTC received from the walk (pre-fee) */
  btcPreFee: number;
  /** USD fully consumed walking the book */
  usdConsumed: number;
  /** Weighted average execution price (USD/BTC, pre-fee) */
  weightedAvgPrice: number;
  /** Number of price levels consumed */
  levelsConsumed: number;
  /** True if the book had enough depth to fill the entire USD amount */
  fullyFilled: boolean;
}

/**
 * Walk the ask side of the order book to simulate a USD-notional market buy.
 *
 * @param asks   Sorted ascending by price (best ask first)
 * @param usdAmount  Gross USD to spend (pre-fee; fee is applied by the caller)
 */
export function walkOrderBook(asks: OrderBookLevel[], usdAmount: number): WalkResult {
  if (!Array.isArray(asks) || asks.length === 0) {
    throw new Error('Order book is empty or invalid');
  }
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
    throw new Error(`Invalid USD amount: ${usdAmount}`);
  }

  let remainingUsd = usdAmount;
  let totalBtc = 0;
  let totalUsdSpent = 0;
  let levelsConsumed = 0;

  for (const level of asks) {
    if (remainingUsd <= 0) break;

    const { price, quantity } = level;
    if (!Number.isFinite(price) || price <= 0) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const usdAtThisLevel = price * quantity;
    const usdToSpend = Math.min(remainingUsd, usdAtThisLevel);
    const btcAtThisLevel = usdToSpend / price;

    totalBtc += btcAtThisLevel;
    totalUsdSpent += usdToSpend;
    remainingUsd -= usdToSpend;
    levelsConsumed++;
  }

  const fullyFilled = remainingUsd <= 0.01; // allow $0.01 rounding slack
  const weightedAvgPrice = totalUsdSpent > 0 ? totalUsdSpent / totalBtc : 0;

  return {
    btcPreFee: totalBtc,
    usdConsumed: totalUsdSpent,
    weightedAvgPrice,
    levelsConsumed,
    fullyFilled,
  };
}

/**
 * Apply taker fee to reduce BTC received.
 * Fee is charged as a percentage of the USD notional, converting to BTC cost.
 *
 * Effective model: provider deducts fee from BTC received.
 *   btcReceived = btcPreFee - (usdAmount * feeRate / avgPrice)
 *
 * This matches how most exchanges calculate maker/taker fees.
 */
export function applyTakerFee(
  walk: WalkResult,
  usdAmount: number,
  takerFeeRate: number,
): {
  btcReceived: number;
  feeUsd: number;
  feePercent: number;
  effectivePricePerBtc: number;
} {
  if (!Number.isFinite(takerFeeRate) || takerFeeRate < 0 || takerFeeRate >= 1) {
    throw new Error(`Invalid taker fee rate: ${takerFeeRate}`);
  }

  const feeUsd = usdAmount * takerFeeRate;
  const feeBtc = walk.weightedAvgPrice > 0 ? feeUsd / walk.weightedAvgPrice : 0;
  const btcReceived = walk.btcPreFee - feeBtc;
  const effectivePricePerBtc = btcReceived > 0 ? usdAmount / btcReceived : 0;

  return {
    btcReceived: Math.max(0, btcReceived),
    feeUsd,
    feePercent: takerFeeRate * 100,
    effectivePricePerBtc,
  };
}

/** Parse a raw Kraken order book response into normalised levels */
export function parseKrakenBook(raw: unknown): OrderBookLevel[] {
  // Kraken: { error: [], result: { XXBTZUSD: { asks: [["price","qty","ts"],...], bids: [...] } } }
  const result = (raw as any)?.result;
  if (!result) throw new Error('Kraken: missing result field');

  const pairKey = Object.keys(result)[0];
  const asks: unknown[][] = result[pairKey]?.asks;
  if (!Array.isArray(asks)) throw new Error('Kraken: missing asks array');

  return asks
    .map((row) => ({
      price: parseFloat(String(row[0])),
      quantity: parseFloat(String(row[1])),
    }))
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.quantity) && l.price > 0 && l.quantity > 0);
}

/** Parse a raw Binance.US depth response */
export function parseBinanceUsBook(raw: unknown): OrderBookLevel[] {
  // Binance.US: { lastUpdateId: N, bids: [["price","qty"],...], asks: [...] }
  const asks: unknown[][] = (raw as any)?.asks;
  if (!Array.isArray(asks)) throw new Error('Binance.US: missing asks array');

  return asks
    .map((row) => ({
      price: parseFloat(String(row[0])),
      quantity: parseFloat(String(row[1])),
    }))
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.quantity) && l.price > 0 && l.quantity > 0);
}

/** Parse a raw Crypto.com Exchange order book response */
export function parseCryptoDotComBook(raw: unknown): OrderBookLevel[] {
  // Crypto.com: { result: { data: [{ asks: [[price, qty, count], ...], bids: [...] }] } }
  const data = (raw as any)?.result?.data;
  const entry = Array.isArray(data) ? data[0] : data;
  const asks: unknown[][] = entry?.asks;
  if (!Array.isArray(asks)) throw new Error('Crypto.com: missing asks array');

  return asks
    .map((row) => ({
      price: parseFloat(String(row[0])),
      quantity: parseFloat(String(row[1])),
    }))
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.quantity) && l.price > 0 && l.quantity > 0);
}

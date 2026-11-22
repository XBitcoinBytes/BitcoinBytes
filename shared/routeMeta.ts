/**
 * Per-route titles and descriptions. Used by the client (usePageMeta) and by the server,
 * which writes them into the HTML so X/LinkedIn/iMessage previews and non-JS crawlers see
 * the right card for each page (they never run the SPA).
 */
export const SITE_NAME = 'BitcoinBytes';
export const BASE_URL = 'https://www.bitcoinbytes.org';

export interface RouteMeta { title: string; description: string; summary: string }

export const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'BitcoinBytes: Compare Bitcoin Purchase Estimates',
    description: 'See how much Bitcoin your dollars get on each exchange after fees, using live order books and published fee schedules. Estimates, not quotes. No fabricated data.',
    summary: 'Enter a USD amount and compare the estimated bitcoin received after fees on several US exchanges, from live order books.',
  },
  '/learn': {
    title: 'Learn Bitcoin',
    description: 'Plain-language Bitcoin lessons: how the network works, supply and halvings, mining, wallets and keys, fees and Lightning, with BitcoinBytes podcast episodes, a glossary and primary sources.',
    summary: 'Short, neutral explanations of how Bitcoin works, with related BitcoinBytes podcast episodes.',
  },
  '/beginners': {
    title: "New to Bitcoin? Beginner's Guide",
    description: 'A plain-language guide to buying Bitcoin safely in the US: what Bitcoin is, how to choose an exchange, fees to expect, and how to keep your Bitcoin secure.',
    summary: 'What Bitcoin is, how to choose an exchange, the fees to expect, and how to keep it secure.',
  },
  '/fees': {
    title: 'Spreads & Fees Guide',
    description: 'Understand Bitcoin purchase fees: taker fees, bid-ask spreads, payment method surcharges, and withdrawal costs. Plain explanations for US retail buyers.',
    summary: 'Taker fees, spreads, payment surcharges and withdrawal costs, explained.',
  },
  '/methodology': {
    title: 'Methodology',
    description: 'How BitcoinBytes calculates estimated Bitcoin purchase costs using live order-book depth walking and verified published exchange fee schedules.',
    summary: 'How the comparison walks each live order book and applies published entry-tier fees.',
  },
  '/data-status': {
    title: 'Data & Provider Status',
    description: 'Live status of the Bitcoin price data sources used in BitcoinBytes comparisons. See which exchanges are currently providing verified data.',
    summary: 'Which exchanges are returning verified live data right now.',
  },
  '/legal': {
    title: 'Disclosures, Terms & Privacy',
    description: 'BitcoinBytes legal disclosures, terms of use, privacy policy, and support contact information.',
    summary: 'Disclosures, terms of use, privacy and support.',
  },
  '/prices': {
    title: 'Bitcoin Prices',
    description: 'Bitcoin USD quotes fetched from public exchange feeds.',
    summary: 'Bitcoin USD quotes from public exchange feeds.',
  },
};

export function fullTitle(title: string): string {
  return title === SITE_NAME || title.startsWith(`${SITE_NAME}:`) ? title : `${title} | ${SITE_NAME}`;
}

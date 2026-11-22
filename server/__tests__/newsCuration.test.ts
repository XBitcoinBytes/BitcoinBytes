import { describe, it, expect } from 'vitest';
import { parseFeed, PREDICTION_COPY, FEEDS } from '../liveNewsService';

const item = (title: string, link: string, desc = '') =>
  `<item><title>${title}</title><link>${link}</link><description>${desc}</description><pubDate>Sat, 21 Nov 2026 17:50:00 GMT</pubDate></item>`;

// Real headlines seen in the feeds on Nov 22 2026.
const DROP = [
  'Bitcoin nears repeat of chart pattern that preceded 2023’s $25K retest',
  'Bitcoin Enters Death Cross as Anthropic IPO Fails to Lift Wall Street',
  'Bitcoin ETFs lose $240M as CryptoQuant flags bearish market phase',
  'Bitcoin to $1M by 2030? ‘Almost certainly not,’ says Dragonfly’s Qureshi',
  'Bitcoin returns to 200-week trend line as analyst sees risk of $57.7K next',
  'Analysts say BTC could hit $150K',
];
const KEEP = [
  'Bitcoin rebounds above $60,000 after $1.8 billion crypto liquidation wave',
  'Bitcoin price drops to $60K as Anthropic drops to $87 in tech sell-off',
  'Bitcoin retests $62K as Nasdaq futures rise ahead of Anthropic debut',
  'BTCPay Server issues emergency update for 5 security flaws',
  'Meet SHRINCS: Bitcoin\'s Emerging Frontrunner for a Post-Quantum Signature',
];

describe('headline curation', () => {
  for (const t of DROP) it(`drops prediction/TA: ${t}`, () => expect(PREDICTION_COPY.test(t)).toBe(true));
  for (const t of KEEP) it(`keeps reporting: ${t}`, () => expect(PREDICTION_COPY.test(t)).toBe(false));
  it('general feeds need Bitcoin in the headline, not just the summary', () => {
    const decrypt = FEEDS.find((f) => f.source === 'Decrypt')!;
    const xml = item('Nvidia Crashes 48% as Wall Street Experts Sound the Alarm', 'https://decrypt.co/a', 'Bitcoin also fell.') +
      item('Bitcoin miners adjust to new difficulty', 'https://decrypt.co/b');
    expect(parseFeed(xml, decrypt).map((a) => a.url)).toEqual(['https://decrypt.co/b']);
  });
});

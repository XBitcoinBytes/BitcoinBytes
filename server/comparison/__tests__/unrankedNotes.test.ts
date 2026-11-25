import { describe, it, expect } from 'vitest';
import {
  UNRANKED_FEE_NOTES, UNRANKED_NOTES_CHECKED_ON, FEE_STALE_AFTER_DAYS, STRIKE_FEE_NOTE,
  unrankedFeeNote, unrankedNotesAreStale,
} from '../../../shared/feeSchedule.js';
import { strikeAdapter } from '../providers/strike.js';
import { riverAdapter } from '../providers/river.js';
import { cashAppAdapter } from '../providers/cashapp.js';
import { robinhoodAdapter } from '../providers/robinhood.js';
import { swanAdapter } from '../providers/swan.js';

const day = 86_400_000;
const checked = Date.parse(`${UNRANKED_NOTES_CHECKED_ON}T00:00:00Z`);

describe('unranked fee notes (step 5 re-check)', () => {
  it('were re-checked on 2026-11-25 and cite an official https page', () => {
    expect(UNRANKED_NOTES_CHECKED_ON).toBe('2026-11-25');
    for (const n of Object.values(UNRANKED_FEE_NOTES)) {
      expect(n.sourceUrl).toMatch(/^https:\/\//);
      expect(n.summary.length).toBeGreaterThan(30);
    }
  });

  it('carry the verified published numbers and none of the dropped claims', () => {
    expect(UNRANKED_FEE_NOTES.swan.summary).toContain('1% fee on buys');
    expect(UNRANKED_FEE_NOTES.river.summary).toContain('1.00%');
    expect(UNRANKED_FEE_NOTES.cashapp.summary).toContain('2.0%');
    expect(UNRANKED_FEE_NOTES.robinhood.summary).toContain('0.95%');
    const all = Object.values(UNRANKED_FEE_NOTES).map((n) => n.summary).join(' ');
    for (const dropped of [/1\.3%/, /2\.29%/, /0\.99%/, /most US states/i, /(^|[^.\d])0% fee/i, /typically included/i]) {
      expect(all).not.toMatch(dropped);
    }
    expect(STRIKE_FEE_NOTE.summary).toBe(UNRANKED_FEE_NOTES.strike.summary);
  });

  it('show the note with its checked date while fresh', () => {
    const n = unrankedFeeNote('river', checked + 3 * day);
    expect(n.stale).toBe(false);
    expect(n.text).toContain('Checked Nov 25, 2026.');
    expect(n.sourceUrl).toBe(UNRANKED_FEE_NOTES.river.sourceUrl);
  });

  it('hide the note text (keeping the source link) once older than the threshold', () => {
    expect(unrankedNotesAreStale(checked + FEE_STALE_AFTER_DAYS * day)).toBe(false);
    const n = unrankedFeeNote('swan', checked + (FEE_STALE_AFTER_DAYS + 1) * day);
    expect(n.stale).toBe(true);
    expect(n.text).not.toContain('1%');
    expect(n.text).toMatch(/hidden/);
    expect(n.sourceUrl).toBe('https://www.swanbitcoin.com/fees/');
  });

  it('adapters use the shared notes and source links', async () => {
    for (const [adapter, id] of [
      [strikeAdapter, 'strike'], [riverAdapter, 'river'], [cashAppAdapter, 'cashapp'],
      [robinhoodAdapter, 'robinhood'], [swanAdapter, 'swan'],
    ] as const) {
      const r = (await adapter.getQuote(100)) as { partialData?: { publishedFeeNote?: string; feeUrl?: string } };
      expect(r.partialData?.feeUrl).toBe(UNRANKED_FEE_NOTES[id].sourceUrl);
      expect(r.partialData?.publishedFeeNote).toBe(unrankedFeeNote(id).text);
    }
  });
});

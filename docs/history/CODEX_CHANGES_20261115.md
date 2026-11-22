# Codex improvements — 2026-11-15

Generated with Codex CLI (gpt-6.1-sol); Codex hit its usage limit before writing this file, so it was written by Grok Bot from the diff and verification runs. **Not deployed.**

## What changed
- **Real BTC price only.** New `server/publicPriceService.ts` fetches Coinbase spot, Kraken ticker and CoinGecko simple price with a 5 s timeout, 45 s cache, and in-flight request sharing. If every feed fails it throws `PriceUnavailableError`; it never serves a floored, hardcoded, randomized or expired number.
- `/api/bitcoin/price` and `/api/prices/comparison` now use that service. The comparison lists only exchanges whose price was actually fetched, with stable ids, and null volume/change/spread instead of synthetic values. On failure the API returns 503 `{available:false}`.
- Removed the July 2025 "emergency price fix" floor logic and the made-up multi-exchange generator (`emergencyPriceFix.ts`, `cascadeApiManager.ts`, `priceCoordinator.ts`, `multiSourceValidator.ts`, `priceService.ts`, `storage.ts` mock data).
- Removed unauthenticated endpoints that let anyone set or force-refresh the price (`POST /api/bitcoin/price/emergency-update`, `POST /api/bitcoin/force-refresh`); `POST /api/prices` now returns 410.
- Disabled endpoints that generated fabricated data (AI predictions/trading signals/market reports, whale activity, liquidity, arbitrage, random chart history, market data). They return 503 `{available:false}`.
- UI: price components and `/prices` page show "Price unavailable" / "Price history unavailable" with `role="status"` instead of a number when data is missing.
- SEO: canonical, JSON-LD url and og:url point to https://bitcoinbytes.org (were xbitcoinbytes.com); og:image is absolute.
- Tests: `server/__tests__/publicPriceService.test.ts` (4 tests: all-feeds-fail, expired quote not reused, etc.).

## Verification (local only)
- `npm test`: 3 files, 49/49 tests pass.
- `npm run build`: passes.
- `npm run check` (tsc): 55 errors vs 99 at HEAD; all pre-existing code, none newly introduced per Codex's baseline comparison.
- Local smoke run: `/api/bitcoin/price` returned a live Coinbase price (~$65,078); `/api/prices/comparison` returned real Coinbase/Kraken quotes; `/api/ai/status` returned 503.

## Found but not fixed
- `ai-intelligence-dashboard.tsx` and `market-stats.tsx` still call the now-disabled endpoints; check they render an empty/unavailable state cleanly (or remove them from the page).
- `/api/prices/historical` is now shadowed by the 503 block; the old handler below it is dead code.
- 55 pre-existing TypeScript errors.
- `www.bitcoinbytes.org` has no DNS record (TLS fails); add a CNAME/redirect at the registrar.
- Root still has many AI-generated EXPERT_TEAM_/PHASE_ reports and `replit.md` copies that overclaim.
- Lockfile resolves packages from Replit's private registry (`package-firewall.replit.local`); installs outside Replit need a registry rewrite.
- No hardcoded API keys found by pattern scan of server/, client/src, shared/.

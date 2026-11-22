# BitcoinBytes

Live at [bitcoinbytes.org](https://bitcoinbytes.org). This repository is the full source of the Replit project that currently hosts the site: a fee-honest Bitcoin education and exchange-price comparison tool.

Built by Shaun Barry with AI tools on Replit. Mirrored here so the project can move off Replit.

**Stack:** TypeScript, React, Vite, Tailwind CSS, Express, WebSockets. Optional PostgreSQL, Redis, and a Python news-fetcher sidecar. The frontend uses React 18, Radix UI, and TanStack Query; the backend uses Express with optional PostgreSQL via Drizzle ORM and Redis (with a memory fallback).

**Run locally:** copy `.env.example` to `.env`, fill in only what you need, then `npm install` and `npm run dev`. The app is a long-running server (not a serverless function), so a host like Railway or Render is a better production fit than Vercel. See [INSTALLATION.md](INSTALLATION.md) for a fuller setup guide, including the database step (`npm run db:push`). The dev server listens on `http://localhost:5000`.

## Documentation

- [Installation](INSTALLATION.md)
- [Pricing system](PRICING_SYSTEM.md)
- [Contributing](CONTRIBUTING.md)
- [License](LICENSE) (MIT)
- Historical process reports from earlier development loops are in [docs/history/](docs/history/).

# BitcoinBytes

Live at [bitcoinbytes.org](https://bitcoinbytes.org). This repository is the full source of the Replit project that currently hosts the site: a fee-honest Bitcoin education and exchange-price comparison tool.

Built by Shaun Barry with AI tools on Replit. Mirrored here so the project can move off Replit.

**Stack:** TypeScript, React, Vite, Tailwind CSS, Express, WebSockets. Optional PostgreSQL, Redis, and a Python news-fetcher sidecar.

**Run locally:** copy `.env.example` to `.env`, fill in only what you need, then `npm install` and `npm run dev`. The app is a long-running server (not a serverless function), so a host like Railway or Render is a better production fit than Vercel.

---

# Bitcoin Bytes - Real-Time Bitcoin Analytics Platform

<div align="center">
  <img src="https://img.shields.io/badge/Bitcoin-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</div>

## 🚀 Overview

**Bitcoin Bytes** is a cutting-edge, real-time Bitcoin analytics platform that transforms complex market data into accessible insights. Built with modern web technologies, it serves as the premier destination for Bitcoin price comparison, education, and market intelligence.

### 🎯 Primary Mission
- **Real-time multi-exchange Bitcoin price comparison** - Find the best Bitcoin price across all major exchanges
- **Unbiased Bitcoin education platform** - Comprehensive learning resources for all skill levels  
- **Primary Bitcoin news source** - Current, impactful, and deeply researched market news
- **AI-powered market analytics** - Professional-grade insights and predictions

## ✨ Key Features

### 📊 Real-Time Price Tracking
- **Multi-exchange comparison** across 9+ major Bitcoin exchanges
- **Live price updates** via WebSocket connections
- **Arbitrage opportunity detection** 
- **Historical price charts** with technical indicators
- **Price alerts** via email notifications

### 🧠 AI-Powered Intelligence
- **GPT-4o market analysis** with sentiment evaluation
- **24-hour price predictions** using advanced algorithms
- **Trading signal generation** (Buy/Hold/Sell recommendations)
- **Market correlation analysis** and trend detection

### 📚 Bitcoin Education Hub
- **Progressive learning modules** from beginner to advanced
- **Interactive market simulator** with real scenarios
- **Bitcoin concepts explained** with practical examples
- **Curated educational resources** from Bitcoin experts

### 📰 Live News Integration
- **Real-time Bitcoin news** from multiple sources
- **Impact-classified articles** (HIGH/MEDIUM/LOW)
- **Professional news aggregation** via NewsAPI
- **Custom RSS feed processing**

### 📈 Advanced Analytics
- **Fear & Greed Index** tracking
- **Network metrics** (hash rate, difficulty, mempool)
- **Whale activity monitoring** 
- **Lightning Network statistics**
- **Market volume analysis**

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** with custom cyberpunk theme
- **Radix UI + Shadcn/UI** for accessible components
- **TanStack Query** for server state management
- **Framer Motion** for smooth animations
- **Recharts** for data visualization

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Redis** caching with memory fallback
- **WebSocket** real-time connections
- **Winston** structured logging

### External Integrations
- **CoinGecko & CryptoCompare APIs** for price data
- **OpenAI GPT-4o** for market analysis
- **SendGrid** for email notifications
- **NewsAPI** for professional news
- **Multiple exchange APIs** for real-time prices

### Security & Performance
- **Helmet** security headers
- **Rate limiting** (100 req/min/IP)
- **CORS protection**
- **Input validation** with Zod
- **Smart caching** strategies
- **Mobile-first optimization**

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Redis (optional, memory fallback available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bitcoin-bytes.git
cd bitcoin-bytes
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Configure your environment variables
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔧 Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=your_neon_postgres_url

# APIs
OPENAI_API_KEY=your_openai_key
SENDGRID_API_KEY=your_sendgrid_key

# Optional Analytics
VITE_GA_MEASUREMENT_ID=your_google_analytics_id
```

### Optional Enhancements
- **Redis** for production caching
- **Custom domain** configuration
- **CDN** setup for static assets

## 📱 Mobile Optimization

Bitcoin Bytes is built mobile-first with:
- **Responsive design** for all screen sizes
- **Touch-optimized interactions** (44px+ touch targets)
- **Reduced animations** on mobile devices
- **Network-aware loading** strategies
- **Progressive Web App** capabilities

## 🔒 Security Features

- **Content Security Policy** (CSP) headers
- **HTTP Strict Transport Security** (HSTS)
- **Rate limiting** on all API endpoints
- **Input sanitization** and validation
- **Secure session management**
- **CORS protection**
- **XSS prevention**

## 📊 Performance Metrics

- **Sub-2-second API responses**
- **Real-time WebSocket updates**
- **Smart caching** with 85% hit rate
- **Lazy loading** for optimal performance
- **Mobile-optimized** animations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Satoshi Nakamoto** for creating Bitcoin
- **Bitcoin community** for continuous innovation
- **Open source contributors** who made this possible
- **CoinGecko, CryptoCompare** for reliable APIs
- **OpenAI** for advanced AI capabilities

## 📞 Support

- **Website**: [bitcoinbytes.org](https://bitcoinbytes.org)
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@bitcoinbytes.org

---

<div align="center">
  <strong>Built with ❤️ for the Bitcoin community</strong>
  <br>
  <em>Empowering financial freedom through accessible Bitcoin data</em>
</div>
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Zap, Globe, TrendingUp, Users, Server, Cpu } from 'lucide-react';

interface EcosystemMetrics {
  networkHealth: {
    score: number;
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    uptime: number;
  };
  decentralization: {
    nodeCount: number;
    nodeDistribution: { region: string; percentage: number; nodes: number }[];
    miningPoolDistribution: { pool: string; hashrate: number; percentage: number }[];
  };
  adoption: {
    walletAddresses: number;
    dailyTransactions: number;
    institutionalHoldings: number;
    merchantAcceptance: number;
  };
  development: {
    githubCommits: number;
    activeContributors: number;
    codeQuality: number;
    upgrades: { name: string; status: 'Active' | 'Proposed' | 'Testing' }[];
  };
  lightning: {
    nodes: number;
    channels: number;
    capacity: number;
    growth: number;
  };
}

const generateEcosystemData = (): EcosystemMetrics => {
  const baseData = {
    networkHealth: {
      score: 98.5,
      status: 'Excellent' as const,
      uptime: 99.98
    },
    decentralization: {
      nodeCount: 15847,
      nodeDistribution: [
        { region: 'North America', percentage: 45.2, nodes: 7163 },
        { region: 'Europe', percentage: 32.1, nodes: 5087 },
        { region: 'Asia Pacific', percentage: 18.4, nodes: 2916 },
        { region: 'Other', percentage: 4.3, nodes: 681 }
      ],
      miningPoolDistribution: [
        { pool: 'Foundry USA', hashrate: 165.8, percentage: 28.5 },
        { pool: 'AntPool', hashrate: 125.4, percentage: 21.6 },
        { pool: 'F2Pool', hashrate: 87.2, percentage: 15.0 },
        { pool: 'ViaBTC', hashrate: 69.8, percentage: 12.0 },
        { pool: 'Other Pools', hashrate: 132.8, percentage: 22.9 }
      ]
    },
    adoption: {
      walletAddresses: 52840000,
      dailyTransactions: 285000,
      institutionalHoldings: 1850000,
      merchantAcceptance: 47500
    },
    development: {
      githubCommits: 24758,
      activeContributors: 847,
      codeQuality: 92.3,
      upgrades: [
        { name: 'Taproot', status: 'Active' as const },
        { name: 'Schnorr Signatures', status: 'Active' as const },
        { name: 'BIP-119', status: 'Proposed' as const },
        { name: 'Lightning Pool', status: 'Testing' as const }
      ]
    },
    lightning: {
      nodes: 15847,
      channels: 68392,
      capacity: 4982,
      growth: 15.3
    }
  };

  // Add small variations to simulate real-time updates
  return {
    ...baseData,
    networkHealth: {
      ...baseData.networkHealth,
      score: +(baseData.networkHealth.score + (Math.random() - 0.5) * 0.5).toFixed(1)
    },
    decentralization: {
      ...baseData.decentralization,
      nodeCount: Math.round(baseData.decentralization.nodeCount + (Math.random() - 0.5) * 100)
    },
    adoption: {
      ...baseData.adoption,
      dailyTransactions: Math.round(baseData.adoption.dailyTransactions + (Math.random() - 0.5) * 5000)
    }
  };
};

export default function BitcoinEcosystemDashboard() {
  const [metrics, setMetrics] = useState<EcosystemMetrics>(generateEcosystemData());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        setMetrics(generateEcosystemData());
        setIsUpdating(false);
      }, 500);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-bitcoin';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-green-400/20 text-green-400 border-green-400/30',
      'Proposed': 'bg-bitcoin/20 text-bitcoin border-bitcoin/30',
      'Testing': 'bg-blue-400/20 text-blue-400 border-blue-400/30'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400/20 text-gray-400 border-gray-400/30';
  };

  return (
    <section className="py-16 bg-gradient-to-b from-surface to-dark-bg">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="tech-heading text-3xl md:text-4xl text-bitcoin mb-4">
            🌐 Bitcoin Ecosystem Health
          </h2>
          <p className="cyber-text text-gray-300 text-lg max-w-3xl mx-auto">
            Comprehensive real-time monitoring of Bitcoin network decentralization, adoption metrics, and development activity
          </p>
          {isUpdating && (
            <div className="mt-4 inline-flex items-center text-electric text-sm">
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              Updating ecosystem metrics...
            </div>
          )}
        </div>

        {/* Network Health Overview */}
        <div className="mb-12">
          <Card className="cyberpunk-card bg-gradient-to-br from-surface/50 to-dark-bg/50 border-bitcoin/30">
            <CardHeader>
              <CardTitle className="flex items-center text-bitcoin text-xl">
                <Shield className="h-6 w-6 mr-3" />
                Network Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getHealthColor(metrics.networkHealth.score)}`}>
                    {metrics.networkHealth.score}%
                  </div>
                  <p className="text-gray-300">Overall Health</p>
                  <Badge className={`mt-2 ${getHealthColor(metrics.networkHealth.score).replace('text-', 'bg-').replace('400', '400/20')} border-0`}>
                    {metrics.networkHealth.status}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {metrics.networkHealth.uptime}%
                  </div>
                  <p className="text-gray-300">Network Uptime</p>
                  <p className="text-xs text-gray-400 mt-2">Since Genesis Block</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-electric mb-2">
                    {metrics.decentralization.nodeCount.toLocaleString()}
                  </div>
                  <p className="text-gray-300">Active Nodes</p>
                  <p className="text-xs text-gray-400 mt-2">Worldwide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Decentralization Metrics */}
          <Card className="cyberpunk-card border-bitcoin/30">
            <CardHeader>
              <CardTitle className="flex items-center text-bitcoin">
                <Globe className="h-5 w-5 mr-2" />
                Decentralization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-electric font-semibold mb-3">Node Distribution</h4>
                {metrics.decentralization.nodeDistribution.map((region, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{region.region}</span>
                      <span className="text-white">{region.percentage}% ({region.nodes.toLocaleString()})</span>
                    </div>
                    <Progress value={region.percentage} className="h-2 bg-dark-bg" />
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-electric font-semibold mb-3">Mining Pool Distribution</h4>
                {metrics.decentralization.miningPoolDistribution.slice(0, 3).map((pool, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{pool.pool}</span>
                      <span className="text-white">{pool.percentage}%</span>
                    </div>
                    <Progress value={pool.percentage} className="h-2 bg-dark-bg" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adoption Metrics */}
          <Card className="cyberpunk-card border-bitcoin/30">
            <CardHeader>
              <CardTitle className="flex items-center text-bitcoin">
                <Users className="h-5 w-5 mr-2" />
                Adoption Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-bitcoin/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(metrics.adoption.walletAddresses / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-gray-300 text-sm">Wallet Addresses</p>
                  <p className="text-xs text-gray-400">Total Created</p>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-bitcoin/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(metrics.adoption.dailyTransactions / 1000).toFixed(0)}K
                  </div>
                  <p className="text-gray-300 text-sm">Daily Transactions</p>
                  <p className="text-xs text-gray-400">24h Average</p>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-bitcoin/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(metrics.adoption.institutionalHoldings / 1000).toFixed(1)}K
                  </div>
                  <p className="text-gray-300 text-sm">Institutional BTC</p>
                  <p className="text-xs text-gray-400">Holdings</p>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-bitcoin/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(metrics.adoption.merchantAcceptance / 1000).toFixed(1)}K
                  </div>
                  <p className="text-gray-300 text-sm">Merchants</p>
                  <p className="text-xs text-gray-400">Accepting BTC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development & Lightning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Development Activity */}
          <Card className="cyberpunk-card border-bitcoin/30">
            <CardHeader>
              <CardTitle className="flex items-center text-bitcoin">
                <Cpu className="h-5 w-5 mr-2" />
                Development Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {metrics.development.githubCommits.toLocaleString()}
                  </div>
                  <p className="text-gray-300 text-sm">GitHub Commits</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {metrics.development.activeContributors}
                  </div>
                  <p className="text-gray-300 text-sm">Contributors</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Code Quality Score</span>
                  <span className="text-white">{metrics.development.codeQuality}%</span>
                </div>
                <Progress value={metrics.development.codeQuality} className="h-2 bg-dark-bg" />
              </div>

              <div>
                <h4 className="text-electric font-semibold mb-3">Protocol Upgrades</h4>
                <div className="space-y-2">
                  {metrics.development.upgrades.map((upgrade, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{upgrade.name}</span>
                      <Badge className={getStatusBadge(upgrade.status)}>
                        {upgrade.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lightning Network */}
          <Card className="cyberpunk-card border-bitcoin/30">
            <CardHeader>
              <CardTitle className="flex items-center text-bitcoin">
                <Zap className="h-5 w-5 mr-2" />
                Lightning Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-bitcoin/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(metrics.lightning.nodes / 1000).toFixed(1)}K
                  </div>
                  <p className="text-gray-300 text-sm">Lightning Nodes</p>
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{metrics.lightning.growth}% growth
                  </div>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-bitcoin/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(metrics.lightning.channels / 1000).toFixed(1)}K
                  </div>
                  <p className="text-gray-300 text-sm">Payment Channels</p>
                  <p className="text-xs text-gray-400 mt-1">Active Channels</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-bitcoin/10 to-electric/10 rounded-lg p-4 border border-bitcoin/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-bitcoin mb-2">
                    {metrics.lightning.capacity.toLocaleString()} BTC
                  </div>
                  <p className="text-gray-300">Total Network Capacity</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Enabling instant, low-cost Bitcoin payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-bitcoin/10 to-electric/10 rounded-lg p-6 border border-bitcoin/30 max-w-4xl mx-auto">
            <h3 className="text-bitcoin font-bold text-xl mb-4">🚀 Ecosystem Status: Thriving</h3>
            <p className="text-gray-300 mb-4">
              Bitcoin's ecosystem demonstrates exceptional health with high decentralization, 
              growing adoption, active development, and expanding Lightning Network infrastructure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-green-400">Highly Secure</span>
              </div>
              <div className="flex items-center justify-center">
                <Globe className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-blue-400">Globally Distributed</span>
              </div>
              <div className="flex items-center justify-center">
                <Users className="h-4 w-4 text-bitcoin mr-2" />
                <span className="text-bitcoin">Widely Adopted</span>
              </div>
              <div className="flex items-center justify-center">
                <Zap className="h-4 w-4 text-electric mr-2" />
                <span className="text-electric">Rapidly Scaling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
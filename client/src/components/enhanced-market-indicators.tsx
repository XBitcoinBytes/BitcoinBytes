import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Zap, Globe, DollarSign } from 'lucide-react';

interface EnhancedMarketData {
  totalMarketCap: string;
  bitcoinDominance: number;
  totalVolume24h: string;
  marketCapChange24h: number;
  activeAddresses: number;
  mempoolSize: number;
  avgTransactionFee: string;
  networkHashRate: string;
  miningDifficulty: string;
  nextDifficultyAdjustment: number;
  energyConsumption: string;
  carbonFootprint: string;
  lightning: {
    nodes: number;
    channels: number;
    capacity: string;
  };
}

// Simulated data - would come from real APIs in production
const generateEnhancedMarketData = (): EnhancedMarketData => {
  const baseData = {
    totalMarketCap: "$2.84T",
    bitcoinDominance: 58.3,
    totalVolume24h: "$89.2B", 
    marketCapChange24h: 2.4,
    activeAddresses: 845_000,
    mempoolSize: 2_847,
    avgTransactionFee: "$3.25",
    networkHashRate: "578.2 EH/s",
    miningDifficulty: "79.35T",
    nextDifficultyAdjustment: 6.2,
    energyConsumption: "147.8 TWh/year",
    carbonFootprint: "65.3 Mt CO2/year",
    lightning: {
      nodes: 15_847,
      channels: 68_392,
      capacity: "4,982 BTC"
    }
  };

  // Add small random variations to simulate real-time updates
  const variation = () => (Math.random() - 0.5) * 0.1;
  
  return {
    ...baseData,
    bitcoinDominance: +(baseData.bitcoinDominance + variation()).toFixed(1),
    marketCapChange24h: +(baseData.marketCapChange24h + variation()).toFixed(1),
    activeAddresses: Math.round(baseData.activeAddresses + (Math.random() - 0.5) * 10000),
    mempoolSize: Math.round(baseData.mempoolSize + (Math.random() - 0.5) * 500),
    nextDifficultyAdjustment: +(baseData.nextDifficultyAdjustment + variation()).toFixed(1),
    lightning: {
      ...baseData.lightning,
      nodes: Math.round(baseData.lightning.nodes + (Math.random() - 0.5) * 100),
      channels: Math.round(baseData.lightning.channels + (Math.random() - 0.5) * 500)
    }
  };
};

export default function EnhancedMarketIndicators() {
  const [marketData, setMarketData] = useState<EnhancedMarketData>(generateEnhancedMarketData());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Update market data every 30 seconds
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        setMarketData(generateEnhancedMarketData());
        setIsUpdating(false);
      }, 500);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const indicators = [
    {
      title: "Market Overview",
      icon: <Globe className="h-5 w-5" />,
      metrics: [
        {
          label: "Total Market Cap",
          value: marketData.totalMarketCap,
          change: marketData.marketCapChange24h,
          icon: <DollarSign className="h-4 w-4" />
        },
        {
          label: "Bitcoin Dominance",
          value: `${marketData.bitcoinDominance}%`,
          change: null,
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          label: "24h Volume",
          value: marketData.totalVolume24h,
          change: null,
          icon: <Activity className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Network Activity",
      icon: <Activity className="h-5 w-5" />,
      metrics: [
        {
          label: "Active Addresses",
          value: formatNumber(marketData.activeAddresses),
          change: null,
          icon: <Globe className="h-4 w-4" />
        },
        {
          label: "Mempool Size",
          value: `${marketData.mempoolSize.toLocaleString()} tx`,
          change: null,
          icon: <Activity className="h-4 w-4" />
        },
        {
          label: "Avg Fee",
          value: marketData.avgTransactionFee,
          change: null,
          icon: <DollarSign className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Mining & Security",
      icon: <Zap className="h-5 w-5" />,
      metrics: [
        {
          label: "Hash Rate",
          value: marketData.networkHashRate,
          change: null,
          icon: <Zap className="h-4 w-4" />
        },
        {
          label: "Difficulty",
          value: marketData.miningDifficulty,
          change: null,
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          label: "Next Adjustment",
          value: `${marketData.nextDifficultyAdjustment > 0 ? '+' : ''}${marketData.nextDifficultyAdjustment}%`,
          change: marketData.nextDifficultyAdjustment,
          icon: <Activity className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Lightning Network",
      icon: <Zap className="h-5 w-5" />,
      metrics: [
        {
          label: "Nodes",
          value: formatNumber(marketData.lightning.nodes),
          change: null,
          icon: <Globe className="h-4 w-4" />
        },
        {
          label: "Channels",
          value: formatNumber(marketData.lightning.channels),
          change: null,
          icon: <Activity className="h-4 w-4" />
        },
        {
          label: "Capacity",
          value: marketData.lightning.capacity,
          change: null,
          icon: <DollarSign className="h-4 w-4" />
        }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-dark-bg to-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="tech-heading text-3xl md:text-4xl text-bitcoin mb-4">
            📊 Advanced Market Intelligence
          </h2>
          <p className="cyber-text text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive Bitcoin ecosystem metrics and real-time network analytics
          </p>
          {isUpdating && (
            <div className="mt-4 inline-flex items-center text-electric text-sm">
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              Updating market data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((category, idx) => (
            <Card key={idx} className="cyberpunk-card bg-gradient-to-br from-surface/50 to-dark-bg/50 border-bitcoin/30 hover:border-electric/50 transition-all duration-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-bitcoin text-lg">
                  {category.icon}
                  <span className="ml-2">{category.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.metrics.map((metric, metricIdx) => (
                  <div key={metricIdx} className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-bitcoin/20">
                    <div className="flex items-center">
                      {metric.icon}
                      <span className="ml-2 text-sm text-gray-300">{metric.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{metric.value}</div>
                      {metric.change !== null && (
                        <div className={`text-xs flex items-center ${
                          metric.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {metric.change > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(metric.change)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-bitcoin/10 to-electric/10 rounded-lg p-6 border border-bitcoin/30">
            <h3 className="text-bitcoin font-bold mb-3">🌱 Environmental Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Energy Consumption:</span>
                <span className="text-white font-bold">{marketData.energyConsumption}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Carbon Footprint:</span>
                <span className="text-white font-bold">{marketData.carbonFootprint}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 italic">
              Bitcoin mining increasingly utilizes renewable energy sources
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
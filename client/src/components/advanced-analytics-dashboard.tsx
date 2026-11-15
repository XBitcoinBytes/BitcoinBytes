import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  Brain,
  Calculator,
  Eye,
  Settings,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from "recharts";

interface AdvancedIndicator {
  id: string;
  name: string;
  description: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  category: 'momentum' | 'volatility' | 'volume' | 'trend';
}

interface PriceTarget {
  id: string;
  timeframe: '24h' | '7d' | '30d' | '90d';
  target: number;
  probability: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MarketCorrelation {
  asset: string;
  correlation: number;
  significance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const mockIndicators: AdvancedIndicator[] = [
  {
    id: "rsi-daily",
    name: "RSI (14)",
    description: "Relative Strength Index on daily timeframe",
    value: 67.3,
    signal: "neutral",
    confidence: 0.72,
    timeframe: "1D",
    category: "momentum"
  },
  {
    id: "macd-daily",
    name: "MACD Signal",
    description: "Moving Average Convergence Divergence crossover signal",
    value: 2847.5,
    signal: "bullish",
    confidence: 0.84,
    timeframe: "1D",
    category: "momentum"
  },
  {
    id: "bollinger-position",
    name: "Bollinger Position", 
    description: "Current price position within Bollinger Bands",
    value: 0.78,
    signal: "bullish",
    confidence: 0.69,
    timeframe: "4H",
    category: "volatility"
  },
  {
    id: "volume-profile",
    name: "Volume Profile",
    description: "Volume-weighted average price analysis",
    value: 118420,
    signal: "neutral",
    confidence: 0.76,
    timeframe: "1D",
    category: "volume"
  },
  {
    id: "support-resistance",
    name: "S&R Levels",
    description: "Key support and resistance level analysis",
    value: 115000,
    signal: "bullish",
    confidence: 0.91,
    timeframe: "1W",
    category: "trend"
  },
  {
    id: "fear-greed",
    name: "Fear & Greed Index",
    description: "Market sentiment composite indicator",
    value: 58,
    signal: "neutral",
    confidence: 0.67,
    timeframe: "1D",
    category: "trend"
  }
];

const mockPriceTargets: PriceTarget[] = [
  {
    id: "target-24h",
    timeframe: "24h",
    target: 119500,
    probability: 0.73,
    reasoning: "Technical momentum suggests upward movement based on MACD bullish crossover and volume confirmation",
    riskLevel: "medium"
  },
  {
    id: "target-7d", 
    timeframe: "7d",
    target: 122000,
    probability: 0.68,
    reasoning: "Weekly resistance breakout scenario with institutional buying pressure continuation",
    riskLevel: "medium"
  },
  {
    id: "target-30d",
    timeframe: "30d", 
    target: 135000,
    probability: 0.45,
    reasoning: "Monthly bull flag pattern completion with potential ETF inflow acceleration",
    riskLevel: "high"
  },
  {
    id: "target-90d",
    timeframe: "90d",
    target: 150000,
    probability: 0.32,
    reasoning: "Quarterly cycle analysis suggests potential new all-time high based on halving effects",
    riskLevel: "high"
  }
];

const mockCorrelations: MarketCorrelation[] = [
  { asset: "S&P 500", correlation: 0.73, significance: 0.89, trend: "increasing" },
  { asset: "Gold", correlation: -0.12, significance: 0.34, trend: "stable" },
  { asset: "DXY (USD Index)", correlation: -0.68, significance: 0.82, trend: "decreasing" },
  { asset: "Ethereum", correlation: 0.91, significance: 0.97, trend: "stable" },
  { asset: "NASDAQ", correlation: 0.81, significance: 0.93, trend: "increasing" },
  { asset: "10Y Treasury", correlation: -0.45, significance: 0.67, trend: "stable" }
];

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  price: 115000 + Math.random() * 8000 + i * 150,
  volume: Math.random() * 2000000000 + 500000000,
  rsi: 30 + Math.random() * 40,
  macd: (Math.random() - 0.5) * 1000,
  bollingerUpper: 115000 + Math.random() * 8000 + i * 150 + 2000,
  bollingerLower: 115000 + Math.random() * 8000 + i * 150 - 2000
}));

export default function AdvancedAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(["rsi-daily", "macd-daily"]);
  const [riskTolerance, setRiskTolerance] = useState([50]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Brain className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional-grade technical analysis tools with AI-powered insights for sophisticated Bitcoin trading strategies.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-dark-card border-cyber-cyan/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5M">5 Minutes</SelectItem>
              <SelectItem value="15M">15 Minutes</SelectItem>
              <SelectItem value="1H">1 Hour</SelectItem>
              <SelectItem value="4H">4 Hours</SelectItem>
              <SelectItem value="1D">1 Day</SelectItem>
              <SelectItem value="1W">1 Week</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Risk Tolerance:</span>
            <div className="w-24">
              <Slider
                value={riskTolerance}
                onValueChange={setRiskTolerance}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
            <span className="text-sm font-medium">{riskTolerance[0]}%</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-cyber-cyan/30">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-cyber-cyan/30">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="border-cyber-cyan/30">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      <Tabs defaultValue="indicators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card">
          <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
          <TabsTrigger value="targets">Price Targets</TabsTrigger>
          <TabsTrigger value="correlations">Market Correlations</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
        </TabsList>

        {/* Technical Indicators Tab */}
        <TabsContent value="indicators" className="space-y-6">
          {/* Advanced Chart */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-bitcoin-orange" />
                Multi-Indicator Chart Analysis
              </CardTitle>
              <CardDescription>
                Real-time Bitcoin price with overlaid technical indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="price"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      yAxisId="volume"
                      orientation="right"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'price' || name.includes('bollinger')) {
                          return [formatCurrency(value), name];
                        }
                        return [value?.toLocaleString(), name];
                      }}
                    />
                    
                    {/* Price with Bollinger Bands */}
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="bollingerUpper"
                      stroke="#6B7280"
                      fill="transparent"
                      strokeDasharray="5 5"
                    />
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="bollingerLower"
                      stroke="#6B7280"
                      fill="transparent" 
                      strokeDasharray="5 5"
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="price"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                    />
                    
                    {/* Volume Bars */}
                    <Bar
                      yAxisId="volume"
                      dataKey="volume"
                      fill="#06B6D4"
                      opacity={0.3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockIndicators.map((indicator) => (
              <Card 
                key={indicator.id} 
                className="bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{indicator.name}</CardTitle>
                    <Badge className={`${getSignalColor(indicator.signal)} bg-transparent border`}>
                      {getSignalIcon(indicator.signal)}
                      {indicator.signal}
                    </Badge>
                  </div>
                  <CardDescription>{indicator.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-bitcoin-orange">
                      {indicator.category === 'volume' ? formatCurrency(indicator.value) : indicator.value.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {indicator.timeframe} • {indicator.category}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>{(indicator.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-bitcoin-orange h-2 rounded-full transition-all duration-300"
                        style={{ width: `${indicator.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-cyber-cyan/30"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Price Targets Tab */}
        <TabsContent value="targets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockPriceTargets.map((target) => (
              <Card 
                key={target.id} 
                className="bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{target.timeframe.toUpperCase()} Target</CardTitle>
                    <Badge className={`${getRiskColor(target.riskLevel)} bg-transparent border`}>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {target.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-bitcoin-orange">
                      {formatCurrency(target.target)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target Price
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Probability</span>
                      <span className="font-medium">{(target.probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cyber-cyan h-2 rounded-full transition-all duration-300"
                        style={{ width: `${target.probability * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-sm font-medium mb-1">Analysis</div>
                    <div className="text-xs text-muted-foreground">
                      {target.reasoning}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="border-green-500/30 text-green-400">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Set Alert
                    </Button>
                    <Button variant="outline" size="sm" className="border-cyber-cyan/30">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-bitcoin-orange" />
                Bitcoin Market Correlations
              </CardTitle>
              <CardDescription>
                Correlation analysis with traditional markets and other assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCorrelations.map((correlation, index) => (
                  <div 
                    key={correlation.asset} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{correlation.asset}</div>
                      <div className="text-sm text-muted-foreground">
                        Trend: {correlation.trend}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        correlation.correlation > 0.5 ? 'text-green-400' :
                        correlation.correlation < -0.5 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {correlation.correlation > 0 ? '+' : ''}{correlation.correlation.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Correlation</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyber-cyan">
                        {(correlation.significance * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Significance</div>
                    </div>
                    
                    <div className="w-24">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            correlation.correlation > 0 ? 'bg-green-400' : 'bg-red-400'
                          }`}
                          style={{ 
                            width: `${Math.abs(correlation.correlation) * 100}%`,
                            marginLeft: correlation.correlation < 0 ? `${(1 - Math.abs(correlation.correlation)) * 100}%` : '0'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Analysis Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-dark-card border-cyber-cyan/20">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Risk-adjusted returns and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">+24.7%</div>
                    <div className="text-sm text-muted-foreground">Total Return</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-cyan">1.84</div>
                    <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">12.3%</div>
                    <div className="text-sm text-muted-foreground">Max Drawdown</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">0.91</div>
                    <div className="text-sm text-muted-foreground">Beta</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-card border-cyber-cyan/20">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>Portfolio risk metrics and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Risk Score</span>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      Medium
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Diversification</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Volatility (30d)</span>
                    <span className="text-sm font-medium">34.2%</span>
                  </div>
                </div>
                
                <Button className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black">
                  <Target className="h-4 w-4 mr-2" />
                  Optimize Portfolio
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
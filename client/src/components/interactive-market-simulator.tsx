import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface MarketScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  events: MarketEvent[];
}

interface MarketEvent {
  id: string;
  time: number; // minutes into simulation
  type: 'news' | 'technical' | 'macro' | 'whale';
  title: string;
  description: string;
  impact: number; // -1 to 1
  duration: number; // minutes
}

interface SimulationState {
  isRunning: boolean;
  currentTime: number; // minutes
  currentPrice: number;
  portfolioValue: number;
  bitcoinHoldings: number;
  cashBalance: number;
  totalTrades: number;
  winningTrades: number;
  maxDrawdown: number;
  events: MarketEvent[];
  priceHistory: Array<{ time: number; price: number; volume: number }>;
}

const marketScenarios: MarketScenario[] = [
  {
    id: "bull-run-2021",
    name: "2021 Bull Run",
    description: "Experience the historic Bitcoin bull run from $30K to $65K with institutional adoption news and market euphoria.",
    difficulty: "easy",
    duration: "30 min",
    volatility: 0.15,
    trend: "bullish",
    events: [
      {
        id: "tesla-announcement",
        time: 5,
        type: "news",
        title: "Tesla Announces $1.5B Bitcoin Purchase",
        description: "Tesla reveals they've purchased $1.5 billion worth of Bitcoin for their treasury.",
        impact: 0.3,
        duration: 60
      },
      {
        id: "coinbase-ipo",
        time: 15,
        type: "macro",
        title: "Coinbase IPO Success",
        description: "Coinbase goes public with massive valuation, legitimizing crypto industry.",
        impact: 0.2,
        duration: 30
      }
    ]
  },
  {
    id: "bear-market-2022",
    name: "2022 Bear Market",
    description: "Navigate the challenging crypto winter with FTX collapse, Terra Luna crash, and regulatory uncertainty.",
    difficulty: "hard",
    duration: "45 min",
    volatility: 0.25,
    trend: "bearish",
    events: [
      {
        id: "luna-collapse",
        time: 8,
        type: "macro",
        title: "Terra Luna Ecosystem Collapse",
        description: "UST stablecoin loses peg, triggering massive sell-off across crypto markets.",
        impact: -0.4,
        duration: 120
      },
      {
        id: "ftx-bankruptcy",
        time: 25,
        type: "news",
        title: "FTX Exchange Files for Bankruptcy",
        description: "Major crypto exchange FTX collapses amid fraud allegations and liquidity crisis.",
        impact: -0.3,
        duration: 90
      }
    ]
  },
  {
    id: "etf-approval-2024",
    name: "ETF Approval Rally",
    description: "Trade through the Bitcoin ETF approval period with massive institutional inflows and price discovery.",
    difficulty: "medium",
    duration: "35 min",
    volatility: 0.18,
    trend: "bullish",
    events: [
      {
        id: "etf-approval",
        time: 10,
        type: "macro",
        title: "Bitcoin ETF Approved by SEC",
        description: "SEC approves multiple Bitcoin spot ETFs, opening institutional access.",
        impact: 0.25,
        duration: 45
      },
      {
        id: "blackrock-inflow",
        time: 20,
        type: "whale",
        title: "BlackRock ETF Sees $1B Inflow",
        description: "BlackRock's Bitcoin ETF experiences record daily inflow of $1 billion.",
        impact: 0.15,
        duration: 30
      }
    ]
  }
];

const initialSimulationState: SimulationState = {
  isRunning: false,
  currentTime: 0,
  currentPrice: 50000,
  portfolioValue: 10000,
  bitcoinHoldings: 0,
  cashBalance: 10000,
  totalTrades: 0,
  winningTrades: 0,
  maxDrawdown: 0,
  events: [],
  priceHistory: []
};

export default function InteractiveMarketSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<MarketScenario>(marketScenarios[0]);
  const [simulation, setSimulation] = useState<SimulationState>(initialSimulationState);
  const [tradeAmount, setTradeAmount] = useState([1000]);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState([50000]);

  // Simulation Logic
  useEffect(() => {
    let interval: number;
    
    if (simulation.isRunning) {
      interval = window.setInterval(() => {
        setSimulation(prev => {
          const newTime = prev.currentTime + 1;
          
          // Check for events
          const activeEvents = selectedScenario.events.filter(event => 
            newTime >= event.time && newTime <= event.time + event.duration
          );
          
          // Calculate price movement
          let priceChange = (Math.random() - 0.5) * selectedScenario.volatility * 0.01;
          
          // Apply event impacts
          activeEvents.forEach(event => {
            priceChange += event.impact * 0.005; // Scale impact
          });
          
          // Apply trend bias
          if (selectedScenario.trend === 'bullish') {
            priceChange += 0.001;
          } else if (selectedScenario.trend === 'bearish') {
            priceChange -= 0.001;
          }
          
          const newPrice = prev.currentPrice * (1 + priceChange);
          const newPortfolioValue = prev.cashBalance + (prev.bitcoinHoldings * newPrice);
          
          // Update price history
          const newPriceHistory = [...prev.priceHistory, {
            time: newTime,
            price: newPrice,
            volume: Math.random() * 1000000 + 500000
          }].slice(-100); // Keep last 100 points
          
          return {
            ...prev,
            currentTime: newTime,
            currentPrice: newPrice,
            portfolioValue: newPortfolioValue,
            priceHistory: newPriceHistory,
            events: activeEvents
          };
        });
      }, 500); // Update every 500ms
    }
    
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [simulation.isRunning, selectedScenario]);

  const executeTrade = (type: 'buy' | 'sell') => {
    const amount = tradeAmount[0];
    const price = orderType === 'limit' ? limitPrice[0] : simulation.currentPrice;
    
    setSimulation(prev => {
      if (type === 'buy') {
        const bitcoinToBuy = amount / price;
        if (amount <= prev.cashBalance) {
          return {
            ...prev,
            bitcoinHoldings: prev.bitcoinHoldings + bitcoinToBuy,
            cashBalance: prev.cashBalance - amount,
            totalTrades: prev.totalTrades + 1
          };
        }
      } else {
        const bitcoinToSell = amount / price;
        if (bitcoinToSell <= prev.bitcoinHoldings) {
          return {
            ...prev,
            bitcoinHoldings: prev.bitcoinHoldings - bitcoinToSell,
            cashBalance: prev.cashBalance + amount,
            totalTrades: prev.totalTrades + 1
          };
        }
      }
      return prev;
    });
  };

  const resetSimulation = () => {
    setSimulation({
      ...initialSimulationState,
      currentPrice: selectedScenario.trend === 'bearish' ? 60000 : 40000
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatBitcoin = (value: number) => {
    return `${value.toFixed(6)} BTC`;
  };

  const winRate = simulation.totalTrades > 0 ? (simulation.winningTrades / simulation.totalTrades) * 100 : 0;
  const portfolioReturn = ((simulation.portfolioValue - 10000) / 10000) * 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <BarChart3 className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Market Simulator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice Bitcoin trading in realistic market scenarios. Learn from historical events and test your strategies risk-free.
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketScenarios.map((scenario) => (
          <Card 
            key={scenario.id}
            className={`cursor-pointer transition-all duration-300 ${
              selectedScenario.id === scenario.id 
                ? 'border-bitcoin-orange bg-bitcoin-orange/5' 
                : 'border-cyber-cyan/20 hover:border-bitcoin-orange/40'
            }`}
            onClick={() => setSelectedScenario(scenario)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{scenario.name}</CardTitle>
                <Badge className={
                  scenario.difficulty === 'easy' 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : scenario.difficulty === 'medium'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                }>
                  {scenario.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {scenario.duration}
                </span>
                <span className="flex items-center gap-1">
                  {scenario.trend === 'bullish' ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : scenario.trend === 'bearish' ? (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  ) : (
                    <BarChart3 className="h-3 w-3 text-yellow-400" />
                  )}
                  {scenario.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trading Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-bitcoin-orange" />
                  Bitcoin Price: {formatCurrency(simulation.currentPrice)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSimulation(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                    className={simulation.isRunning 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-green-600 hover:bg-green-700"
                    }
                  >
                    {simulation.isRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetSimulation}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulation.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Price']}
                      labelFormatter={(label) => `Time: ${label}m`}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#F59E0B"
                      fill="url(#priceGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trading Panel */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle>Execute Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="market" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="market" onClick={() => setOrderType('market')}>Market Order</TabsTrigger>
                  <TabsTrigger value="limit" onClick={() => setOrderType('limit')}>Limit Order</TabsTrigger>
                </TabsList>
                
                <TabsContent value="market" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Trade Amount (USD)</label>
                      <Slider
                        value={tradeAmount}
                        onValueChange={setTradeAmount}
                        max={Math.min(simulation.cashBalance, simulation.bitcoinHoldings * simulation.currentPrice)}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        ${tradeAmount[0].toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => executeTrade('buy')}
                        disabled={!simulation.isRunning || tradeAmount[0] > simulation.cashBalance}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Buy Bitcoin
                      </Button>
                      <Button 
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={() => executeTrade('sell')}
                        disabled={!simulation.isRunning || (tradeAmount[0] / simulation.currentPrice) > simulation.bitcoinHoldings}
                      >
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Sell Bitcoin
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="limit" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Limit Price</label>
                      <Slider
                        value={limitPrice}
                        onValueChange={setLimitPrice}
                        max={simulation.currentPrice * 1.1}
                        min={simulation.currentPrice * 0.9}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(limitPrice[0])}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Trade Amount (USD)</label>
                      <Slider
                        value={tradeAmount}
                        onValueChange={setTradeAmount}
                        max={Math.min(simulation.cashBalance, simulation.bitcoinHoldings * simulation.currentPrice)}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        ${tradeAmount[0].toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => executeTrade('buy')}
                        disabled={!simulation.isRunning}
                      >
                        Buy Limit
                      </Button>
                      <Button 
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={() => executeTrade('sell')}
                        disabled={!simulation.isRunning}
                      >
                        Sell Limit
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio & Events Sidebar */}
        <div className="space-y-6">
          {/* Portfolio Stats */}
          <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-cyber-cyan/10 border-bitcoin-orange/20">
            <CardHeader>
              <CardTitle className="text-lg">Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Value</div>
                  <div className="font-bold text-lg">{formatCurrency(simulation.portfolioValue)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">P&L</div>
                  <div className={`font-bold text-lg ${portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Cash</div>
                  <div className="font-medium">{formatCurrency(simulation.cashBalance)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Bitcoin</div>
                  <div className="font-medium">{formatBitcoin(simulation.bitcoinHoldings)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Trades</div>
                  <div className="font-medium">{simulation.totalTrades}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Win Rate</div>
                  <div className="font-medium">{winRate.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Events */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-bitcoin-orange" />
                Market Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {simulation.events.length > 0 ? (
                <div className="space-y-3">
                  {simulation.events.map((event) => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        event.impact > 0 
                          ? 'border-l-green-500 bg-green-500/5' 
                          : 'border-l-red-500 bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {event.impact > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-400 mt-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400 mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No active market events</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulation Progress */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="text-lg">Simulation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Time Elapsed</span>
                  <span>{simulation.currentTime} / 30 min</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-bitcoin-orange h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((simulation.currentTime / 30) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Scenario: {selectedScenario.name}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
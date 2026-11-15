import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Bell,
  Calculator,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Clock,
  DollarSign,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface ExchangePrice {
  exchange: {
    name: string;
    logo: string;
    url: string;
    country: string;
    tradingFee: number;
    withdrawalFee: number;
  };
  price: number;
  volume24h: number;
  change24h: number;
  lastUpdated: string;
  spread: number;
}

interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: 'above' | 'below';
  exchange: string;
  isActive: boolean;
  createdAt: Date;
}

export default function PricesPage() {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "volume" | "change">("price");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above");
  const [selectedExchange, setSelectedExchange] = useState("");

  // Fetch real-time prices
  const { data: priceData, isLoading: pricesLoading, refetch: refetchPrices } = useQuery({
    queryKey: ['/api/prices/comparison'],
    refetchInterval: 30000, // 30 seconds
  });

  // Fetch price history for charts
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['/api/charts/bitcoin-history'],
    refetchInterval: 60000, // 1 minute
  });

  const exchanges: ExchangePrice[] = priceData?.exchanges || [];
  const chartDataArray = chartData || [];
  
  const filteredExchanges = exchanges.filter(exchange =>
    exchange.exchange.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const sortedExchanges = [...filteredExchanges].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "volume":
        return b.volume24h - a.volume24h;
      case "change":
        return b.change24h - a.change24h;
      default:
        return 0;
    }
  });

  const bestPrice = exchanges.length > 0 ? Math.min(...exchanges.map(e => e.price)) : 0;
  const worstPrice = exchanges.length > 0 ? Math.max(...exchanges.map(e => e.price)) : 0;
  const averagePrice = exchanges.length > 0 ? exchanges.reduce((sum, e) => sum + e.price, 0) / exchanges.length : 0;
  const arbitrageOpportunity = worstPrice - bestPrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume > 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume > 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume > 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-dark-bg text-foreground">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <TrendingUp className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Bitcoin Price Comparison
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find the best Bitcoin price across all major exchanges in real-time. Compare fees, volumes, and set up price alerts.
        </p>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{formatPrice(bestPrice)}</div>
            <div className="text-sm text-muted-foreground">Best Price</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{formatPrice(worstPrice)}</div>
            <div className="text-sm text-muted-foreground">Highest Price</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-cyan">{formatPrice(averagePrice)}</div>
            <div className="text-sm text-muted-foreground">Average Price</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-yellow-500/10 border-bitcoin-orange/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-bitcoin-orange">{formatPrice(arbitrageOpportunity)}</div>
            <div className="text-sm text-muted-foreground">Arbitrage Opportunity</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-dark-card">
          <TabsTrigger value="comparison">Exchange Comparison</TabsTrigger>
          <TabsTrigger value="charts">Price Charts</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        {/* Exchange Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exchanges..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 w-64 bg-dark-card border-cyber-cyan/30"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40 bg-dark-card border-cyber-cyan/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="volume">Sort by Volume</SelectItem>
                  <SelectItem value="change">Sort by Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => refetchPrices()} 
              variant="outline" 
              className="border-cyber-cyan/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Exchange List */}
          <div className="space-y-4">
            {pricesLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-cyber-cyan" />
                <p className="text-muted-foreground">Loading real-time prices...</p>
              </div>
            ) : (
              sortedExchanges.map((exchange, index) => (
                <Card 
                  key={exchange.exchange.name} 
                  className={`bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300 ${
                    exchange.price === bestPrice ? 'border-green-500/50 bg-green-500/5' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Exchange Info */}
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{exchange.exchange.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exchange.exchange.country}
                          </div>
                        </div>
                        {exchange.price === bestPrice && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Best Price
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-bitcoin-orange">
                          {formatPrice(exchange.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Price
                        </div>
                      </div>

                      {/* 24h Change */}
                      <div className="text-center">
                        <div className={`text-lg font-semibold flex items-center gap-1 justify-center ${getPriceChangeColor(exchange.change24h)}`}>
                          {getPriceChangeIcon(exchange.change24h)}
                          {exchange.change24h > 0 ? '+' : ''}{exchange.change24h.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          24h Change
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="text-center">
                        <div className="text-lg font-semibold text-cyber-cyan">
                          {formatVolume(exchange.volume24h)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          24h Volume
                        </div>
                      </div>

                      {/* Fees */}
                      <div className="text-center">
                        <div className="text-sm">
                          <div>Trading: {exchange.exchange.tradingFee}%</div>
                          <div>Withdrawal: {formatPrice(exchange.exchange.withdrawalFee)}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Fees
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-cyber-cyan/30"
                          onClick={() => window.open(exchange.exchange.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Trade
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-bitcoin-orange/30"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Price Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-bitcoin-orange" />
                Bitcoin Price History
              </CardTitle>
              <CardDescription>
                Historical price data with exchange comparison overlay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-cyber-cyan" />
                  </div>
                ) : chartDataArray.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataArray}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
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
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                        labelFormatter={(value) => new Date(value).toLocaleString()}
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
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No chart data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-bitcoin-orange" />
                Create Price Alert
              </CardTitle>
              <CardDescription>
                Get notified when Bitcoin reaches your target price on any exchange
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Price</label>
                  <Input
                    type="number"
                    placeholder="120000"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="bg-dark-surface border-cyber-cyan/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <Select value={alertCondition} onValueChange={(value: any) => setAlertCondition(value)}>
                    <SelectTrigger className="bg-dark-surface border-cyber-cyan/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Price goes above</SelectItem>
                      <SelectItem value="below">Price goes below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Exchange</label>
                  <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                    <SelectTrigger className="bg-dark-surface border-cyber-cyan/30">
                      <SelectValue placeholder="Any exchange" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any exchange</SelectItem>
                      {exchanges.map((exchange) => (
                        <SelectItem key={exchange.exchange.name} value={exchange.exchange.name}>
                          {exchange.exchange.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black">
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle>Active Price Alerts</CardTitle>
              <CardDescription>Manage your current price notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active alerts. Create one above to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
      <Footer />
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Signal, FileText, RefreshCw, AlertTriangle, Target, Shield } from 'lucide-react';
import InteractiveTooltip from './interactive-tooltip';
import QuickExplainer from './quick-explainer';

interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
}

interface PricePrediction {
  target24h: number;
  target7d: number;
  confidence: number;
  reasoning: string;
  supportLevels: number[];
  resistanceLevels: number[];
}

interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  strength: number;
  timeframe: string;
  reasoning: string;
  riskAssessment: string;
}

interface MarketReport {
  report: string;
  timestamp: string;
}

export default function AIIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('analysis');

  const { data: marketAnalysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['/api/ai/market-analysis'],
    refetchInterval: 300000, // 5 minutes
  }) as { data: MarketAnalysis | undefined, isLoading: boolean, refetch: () => void };

  const { data: pricePrediction, isLoading: predictionLoading, refetch: refetchPrediction } = useQuery({
    queryKey: ['/api/ai/shared-prediction'],
    refetchInterval: 600000, // 10 minutes
  }) as { data: PricePrediction | undefined, isLoading: boolean, refetch: () => void };

  const { data: tradingSignal, isLoading: signalLoading, refetch: refetchSignal } = useQuery({
    queryKey: ['/api/ai/trading-signal'],
    refetchInterval: 300000, // 5 minutes
  }) as { data: TradingSignal | undefined, isLoading: boolean, refetch: () => void };

  const { data: marketReport, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['/api/ai/market-report'],
    refetchInterval: 1800000, // 30 minutes
  }) as { data: MarketReport | undefined, isLoading: boolean, refetch: () => void };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'bearish': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'sell': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'analysis':
        refetchAnalysis();
        break;
      case 'prediction':
        refetchPrediction();
        break;
      case 'signals':
        refetchSignal();
        break;
      case 'report':
        refetchReport();
        break;
    }
  };

  return (
    <div className="space-y-6 -mt-6 relative">
      <div className="absolute inset-0 circuit-pattern opacity-10 -z-10"></div>
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 floating-coins">
            <Brain className="h-6 w-6 text-purple-500 bitcoin-golden-glow" />
          </div>
          <div className="text-center">
            <QuickExplainer
              title="AI Market Intelligence"
              explanation="Advanced AI-powered analysis using GPT-4 to analyze Bitcoin market trends, sentiment, and generate trading insights based on real-time data and historical patterns."
              learnMoreUrl="https://openai.com/gpt-4"
            >
              <h2 className="text-2xl font-bold text-white cursor-pointer hover:text-purple-400 transition-colors bitcoin-road-effect floating-coins">AI Market Intelligence</h2>
            </QuickExplainer>
            <p className="text-gray-400">GPT-4 powered Bitcoin analysis and insights</p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="absolute top-0 right-0 border-gray-700 hover:border-purple-500 hover:bg-purple-500/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* AI Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
          <QuickExplainer
            title="Market Analysis"
            explanation="AI-powered market sentiment analysis that evaluates Bitcoin's current market conditions based on news, social sentiment, and trading patterns."
            learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
          >
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 cursor-pointer">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </QuickExplainer>
          <QuickExplainer
            title="Price Prediction"
            explanation="AI-generated Bitcoin price predictions for 24h and 7-day periods using advanced machine learning models and market data analysis."
            learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
          >
            <TabsTrigger value="prediction" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 cursor-pointer">
              <Target className="h-4 w-4 mr-2" />
              Prediction
            </TabsTrigger>
          </QuickExplainer>
          <QuickExplainer
            title="Trading Signals"
            explanation="AI-generated trading recommendations including buy/sell/hold signals with confidence levels and risk assessments for informed trading decisions."
            learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
          >
            <TabsTrigger value="signals" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 cursor-pointer">
              <Signal className="h-4 w-4 mr-2" />
              Signals
            </TabsTrigger>
          </QuickExplainer>
          <QuickExplainer
            title="Market Report"
            explanation="Comprehensive AI-generated market report summarizing current Bitcoin trends, key developments, and market outlook with detailed analysis."
            learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
          >
            <TabsTrigger value="report" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
          </QuickExplainer>
        </TabsList>

        {/* Market Analysis Tab */}
        <TabsContent value="analysis">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <QuickExplainer
                  title="Market Sentiment Analysis"
                  explanation="Advanced AI analysis of current Bitcoin market sentiment combining news sentiment, social media trends, and trading patterns to determine bullish, bearish, or neutral market conditions."
                  learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
                >
                  <span className="cursor-pointer hover:text-purple-400 transition-colors">Market Sentiment Analysis</span>
                </QuickExplainer>
              </CardTitle>
              <CardDescription>AI-powered market sentiment and risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
              ) : marketAnalysis ? (
                <>
                  {/* Sentiment Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge className={`${getSentimentColor(marketAnalysis.sentiment)} capitalize font-semibold px-4 py-2`}>
                        {marketAnalysis.sentiment}
                      </Badge>
                      <p className="text-sm text-gray-400 mt-2">Market Sentiment</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {Math.round(marketAnalysis.confidence * 100)}%
                      </div>
                      <Progress value={marketAnalysis.confidence * 100} className="w-full mb-2" />
                      <p className="text-sm text-gray-400">Confidence Level</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold capitalize ${getRiskColor(marketAnalysis.riskLevel)}`}>
                        {marketAnalysis.riskLevel}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">Risk Level</p>
                    </div>
                  </div>

                  {/* Analysis Reasoning */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center justify-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <QuickExplainer
                        title="AI Analysis"
                        explanation="Deep AI reasoning and analysis explaining the current market sentiment based on multiple data sources including technical indicators, news analysis, and market patterns."
                        learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
                      >
                        <span className="cursor-pointer hover:text-purple-400 transition-colors">AI Analysis</span>
                      </QuickExplainer>
                    </h4>
                    <p className="text-gray-300 leading-relaxed">{marketAnalysis.reasoning}</p>
                  </div>

                  {/* Key Factors */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 text-center">
                      <QuickExplainer
                        title="Key Market Factors"
                        explanation="Important factors currently influencing Bitcoin's price movement, including institutional adoption, regulatory developments, technical levels, and market trends."
                        learnMoreUrl="https://coinmarketcap.com/currencies/bitcoin/"
                      >
                        <span className="cursor-pointer hover:text-purple-400 transition-colors">Key Market Factors</span>
                      </QuickExplainer>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {marketAnalysis.keyFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Failed to load market analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Prediction Tab */}
        <TabsContent value="prediction">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                AI Price Predictions
              </CardTitle>
              <CardDescription>Machine learning-based price forecasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {predictionLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
              ) : pricePrediction ? (
                <>
                  {/* Price Targets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {pricePrediction.target24h ? `$${pricePrediction.target24h.toLocaleString()}` : 'Analyzing...'}
                      </div>
                      <p className="text-sm text-gray-400">24h Target</p>
                    </div>
                    <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {pricePrediction.target7d ? `$${pricePrediction.target7d.toLocaleString()}` : 'Analyzing...'}
                      </div>
                      <p className="text-sm text-gray-400">7d Target</p>
                    </div>
                    <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-white mb-1">
                        {Math.round(pricePrediction.confidence * 100)}%
                      </div>
                      <Progress value={pricePrediction.confidence * 100} className="w-full mb-2" />
                      <p className="text-sm text-gray-400">Confidence</p>
                    </div>
                  </div>

                  {/* Prediction Reasoning */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Prediction Analysis
                    </h4>
                    <p className="text-gray-300 leading-relaxed">{pricePrediction.reasoning}</p>
                  </div>

                  {/* Support & Resistance Levels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Support Levels
                      </h4>
                      <div className="space-y-2">
                        {(pricePrediction.supportLevels || []).map((level, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-400">S{index + 1}</span>
                            <span className="text-green-400 font-mono">
                              {level ? `$${level.toLocaleString()}` : 'Analyzing...'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Resistance Levels
                      </h4>
                      <div className="space-y-2">
                        {(pricePrediction.resistanceLevels || []).map((level, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-400">R{index + 1}</span>
                            <span className="text-red-400 font-mono">
                              {level ? `$${level.toLocaleString()}` : 'Analyzing...'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Failed to load price predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Signals Tab */}
        <TabsContent value="signals">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Signal className="h-5 w-5 text-purple-500" />
                AI Trading Signals
              </CardTitle>
              <CardDescription>Professional trading recommendations with risk management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {signalLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
              ) : tradingSignal ? (
                <>
                  {/* Signal Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge className={`${getActionColor(tradingSignal.action)} uppercase font-bold px-6 py-3 text-lg`}>
                        {tradingSignal.action}
                      </Badge>
                      <p className="text-sm text-gray-400 mt-2">Signal</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {Math.round(tradingSignal.strength * 100)}%
                      </div>
                      <Progress value={tradingSignal.strength * 100} className="w-full mb-2" />
                      <p className="text-sm text-gray-400">Signal Strength</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-400">
                        {tradingSignal.timeframe}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">Timeframe</p>
                    </div>
                  </div>

                  {/* Signal Reasoning */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Signal Analysis
                    </h4>
                    <p className="text-gray-300 leading-relaxed">{tradingSignal.reasoning}</p>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Management
                    </h4>
                    <p className="text-gray-300 leading-relaxed">{tradingSignal.riskAssessment}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Failed to load trading signals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Report Tab */}
        <TabsContent value="report">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                AI Market Report
              </CardTitle>
              <CardDescription>
                Comprehensive market analysis and outlook
                {marketReport && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Generated: {new Date(marketReport.timestamp).toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${100 - i * 10}%` }}></div>
                  ))}
                </div>
              ) : marketReport ? (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="prose prose-invert max-w-none">
                    {marketReport.report.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-300 leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Failed to load market report</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
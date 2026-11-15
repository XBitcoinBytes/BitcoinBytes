import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Newspaper, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Zap,
  Globe,
  Users,
  Eye,
  Share2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'positive' | 'negative' | 'neutral';
  readTime: number;
}

interface MarketImpact {
  category: string;
  impact: string;
  description: string;
  confidence: number;
}

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch news data
  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ['/api/news'],
    refetchInterval: 300000, // 5 minutes
  });

  const articles: NewsArticle[] = newsData || [];

  // Filter and sort articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    const matchesImpact = impactFilter === "all" || article.impact === impactFilter;
    
    return matchesSearch && matchesCategory && matchesImpact;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case "impact":
        const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      case "popular":
        return Math.random() - 0.5; // Placeholder for actual popularity metric
      default:
        return 0;
    }
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'negative': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'neutral': return <CheckCircle className="h-4 w-4 text-yellow-400" />;
      default: return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const categories = [...new Set(articles.map(article => article.category))];
  const impactLevels = ['HIGH', 'MEDIUM', 'LOW'];

  const marketImpacts: MarketImpact[] = [
    {
      category: "Regulatory",
      impact: "Moderate Positive",
      description: "Recent regulatory clarity supporting institutional adoption",
      confidence: 78
    },
    {
      category: "Technical",
      impact: "Strong Positive", 
      description: "Lightning Network adoption accelerating payment solutions",
      confidence: 85
    },
    {
      category: "Adoption",
      impact: "Very Positive",
      description: "Major corporations adding Bitcoin to treasury reserves",
      confidence: 92
    },
    {
      category: "Market",
      impact: "Neutral",
      description: "Mixed signals from institutional and retail investors",
      confidence: 65
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Newspaper className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Bitcoin News Authority
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your primary source for current, impactful, and deeply researched Bitcoin news. Stay informed with expert analysis and market insights.
        </p>
      </div>

      {/* News Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-cyber-cyan/10 border-bitcoin-orange/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-bitcoin-orange">{articles.length}</div>
            <div className="text-sm text-muted-foreground">Articles Today</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{articles.filter(a => a.impact === 'HIGH').length}</div>
            <div className="text-sm text-muted-foreground">High Impact</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{articles.filter(a => a.sentiment === 'positive').length}</div>
            <div className="text-sm text-muted-foreground">Positive News</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-cyan">24/7</div>
            <div className="text-sm text-muted-foreground">Live Updates</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="news" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-dark-card">
          <TabsTrigger value="news">Latest News</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
        </TabsList>

        {/* Latest News Tab */}
        <TabsContent value="news" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-dark-card border-cyber-cyan/30"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-dark-card border-cyber-cyan/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-36 bg-dark-card border-cyber-cyan/30">
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact</SelectItem>
                  {impactLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 bg-dark-card border-cyber-cyan/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="impact">By Impact</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => refetchNews()} 
                variant="outline" 
                className="border-cyber-cyan/30"
              >
                <Zap className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Breaking News Banner */}
          {articles.filter(a => a.impact === 'HIGH').length > 0 && (
            <Card className="bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-400 animate-pulse" />
                    <span className="font-bold text-red-400">BREAKING</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">
                      {articles.filter(a => a.impact === 'HIGH')[0]?.title}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-400">
                    Read Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* News Articles */}
          <div className="space-y-4">
            {newsLoading ? (
              <div className="text-center py-8">
                <Newspaper className="h-8 w-8 animate-pulse mx-auto mb-4 text-cyber-cyan" />
                <p className="text-muted-foreground">Loading latest Bitcoin news...</p>
              </div>
            ) : (
              sortedArticles.map((article, index) => (
                <Card 
                  key={article.id} 
                  className="bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Article Content */}
                      <div className="lg:col-span-8 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getImpactColor(article.impact)}>
                            {article.impact} IMPACT
                          </Badge>
                          <Badge variant="outline" className="border-gray-600">
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {getSentimentIcon(article.sentiment)}
                            <span className="capitalize">{article.sentiment}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold hover:text-bitcoin-orange transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {article.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {article.source}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTimeAgo(article.publishedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {article.readTime} min read
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="lg:col-span-4 flex lg:flex-col gap-2 lg:items-end justify-end">
                        <Button 
                          size="sm"
                          className="bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Article
                        </Button>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-cyber-cyan/30">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-cyber-cyan/30">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-bitcoin-orange" />
                Market Impact Analysis
              </CardTitle>
              <CardDescription>
                Expert analysis of how current news affects Bitcoin markets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketImpacts.map((impact, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{impact.category}</span>
                      <Badge className={
                        impact.impact.includes('Positive') ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        impact.impact.includes('Negative') ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }>
                        {impact.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {impact.description}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyber-cyan">
                      {impact.confidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Topics Tab */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { topic: "Bitcoin ETF Updates", mentions: 847, trend: "+23%" },
              { topic: "Lightning Network", mentions: 623, trend: "+15%" },
              { topic: "Regulatory Clarity", mentions: 456, trend: "+8%" },
              { topic: "Mining Sustainability", mentions: 389, trend: "+12%" },
              { topic: "Corporate Adoption", mentions: 267, trend: "+31%" },
              { topic: "DeFi Integration", mentions: 234, trend: "+7%" }
            ].map((trending, index) => (
              <Card key={index} className="bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold mb-2">{trending.topic}</div>
                  <div className="text-2xl font-bold text-cyber-cyan mb-1">{trending.mentions}</div>
                  <div className="text-sm text-muted-foreground mb-2">mentions today</div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    {trending.trend} trending
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
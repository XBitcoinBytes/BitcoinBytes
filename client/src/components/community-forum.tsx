import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  TrendingUp,
  Users,
  Clock,
  Pin,
  Star,
  Filter,
  Search,
  Plus,
  Award,
  Flame
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
    reputation: number;
    badges: string[];
  };
  category: 'general' | 'analysis' | 'education' | 'trading' | 'news';
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  replies: number;
  isPinned: boolean;
  isHot: boolean;
  tags: string[];
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
    reputation: number;
  };
  timestamp: Date;
  upvotes: number;
  downvotes: number;
}

const mockPosts: ForumPost[] = [
  {
    id: "post-1",
    title: "Bitcoin ETF Approval Impact Analysis - What's Next?",
    content: "With the recent ETF approvals, we're seeing unprecedented institutional adoption. Let's discuss the long-term implications for Bitcoin's price trajectory and market structure.",
    author: {
      username: "BitcoinAnalyst",
      reputation: 2450,
      badges: ["Expert Trader", "Top Contributor"]
    },
    category: "analysis",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    upvotes: 47,
    downvotes: 3,
    replies: 23,
    isPinned: true,
    isHot: true,
    tags: ["ETF", "Institutional", "Analysis"]
  },
  {
    id: "post-2",
    title: "Lightning Network Tutorial: Setting up Your First Channel",
    content: "Step-by-step guide for beginners to understand and set up Lightning Network payment channels. Includes practical examples and security considerations.",
    author: {
      username: "LightningGuru",
      reputation: 1890,
      badges: ["Lightning Expert", "Educator"]
    },
    category: "education",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    upvotes: 34,
    downvotes: 1,
    replies: 15,
    isPinned: false,
    isHot: true,
    tags: ["Lightning", "Tutorial", "Beginner"]
  },
  {
    id: "post-3",
    title: "Technical Analysis: Bitcoin Testing Key Support at $115K",
    content: "Bitcoin is currently testing a critical support level. Volume analysis suggests potential bounce, but RSI indicates oversold conditions. What are your thoughts?",
    author: {
      username: "ChartMaster",
      reputation: 1650,
      badges: ["TA Expert"]
    },
    category: "trading",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    upvotes: 28,
    downvotes: 5,
    replies: 31,
    isPinned: false,
    isHot: false,
    tags: ["TA", "Support", "Trading"]
  },
  {
    id: "post-4",
    title: "Hardware Wallet Security: Best Practices Guide",
    content: "Comprehensive guide on securing your Bitcoin with hardware wallets. Covers setup, backup procedures, and common security mistakes to avoid.",
    author: {
      username: "SecurityFirst",
      reputation: 1420,
      badges: ["Security Expert"]
    },
    category: "education",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    upvotes: 56,
    downvotes: 0,
    replies: 12,
    isPinned: false,
    isHot: false,
    tags: ["Security", "Hardware", "Wallets"]
  }
];

const categoryColors = {
  general: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  analysis: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  education: "bg-green-500/20 text-green-300 border-green-500/30",
  trading: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  news: "bg-purple-500/20 text-purple-300 border-purple-500/30"
};

export default function CommunityForum() {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "hot":
        return (b.upvotes + b.replies * 2) - (a.upvotes + a.replies * 2);
      case "new":
        return b.timestamp.getTime() - a.timestamp.getTime();
      case "top":
        return b.upvotes - a.upvotes;
      default:
        return 0;
    }
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Users className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Bitcoin Community
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow Bitcoin enthusiasts, share insights, and learn from the community's collective wisdom.
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-cyber-cyan/10 border-bitcoin-orange/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-bitcoin-orange">12.5K</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-cyan">847</div>
            <div className="text-sm text-muted-foreground">Posts Today</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">2.3K</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-cyber-cyan/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">156</div>
            <div className="text-sm text-muted-foreground">Expert Contributors</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
              <Button variant="outline" className="w-full border-cyber-cyan/30">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
              <Button variant="outline" className="w-full border-cyber-cyan/30">
                <TrendingUp className="h-4 w-4 mr-2" />
                Share Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: "all", label: "All Posts", count: posts.length },
                { key: "general", label: "General", count: posts.filter(p => p.category === "general").length },
                { key: "analysis", label: "Analysis", count: posts.filter(p => p.category === "analysis").length },
                { key: "education", label: "Education", count: posts.filter(p => p.category === "education").length },
                { key: "trading", label: "Trading", count: posts.filter(p => p.category === "trading").length },
                { key: "news", label: "News", count: posts.filter(p => p.category === "news").length }
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    selectedCategory === category.key
                      ? "bg-bitcoin-orange/20 text-bitcoin-orange"
                      : "hover:bg-gray-700/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{category.label}</span>
                    <span className="text-xs">{category.count}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-bitcoin-orange" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { username: "BitcoinAnalyst", reputation: 2450, posts: 156 },
                { username: "LightningGuru", reputation: 1890, posts: 89 },
                { username: "ChartMaster", reputation: 1650, posts: 234 },
                { username: "SecurityFirst", reputation: 1420, posts: 67 }
              ].map((contributor, index) => (
                <div key={contributor.username} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-bitcoin-orange text-black text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{contributor.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{contributor.username}</div>
                    <div className="text-xs text-muted-foreground">{contributor.reputation} rep</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-dark-card border-cyber-cyan/30"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "hot" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("hot")}
                className={sortBy === "hot" ? "bg-bitcoin-orange text-black" : "border-cyber-cyan/30"}
              >
                <Flame className="h-4 w-4 mr-2" />
                Hot
              </Button>
              <Button
                variant={sortBy === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("new")}
                className={sortBy === "new" ? "bg-bitcoin-orange text-black" : "border-cyber-cyan/30"}
              >
                <Clock className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button
                variant={sortBy === "top" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("top")}
                className={sortBy === "top" ? "bg-bitcoin-orange text-black" : "border-cyber-cyan/30"}
              >
                <Star className="h-4 w-4 mr-2" />
                Top
              </Button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <Card 
                key={post.id} 
                className={`bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300 cursor-pointer ${
                  post.isPinned ? 'border-bitcoin-orange/40' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {post.isPinned && <Pin className="h-4 w-4 text-bitcoin-orange" />}
                        {post.isHot && <Flame className="h-4 w-4 text-red-400" />}
                        <Badge className={categoryColors[post.category]}>
                          {post.category}
                        </Badge>
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg hover:text-bitcoin-orange transition-colors">
                        {post.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{post.author.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {post.author.reputation} reputation • {formatTimeAgo(post.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
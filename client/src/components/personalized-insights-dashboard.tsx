import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  Target,
  Calendar,
  Star,
  BookOpen,
  DollarSign,
  Shield,
  Clock,
  Bell,
  Settings
} from "lucide-react";

interface UserProfile {
  name: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  goals: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  learningStyle: 'visual' | 'reading' | 'interactive' | 'mixed';
}

interface PersonalizedInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'goal';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  category: string;
  timestamp: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

const userProfile: UserProfile = {
  name: "Bitcoin Explorer",
  experience: "intermediate",
  interests: ["trading", "technology", "economics"],
  goals: ["portfolio-growth", "technical-analysis", "long-term-hodl"],
  riskTolerance: "medium",
  learningStyle: "mixed"
};

const personalizedInsights: PersonalizedInsight[] = [
  {
    id: "market-opportunity",
    type: "opportunity",
    title: "Technical Analysis Signal",
    content: "Bitcoin is approaching a key support level at $115,000. Based on your trading interest, this could be a strategic accumulation zone.",
    priority: "high",
    actionable: true,
    category: "Trading",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: "learning-tip",
    type: "tip",
    title: "Lightning Network Deep Dive",
    content: "Since you're interested in Bitcoin technology, consider exploring Lightning Network fundamentals. It's perfect for your intermediate level.",
    priority: "medium",
    actionable: true,
    category: "Education",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: "portfolio-warning",
    type: "warning",
    title: "Diversification Check",
    content: "Your portfolio concentration in Bitcoin is high. Consider your risk tolerance and potential rebalancing strategies.",
    priority: "medium",
    actionable: true,
    category: "Portfolio",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  },
  {
    id: "goal-progress",
    type: "goal",
    title: "Technical Analysis Progress",
    content: "You're 75% through the Technical Analysis module. Complete it this week to stay on track with your learning goals.",
    priority: "medium",
    actionable: true,
    category: "Goals",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
];

const achievements: Achievement[] = [
  {
    id: "first-week",
    title: "Bitcoin Beginner",
    description: "Complete your first week of Bitcoin learning",
    icon: "🎓",
    unlocked: true,
    progress: 7,
    maxProgress: 7
  },
  {
    id: "chart-master",
    title: "Chart Master",
    description: "Analyze 50 Bitcoin price charts",
    icon: "📈",
    unlocked: false,
    progress: 23,
    maxProgress: 50
  },
  {
    id: "news-reader",
    title: "News Hawk",
    description: "Read 100 Bitcoin news articles",
    icon: "📰",
    unlocked: false,
    progress: 67,
    maxProgress: 100
  },
  {
    id: "diamond-hands",
    title: "Diamond Hands",
    description: "Track your portfolio for 30 consecutive days",
    icon: "💎",
    unlocked: false,
    progress: 18,
    maxProgress: 30
  }
];

const priorityColors = {
  low: "border-l-gray-500 bg-gray-500/5",
  medium: "border-l-orange-500 bg-orange-500/5",
  high: "border-l-red-500 bg-red-500/5"
};

const typeIcons = {
  opportunity: TrendingUp,
  warning: AlertCircle,
  tip: Lightbulb,
  goal: Target
};

export default function PersonalizedInsightsDashboard() {
  const [activeInsights, setActiveInsights] = useState(personalizedInsights);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const dismissInsight = (insightId: string) => {
    setActiveInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <User className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Your Bitcoin Journey
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Personalized insights, goals tracking, and achievements tailored to your Bitcoin learning and investment journey.
        </p>
      </div>

      {/* User Profile Summary */}
      <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-cyber-cyan/10 border-bitcoin-orange/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-bitcoin-orange" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Experience Level</div>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                {userProfile.experience}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Risk Tolerance</div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {userProfile.riskTolerance}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Learning Style</div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {userProfile.learningStyle}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Active Goals</div>
              <div className="text-2xl font-bold text-bitcoin-orange">{userProfile.goals.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personalized Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-bitcoin-orange" />
              Personalized Insights
            </h2>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>

          <div className="space-y-4">
            {activeInsights.map((insight) => {
              const TypeIcon = typeIcons[insight.type];
              return (
                <Card 
                  key={insight.id} 
                  className={`border-l-4 ${priorityColors[insight.priority]} border-cyber-cyan/20`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-bitcoin-orange" />
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissInsight(insight.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{insight.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(insight.timestamp)}
                      </span>
                      {insight.actionable && (
                        <Button size="sm" className="bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievements & Progress */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-bitcoin-orange" />
                Achievements
              </CardTitle>
              <CardDescription>
                {unlockedAchievements} of {totalAchievements} unlocked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress 
                value={(unlockedAchievements / totalAchievements) * 100} 
                className="h-2" 
              />
              
              <div className="space-y-3">
                {achievements.slice(0, showAllAchievements ? achievements.length : 3).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-bitcoin-orange/10 border-bitcoin-orange/30' 
                        : 'bg-dark-card/50 border-gray-600/30'
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${
                        achievement.unlocked ? 'text-bitcoin-orange' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.description}
                      </div>
                      {!achievement.unlocked && (
                        <div className="mt-1 space-y-1">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1" 
                          />
                          <div className="text-xs text-muted-foreground">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {achievements.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowAllAchievements(!showAllAchievements)}
                >
                  {showAllAchievements ? 'Show Less' : `Show All ${achievements.length} Achievements`}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-bitcoin-orange" />
                Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Technical Analysis Mastery</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Portfolio Growth</span>
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Knowledge</span>
                  <span className="text-sm text-muted-foreground">40%</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              
              <Separator />
              
              <Button className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black">
                <Target className="h-4 w-4 mr-2" />
                Set New Goal
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-bitcoin-orange" />
                  <span className="text-sm">Learning Sessions</span>
                </div>
                <span className="font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyber-cyan" />
                  <span className="text-sm">Study Time</span>
                </div>
                <span className="font-bold">4.5h</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Progress Made</span>
                </div>
                <span className="font-bold">+15%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
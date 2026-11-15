import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal,
  Star,
  Crown,
  Target,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Award,
  Flame,
  Zap,
  Users,
  Calendar,
  Share2
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  totalPoints: number;
  rank: number;
  achievements: Achievement[];
  weeklyGain: number;
  monthlyGain: number;
  specialBadges: string[];
  joinDate: Date;
  lastActive: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'trading' | 'community' | 'milestone';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
}

interface ChallengeEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  rewards: {
    first: number;
    second: number;
    third: number;
    participation: number;
  };
  isActive: boolean;
}

const mockLeaderboard: LeaderboardUser[] = [
  {
    id: "user-1",
    username: "BitcoinMaster",
    totalPoints: 15420,
    rank: 1,
    achievements: [],
    weeklyGain: 850,
    monthlyGain: 3200,
    specialBadges: ["Pioneer", "Master Trader", "Community Champion"],
    joinDate: new Date("2024-01-15"),
    lastActive: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "user-2", 
    username: "CryptoAnalyst",
    totalPoints: 14750,
    rank: 2,
    achievements: [],
    weeklyGain: 620,
    monthlyGain: 2850,
    specialBadges: ["Expert Analyst", "Top Contributor"],
    joinDate: new Date("2024-02-20"),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "user-3",
    username: "HODLer2025",
    totalPoints: 13980,
    rank: 3,
    achievements: [],
    weeklyGain: 420,
    monthlyGain: 2100,
    specialBadges: ["Diamond Hands", "Long Term Thinker"],
    joinDate: new Date("2024-01-08"),
    lastActive: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: "user-4",
    username: "LightningDev",
    totalPoints: 12650,
    rank: 4,
    achievements: [],
    weeklyGain: 380,
    monthlyGain: 1950,
    specialBadges: ["Tech Expert", "Lightning Specialist"],
    joinDate: new Date("2024-03-10"),
    lastActive: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: "user-5",
    username: "ChartWizard",
    totalPoints: 11890,
    rank: 5,
    achievements: [],
    weeklyGain: 290,
    monthlyGain: 1650,
    specialBadges: ["TA Master"],
    joinDate: new Date("2024-02-14"),
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

const mockChallenges: ChallengeEvent[] = [
  {
    id: "challenge-1",
    title: "7-Day Learning Streak",
    description: "Complete at least one educational module every day for 7 consecutive days",
    category: "Learning",
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    participants: 1247,
    maxParticipants: 2000,
    rewards: { first: 1000, second: 500, third: 250, participation: 50 },
    isActive: true
  },
  {
    id: "challenge-2",
    title: "Market Analysis Competition",
    description: "Submit your best Bitcoin market analysis for community voting",
    category: "Analysis",
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    participants: 324,
    maxParticipants: 500,
    rewards: { first: 2000, second: 1000, third: 500, participation: 100 },
    isActive: true
  },
  {
    id: "challenge-3",
    title: "Community Helper",
    description: "Answer 20 questions in the community forum with helpful responses",
    category: "Community",
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    participants: 567,
    maxParticipants: 1000,
    rewards: { first: 750, second: 400, third: 200, participation: 75 },
    isActive: true
  }
];

const rarityColors = {
  common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  legendary: "bg-gold-500/20 text-yellow-300 border-yellow-500/30"
};

export default function AchievementLeaderboard() {
  const [selectedTab, setSelectedTab] = useState("leaderboard");
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all-time">("weekly");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffInDays);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Trophy className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Achievements & Leaderboard
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compete with the community, unlock achievements, and climb the leaderboard through learning and engagement.
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-dark-card">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          {/* Timeframe Filter */}
          <div className="flex justify-center gap-2">
            {[
              { key: "weekly", label: "This Week" },
              { key: "monthly", label: "This Month" }, 
              { key: "all-time", label: "All Time" }
            ].map((period) => (
              <Button
                key={period.key}
                variant={timeframe === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period.key as any)}
                className={timeframe === period.key 
                  ? "bg-bitcoin-orange text-black" 
                  : "border-cyber-cyan/30"
                }
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {mockLeaderboard.slice(0, 3).map((user, index) => (
              <Card 
                key={user.id} 
                className={`bg-gradient-to-br ${
                  index === 0 
                    ? 'from-yellow-500/20 to-bitcoin-orange/20 border-yellow-500/30' 
                    : index === 1
                      ? 'from-gray-400/20 to-gray-600/20 border-gray-400/30'
                      : 'from-amber-600/20 to-amber-800/20 border-amber-600/30'
                } ${index === 1 ? 'md:order-first' : index === 0 ? 'md:order-2' : 'md:order-3'}`}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarFallback className="text-lg">{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg">{user.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.totalPoints.toLocaleString()} points
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {user.specialBadges.slice(0, 2).map((badge) => (
                      <Badge key={badge} variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-bitcoin-orange" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>
                Rankings based on learning progress, community engagement, and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboard.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.username}</span>
                        {user.specialBadges.slice(0, 1).map((badge) => (
                          <Badge key={badge} className="bg-bitcoin-orange/20 text-bitcoin-orange text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last active {formatTimeAgo(user.lastActive)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-bitcoin-orange">
                        {user.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-400">
                        +{timeframe === "weekly" ? user.weeklyGain : user.monthlyGain} this {timeframe.replace("-time", "")}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="border-cyber-cyan/30">
                      <Users className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "First Steps",
                description: "Complete your first Bitcoin Academy module",
                icon: "🎓",
                category: "learning",
                points: 100,
                rarity: "common" as const,
                unlocked: true
              },
              {
                title: "Chart Reader",
                description: "Analyze 10 Bitcoin price charts",
                icon: "📊", 
                category: "trading",
                points: 250,
                rarity: "rare" as const,
                unlocked: true
              },
              {
                title: "Community Helper",
                description: "Help 25 community members with questions",
                icon: "🤝",
                category: "community", 
                points: 500,
                rarity: "epic" as const,
                unlocked: false
              },
              {
                title: "Diamond Hands",
                description: "Track portfolio for 100 consecutive days",
                icon: "💎",
                category: "milestone",
                points: 1000,
                rarity: "legendary" as const,
                unlocked: false
              },
              {
                title: "Master Trader",
                description: "Complete advanced trading simulation with 80%+ success",
                icon: "⚡",
                category: "trading",
                points: 750,
                rarity: "epic" as const,
                unlocked: false
              },
              {
                title: "Bitcoin Scholar",
                description: "Complete all 6 Bitcoin Academy modules",
                icon: "🧠",
                category: "learning",
                points: 600,
                rarity: "rare" as const,
                unlocked: false
              }
            ].map((achievement, index) => (
              <Card 
                key={index} 
                className={`bg-dark-card border-cyber-cyan/20 ${
                  achievement.unlocked 
                    ? 'hover:border-bitcoin-orange/40' 
                    : 'opacity-60'
                } transition-all duration-300`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{achievement.icon}</div>
                    <Badge className={rarityColors[achievement.rarity]}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className={`font-bold ${achievement.unlocked ? 'text-bitcoin-orange' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-bitcoin-orange" />
                      <span className="text-sm font-medium">{achievement.points} pts</span>
                    </div>
                    {achievement.unlocked ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        Unlocked
                      </Badge>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        In Progress
                      </div>
                    )}
                  </div>
                  
                  {!achievement.unlocked && (
                    <Progress value={Math.random() * 80 + 10} className="h-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Participants</div>
                      <div className="font-bold text-cyber-cyan">
                        {challenge.participants.toLocaleString()} / {challenge.maxParticipants.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Time Remaining</div>
                      <div className="font-bold text-bitcoin-orange">
                        {getDaysRemaining(challenge.endDate)} days
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(challenge.participants / challenge.maxParticipants) * 100} 
                    className="h-2" 
                  />
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Rewards</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">🥇 1st Place:</span>
                        <span className="font-bold text-yellow-400">{challenge.rewards.first} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">🥈 2nd Place:</span>
                        <span className="font-bold text-gray-300">{challenge.rewards.second} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">🥉 3rd Place:</span>
                        <span className="font-bold text-amber-600">{challenge.rewards.third} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participation:</span>
                        <span className="font-bold text-green-400">{challenge.rewards.participation} pts</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black">
                    <Target className="h-4 w-4 mr-2" />
                    Join Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Star, 
  Award,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  Brain,
  Lightbulb,
  Shield
} from "lucide-react";
import { 
  LazyAdvancedAcademyWrapper,
  LazyPersonalizedInsightsWrapper,
  LazyMarketSimulatorWrapper 
} from "@/components/lazy-components";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: number;
  estimatedTime: string;
  completion: number;
  prerequisites?: string[];
  icon: any;
}

const learningPaths: LearningPath[] = [
  {
    id: "fundamentals",
    title: "Bitcoin Fundamentals",
    description: "Start your Bitcoin journey with essential concepts, history, and basic operations",
    level: "beginner",
    modules: 3,
    estimatedTime: "2-3 hours",
    completion: 100,
    icon: BookOpen
  },
  {
    id: "technical",
    title: "Technical Analysis",
    description: "Learn to read charts, understand market indicators, and make informed decisions",
    level: "intermediate", 
    modules: 2,
    estimatedTime: "3-4 hours",
    completion: 60,
    prerequisites: ["Bitcoin Fundamentals"],
    icon: TrendingUp
  },
  {
    id: "advanced",
    title: "Advanced Bitcoin",
    description: "Deep dive into Lightning Network, smart contracts, and advanced security",
    level: "advanced",
    modules: 1,
    estimatedTime: "2-3 hours", 
    completion: 0,
    prerequisites: ["Bitcoin Fundamentals", "Technical Analysis"],
    icon: Brain
  }
];

const quickStartModules = [
  {
    title: "What is Bitcoin?",
    description: "Understanding digital money and blockchain basics",
    duration: "15 min",
    difficulty: "Beginner",
    icon: Lightbulb,
    completed: true
  },
  {
    title: "Bitcoin Security",
    description: "Protecting your Bitcoin with wallets and best practices",
    duration: "20 min", 
    difficulty: "Beginner",
    icon: Shield,
    completed: true
  },
  {
    title: "Reading Price Charts",
    description: "Basic technical analysis and market interpretation", 
    duration: "25 min",
    difficulty: "Intermediate",
    icon: TrendingUp,
    completed: false
  },
  {
    title: "Trading Psychology",
    description: "Managing emotions and making rational decisions",
    duration: "18 min",
    difficulty: "Intermediate", 
    icon: Brain,
    completed: false
  }
];

export default function LearnPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const totalCompletion = learningPaths.reduce((sum, path) => sum + path.completion, 0) / learningPaths.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <BookOpen className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyber-cyan rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Bitcoin Education Hub
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your beacon for unbiased Bitcoin learning. Master Bitcoin fundamentals, trading strategies, and advanced concepts through interactive modules.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-cyber-cyan/10 border-bitcoin-orange/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-bitcoin-orange">{totalCompletion.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyber-cyan">{learningPaths.filter(p => p.completion > 0).length}</div>
              <div className="text-sm text-muted-foreground">Paths Started</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{learningPaths.filter(p => p.completion === 100).length}</div>
              <div className="text-sm text-muted-foreground">Paths Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">47</div>
              <div className="text-sm text-muted-foreground">Achievements Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="paths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card">
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="academy">Bitcoin Academy</TabsTrigger>
          <TabsTrigger value="simulator">Trading Simulator</TabsTrigger>
          <TabsTrigger value="insights">Personal Insights</TabsTrigger>
        </TabsList>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          {/* Quick Start Section */}
          <Card className="bg-dark-card border-cyber-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-bitcoin-orange" />
                Quick Start Modules
              </CardTitle>
              <CardDescription>
                Jump into essential Bitcoin concepts with bite-sized lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickStartModules.map((module, index) => {
                  const Icon = module.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-500/20' : 'bg-bitcoin-orange/20'}`}>
                          {module.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          ) : (
                            <Icon className="h-6 w-6 text-bitcoin-orange" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{module.title}</span>
                          {module.completed && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {module.description}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {module.duration}
                          </span>
                          <span className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={module.completed ? "outline" : "default"}
                        className={module.completed ? "border-cyber-cyan/30" : "bg-bitcoin-orange text-black hover:bg-bitcoin-orange/80"}
                      >
                        {module.completed ? "Review" : "Start"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Structured Learning Paths</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <Card 
                    key={path.id} 
                    className="bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPath(path.id)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Icon className="h-8 w-8 text-bitcoin-orange" />
                        <Badge className={getLevelColor(path.level)}>
                          {path.level}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-lg mb-2">{path.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {path.description}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{path.completion}%</span>
                        </div>
                        <Progress value={path.completion} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {path.modules} modules
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {path.estimatedTime}
                        </div>
                      </div>
                      
                      {path.prerequisites && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Prerequisites:</strong> {path.prerequisites.join(', ')}
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black"
                      >
                        {path.completion > 0 ? 'Continue Learning' : 'Start Path'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Bitcoin Academy Tab */}
        <TabsContent value="academy" className="space-y-6">
          <LazyAdvancedAcademyWrapper />
        </TabsContent>

        {/* Trading Simulator Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <LazyMarketSimulatorWrapper />
        </TabsContent>

        {/* Personal Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <LazyPersonalizedInsightsWrapper />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Brain,
  Target,
  Users,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
  completed: boolean;
  category: string;
  prerequisites?: string[];
  outcomes: string[];
}

const learningModules: LearningModule[] = [
  {
    id: "bitcoin-basics",
    title: "Bitcoin Fundamentals",
    description: "Master the core concepts of Bitcoin, including blockchain technology, digital scarcity, and peer-to-peer transactions.",
    difficulty: "beginner",
    duration: "45 min",
    progress: 100,
    completed: true,
    category: "Foundation",
    outcomes: [
      "Understand Bitcoin's purpose and creation story",
      "Explain blockchain technology in simple terms",
      "Recognize Bitcoin's unique properties"
    ]
  },
  {
    id: "sound-money",
    title: "Sound Money Principles",
    description: "Explore the economic principles that make Bitcoin superior money, including scarcity, durability, and store of value properties.",
    difficulty: "intermediate",
    duration: "60 min",
    progress: 75,
    completed: false,
    category: "Economics",
    prerequisites: ["bitcoin-basics"],
    outcomes: [
      "Compare Bitcoin to traditional monetary systems",
      "Understand inflation and purchasing power",
      "Analyze Bitcoin's monetary policy"
    ]
  },
  {
    id: "technical-analysis",
    title: "Bitcoin Technical Analysis",
    description: "Learn to read Bitcoin charts, identify patterns, and understand market indicators for informed decision-making.",
    difficulty: "advanced",
    duration: "90 min",
    progress: 30,
    completed: false,
    category: "Trading",
    prerequisites: ["bitcoin-basics", "sound-money"],
    outcomes: [
      "Read and interpret Bitcoin price charts",
      "Identify key support and resistance levels",
      "Use technical indicators effectively"
    ]
  },
  {
    id: "security-best-practices",
    title: "Bitcoin Security Mastery",
    description: "Master wallet security, private key management, and advanced protection strategies for your Bitcoin holdings.",
    difficulty: "intermediate",
    duration: "75 min",
    progress: 0,
    completed: false,
    category: "Security",
    prerequisites: ["bitcoin-basics"],
    outcomes: [
      "Secure Bitcoin wallets properly",
      "Understand multi-signature setups",
      "Implement cold storage solutions"
    ]
  },
  {
    id: "lightning-network",
    title: "Lightning Network Deep Dive",
    description: "Explore Bitcoin's Layer 2 scaling solution, including payment channels, routing, and instant transactions.",
    difficulty: "advanced",
    duration: "80 min",
    progress: 0,
    completed: false,
    category: "Technology",
    prerequisites: ["bitcoin-basics", "technical-analysis"],
    outcomes: [
      "Understand Lightning Network architecture",
      "Set up and use Lightning wallets",
      "Explain Bitcoin's scaling roadmap"
    ]
  },
  {
    id: "mining-economics",
    title: "Bitcoin Mining & Network Security",
    description: "Understand how Bitcoin mining works, energy economics, and the role of miners in securing the network.",
    difficulty: "intermediate",
    duration: "65 min",
    progress: 0,
    completed: false,
    category: "Technology",
    prerequisites: ["bitcoin-basics"],
    outcomes: [
      "Explain Bitcoin's proof-of-work consensus",
      "Understand mining difficulty adjustments",
      "Analyze mining profitability factors"
    ]
  }
];

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-300 border-green-500/30",
  intermediate: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  advanced: "bg-red-500/20 text-red-300 border-red-500/30"
};

const categoryIcons = {
  Foundation: BookOpen,
  Economics: TrendingUp,
  Trading: Target,
  Security: Shield,
  Technology: Zap
};

export default function AdvancedBitcoinAcademy() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userProgress, setUserProgress] = useState({
    totalModules: learningModules.length,
    completedModules: learningModules.filter(m => m.completed).length,
    totalHours: 0,
    currentStreak: 7
  });

  const filteredModules = selectedCategory === "all" 
    ? learningModules 
    : learningModules.filter(module => module.category === selectedCategory);

  const categories = ["all", ...Array.from(new Set(learningModules.map(m => m.category)))];

  const overallProgress = Math.round((userProgress.completedModules / userProgress.totalModules) * 100);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Brain className="h-12 w-12 text-bitcoin-orange" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-bitcoin-orange rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
            Bitcoin Academy
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master Bitcoin through structured learning paths designed by experts. 
          From fundamentals to advanced concepts, build your Bitcoin knowledge systematically.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-dark-card border-cyber-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-bitcoin-orange" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-bitcoin-orange">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-cyber-cyan">{userProgress.completedModules}</div>
              <div className="text-sm text-muted-foreground">Modules Completed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-400">{userProgress.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">12h</div>
              <div className="text-sm text-muted-foreground">Total Study Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category 
              ? "bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black" 
              : "border-cyber-cyan/30 hover:border-cyber-cyan/60"
            }
          >
            {category === "all" ? "All Modules" : category}
          </Button>
        ))}
      </div>

      {/* Learning Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const CategoryIcon = categoryIcons[module.category as keyof typeof categoryIcons] || BookOpen;
          const isAvailable = !module.prerequisites || module.prerequisites.every(prereq => 
            learningModules.find(m => m.id === prereq)?.completed
          );

          return (
            <Card 
              key={module.id} 
              className={`bg-dark-card border-cyber-cyan/20 hover:border-bitcoin-orange/40 transition-all duration-300 group ${
                !isAvailable ? 'opacity-60' : 'hover:shadow-lg hover:shadow-bitcoin-orange/10'
              }`}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <CategoryIcon className="h-6 w-6 text-bitcoin-orange" />
                  <Badge className={difficultyColors[module.difficulty]}>
                    {module.difficulty}
                  </Badge>
                </div>
                
                <div>
                  <CardTitle className="text-lg group-hover:text-bitcoin-orange transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    {module.description}
                  </CardDescription>
                </div>

                {module.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.duration}
                  </div>
                  {module.completed && (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </div>
                  )}
                </div>

                {module.prerequisites && module.prerequisites.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Prerequisites:</div>
                    <div className="flex flex-wrap gap-1">
                      {module.prerequisites.map((prereq) => {
                        const prereqModule = learningModules.find(m => m.id === prereq);
                        const isCompleted = prereqModule?.completed;
                        return (
                          <Badge 
                            key={prereq} 
                            variant="outline" 
                            className={`text-xs ${isCompleted 
                              ? 'border-green-500/30 text-green-400' 
                              : 'border-red-500/30 text-red-400'
                            }`}
                          >
                            {prereqModule?.title || prereq}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Learning Outcomes:</div>
                  <ul className="text-xs space-y-1">
                    {module.outcomes.slice(0, 2).map((outcome, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1 w-1 bg-bitcoin-orange rounded-full mt-2 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                    {module.outcomes.length > 2 && (
                      <li className="text-muted-foreground">
                        +{module.outcomes.length - 2} more outcomes
                      </li>
                    )}
                  </ul>
                </div>

                <Button 
                  className={`w-full ${
                    module.completed 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : isAvailable
                        ? 'bg-bitcoin-orange hover:bg-bitcoin-orange/80 text-black'
                        : 'bg-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {module.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review Module
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {module.progress > 0 ? 'Continue Learning' : 'Start Module'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Learning Path Recommendations */}
      <Card className="bg-gradient-to-r from-bitcoin-orange/10 to-cyber-cyan/10 border-bitcoin-orange/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-bitcoin-orange" />
            Recommended Learning Path
          </CardTitle>
          <CardDescription>
            Follow this optimized sequence for maximum learning efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["bitcoin-basics", "sound-money", "security-best-practices", "technical-analysis", "lightning-network"].map((moduleId, index) => {
              const module = learningModules.find(m => m.id === moduleId);
              if (!module) return null;

              return (
                <div key={moduleId} className="flex items-center gap-3 p-3 rounded-lg bg-dark-card/50">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    module.completed 
                      ? 'bg-green-500 text-white' 
                      : index === 0 
                        ? 'bg-bitcoin-orange text-black'
                        : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{module.title}</div>
                    <div className="text-sm text-muted-foreground">{module.duration}</div>
                  </div>
                  <Badge className={difficultyColors[module.difficulty]}>
                    {module.difficulty}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
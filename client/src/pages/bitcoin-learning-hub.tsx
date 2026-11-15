import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  GraduationCap, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap,
  Target,
  Award,
  Clock,
  ChevronRight,
  ExternalLink,
  Download,
  PlayCircle,
  Youtube,
  Calendar,
  Eye
} from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';

interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  progress?: number;
  category: 'fundamentals' | 'technical' | 'economics' | 'security';
}

const courses: Course[] = [
  {
    id: 'bitcoin-basics',
    title: 'Bitcoin Fundamentals',
    description: 'Learn the core concepts of Bitcoin, blockchain, and digital scarcity',
    icon: <Shield className="h-6 w-6" />,
    difficulty: 'Beginner',
    duration: '2 hours',
    lessons: 8,
    progress: 0,
    category: 'fundamentals'
  },
  {
    id: 'sound-money',
    title: 'The History of Money',
    description: 'Understanding how money evolved and why Bitcoin represents the next step',
    icon: <BookOpen className="h-6 w-6" />,
    difficulty: 'Beginner',
    duration: '1.5 hours',
    lessons: 6,
    progress: 0,
    category: 'economics'
  },
  {
    id: 'mining-consensus',
    title: 'Mining & Consensus',
    description: 'Deep dive into how Bitcoin achieves consensus and network security',
    icon: <Zap className="h-6 w-6" />,
    difficulty: 'Intermediate',
    duration: '3 hours',
    lessons: 12,
    progress: 0,
    category: 'technical'
  },
  {
    id: 'self-custody',
    title: 'Self-Custody & Security',
    description: 'Master the art of securing your Bitcoin with best practices',
    icon: <Shield className="h-6 w-6" />,
    difficulty: 'Intermediate',
    duration: '2.5 hours',
    lessons: 10,
    progress: 0,
    category: 'security'
  },
  {
    id: 'austrian-economics',
    title: 'Austrian Economics & Bitcoin',
    description: 'Explore the economic principles that make Bitcoin revolutionary',
    icon: <TrendingUp className="h-6 w-6" />,
    difficulty: 'Advanced',
    duration: '4 hours',
    lessons: 16,
    progress: 0,
    category: 'economics'
  },
  {
    id: 'lightning-network',
    title: 'Lightning Network',
    description: 'Understanding Bitcoin\'s layer 2 scaling solution',
    icon: <Zap className="h-6 w-6" />,
    difficulty: 'Advanced',
    duration: '3.5 hours',
    lessons: 14,
    progress: 0,
    category: 'technical'
  }
];

const resources = [
  {
    title: 'The Bitcoin Standard',
    author: 'Saifedean Ammous',
    type: 'Book',
    description: 'The definitive guide to understanding Bitcoin as sound money',
    link: '#'
  },
  {
    title: 'Inventing Bitcoin',
    author: 'Yan Pritzker',
    type: 'Book',
    description: 'A clear, accessible explanation of Bitcoin\'s technology',
    link: '#'
  },
  {
    title: 'What is Money? Show',
    author: 'Robert Breedlove',
    type: 'Podcast',
    description: 'Deep philosophical discussions on money and Bitcoin',
    link: '#'
  },
  {
    title: 'Bitcoin Whitepaper',
    author: 'Satoshi Nakamoto',
    type: 'Paper',
    description: 'The original 9-page document that started it all',
    link: '#'
  }
];

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  viewCount?: string;
  duration?: string;
}

export default function BitcoinLearningHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Fetch recent YouTube videos from My Bitcoin Bytes channel
  const { data: youtubeVideos, isLoading: videosLoading } = useQuery<YouTubeVideo[]>({
    queryKey: ['/api/youtube/recent-videos'],
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fundamentals': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'technical': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'economics': return 'bg-bitcoin/20 text-bitcoin border-bitcoin/30';
      case 'security': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <ParticleBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-bitcoin via-white to-electric bg-clip-text text-transparent mb-6">
                Bitcoin Learning Hub
              </h1>
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-r from-bitcoin to-electric opacity-30 animate-pulse epic-float"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r from-electric to-bitcoin opacity-20 animate-pulse epic-float" style={{ animationDelay: '1s' }}></div>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Master Bitcoin from first principles. Learn about sound money, decentralization, 
              and the future of finance through our comprehensive educational courses.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-bitcoin" />
                <span>20+ Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-electric" />
                <span>Self-Paced Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-400" />
                <span>Progress Tracking</span>
              </div>
            </div>
          </section>

          {/* Course Filters */}
          <section className="mb-12">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-center">Find Your Learning Path</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'fundamentals', 'technical', 'economics', 'security'].map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={`capitalize ${selectedCategory === category ? 'bg-bitcoin text-black' : 'border-gray-700 hover:border-bitcoin'}`}
                      >
                        {category === 'all' ? 'All Categories' : category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={selectedDifficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`${selectedDifficulty === difficulty ? 'bg-electric text-black' : 'border-gray-700 hover:border-electric'}`}
                      >
                        {difficulty === 'all' ? 'All Levels' : difficulty}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Courses Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-bitcoin to-electric bg-clip-text text-transparent">
                Educational Courses
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="bg-gray-900/80 backdrop-blur border-gray-800 hover:border-bitcoin/50 transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-full bg-bitcoin/20 text-bitcoin group-hover:bg-bitcoin group-hover:text-black transition-all duration-300">
                        {course.icon}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white group-hover:text-bitcoin transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons} lessons
                      </span>
                    </div>
                    
                    {course.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-bitcoin">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    
                    <Button className="w-full bg-gradient-to-r from-bitcoin to-electric text-black font-semibold hover:from-bitcoin/90 hover:to-electric/90">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* My Bitcoin Bytes YouTube Videos */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-red-500 to-bitcoin bg-clip-text text-transparent">
                Latest Bitcoin Book Podcasts
              </span>
            </h2>
            <div className="text-center mb-8">
              <p className="text-gray-300 mb-4">
                Deep dives into Bitcoin books with practical insights for your learning journey
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://www.youtube.com/@MyBitcoinBytes', '_blank')}
                className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <Youtube className="h-4 w-4 mr-2" />
                Subscribe to My Bitcoin Bytes
              </Button>
            </div>
            
            {videosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="bg-gray-900/80 backdrop-blur border-gray-800">
                    <CardHeader className="p-0">
                      <div className="w-full h-48 bg-gray-800 animate-pulse rounded-t-lg"></div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-800 animate-pulse rounded mb-2"></div>
                      <div className="h-3 bg-gray-800 animate-pulse rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-800 animate-pulse rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : youtubeVideos && youtubeVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeVideos.map((video) => (
                  <Card key={video.id} className="bg-gray-900/80 backdrop-blur border-gray-800 hover:border-red-500/50 transition-all duration-300 group overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PlayCircle className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-white group-hover:text-red-400 transition-colors mb-2 text-sm leading-tight line-clamp-2">
                        {video.title}
                      </CardTitle>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                        </div>
                        {video.viewCount && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{video.viewCount} views</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                        {video.description}
                      </p>
                      <Button 
                        size="sm"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                        className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Watch Episode
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/80 backdrop-blur border-gray-800 text-center p-8">
                <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No recent videos available</p>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://www.youtube.com/@MyBitcoinBytes', '_blank')}
                  className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Visit Channel
                </Button>
              </Card>
            )}
          </section>

          {/* Learning Resources */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-electric to-bitcoin bg-clip-text text-transparent">
                Recommended Resources
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="bg-gray-900/80 backdrop-blur border-gray-800 hover:border-electric/50 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white group-hover:text-electric transition-colors mb-1">
                          {resource.title}
                        </CardTitle>
                        <p className="text-sm text-gray-400">by {resource.author}</p>
                      </div>
                      <Badge className="bg-electric/20 text-electric border-electric/30">
                        {resource.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full border-gray-700 hover:border-electric text-electric hover:bg-electric hover:text-black">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Resource
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Learning Path Guidance */}
          <section>
            <Card className="bg-gradient-to-r from-bitcoin/10 via-electric/10 to-bitcoin/10 border-bitcoin/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white mb-2">
                  🎯 Your Bitcoin Learning Journey
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Follow this recommended path to build comprehensive Bitcoin knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-green-500/30">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-400 font-bold text-xl">1</span>
                    </div>
                    <h3 className="font-semibold text-green-400 mb-2">Foundation</h3>
                    <p className="text-sm text-gray-400">Start with Bitcoin Fundamentals and History of Money</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-yellow-500/30">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-yellow-400 font-bold text-xl">2</span>
                    </div>
                    <h3 className="font-semibold text-yellow-400 mb-2">Practical Skills</h3>
                    <p className="text-sm text-gray-400">Learn Self-Custody & Security, explore Mining concepts</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-red-500/30">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-red-400 font-bold text-xl">3</span>
                    </div>
                    <h3 className="font-semibold text-red-400 mb-2">Advanced Topics</h3>
                    <p className="text-sm text-gray-400">Dive into Austrian Economics and Lightning Network</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
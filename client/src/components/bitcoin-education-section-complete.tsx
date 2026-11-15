import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TrendingUp, 
  Globe, 
  Zap, 
  Users, 
  Lock,
  ChevronRight,
  BookOpen,
  Target,
  Heart
} from 'lucide-react';

interface EducationModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const educationModules: EducationModule[] = [
  {
    id: 'sound-money',
    title: 'What is Sound Money?',
    description: 'Understanding the fundamental principles of sound money and why it matters',
    icon: <Shield className="h-6 w-6" />,
    difficulty: 'Beginner',
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Sound Money Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-400">Scarcity</h4>
                <p className="text-gray-300 text-sm">Limited supply that cannot be arbitrarily increased</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-400">Durability</h4>
                <p className="text-gray-300 text-sm">Maintains value and function over time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-purple-400">Divisibility</h4>
                <p className="text-gray-300 text-sm">Can be broken into smaller units for transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-yellow-400">Portability</h4>
                <p className="text-gray-300 text-sm">Easy to transfer and store securely</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h4 className="font-bold text-white mb-3 text-center">Why Sound Money Matters</h4>
          <p className="text-gray-300 mb-4">
            Throughout history, societies with sound money have prospered, while those with debased currencies have declined. 
            Sound money preserves purchasing power, enables long-term planning, and protects individual economic freedom.
          </p>
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
            <p className="text-red-300 text-sm">
              <strong>The Problem:</strong> Fiat currencies lose purchasing power over time due to inflation, 
              transferring wealth from savers to borrowers and governments.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'bitcoin-basics',
    title: 'Bitcoin: Digital Sound Money',
    description: 'How Bitcoin achieves the properties of sound money in the digital age',
    icon: <TrendingUp className="h-6 w-6" />,
    difficulty: 'Beginner',
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 p-6 rounded-lg border border-orange-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Bitcoin's Revolutionary Properties</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Lock className="h-8 w-8 text-orange-400" />
              <div>
                <h4 className="font-semibold text-white">Fixed Supply</h4>
                <p className="text-gray-300 text-sm">Only 21 million Bitcoin will ever exist</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <h4 className="font-semibold text-white">Decentralized</h4>
                <p className="text-gray-300 text-sm">No central authority can control or manipulate it</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Zap className="h-8 w-8 text-yellow-400" />
              <div>
                <h4 className="font-semibold text-white">Programmable</h4>
                <p className="text-gray-300 text-sm">Smart contracts and automated transactions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
          <h4 className="font-bold text-green-400 mb-3">Bitcoin vs Traditional Money</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-white mb-2">Fiat Currency</h5>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Unlimited supply</li>
                <li>• Controlled by central banks</li>
                <li>• Subject to inflation</li>
                <li>• Requires intermediaries</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Bitcoin</h5>
              <ul className="space-y-1 text-sm text-green-300">
                <li>• Fixed 21M supply</li>
                <li>• Decentralized network</li>
                <li>• Deflationary by design</li>
                <li>• Direct peer-to-peer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'economic-freedom',
    title: 'Bitcoin & Economic Freedom',
    description: 'How Bitcoin preserves individual sovereignty and economic rights',
    icon: <Users className="h-6 w-6" />,
    difficulty: 'Intermediate',
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Financial Sovereignty</h3>
          <p className="text-gray-300 mb-4">
            Bitcoin enables true financial sovereignty by removing the need for trusted third parties. 
            You become your own bank, with complete control over your wealth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Self-Custody</h4>
              <p className="text-gray-300 text-sm">Control your private keys, control your Bitcoin</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Censorship Resistance</h4>
              <p className="text-gray-300 text-sm">No one can block your transactions</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Global Access</h4>
              <p className="text-gray-300 text-sm">Available 24/7 worldwide without permission</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-lg">
          <h4 className="font-bold text-yellow-400 mb-3">Real-World Impact</h4>
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">
              <strong>Argentina:</strong> Citizens use Bitcoin to preserve wealth during currency debasement
            </p>
            <p className="text-gray-300 text-sm">
              <strong>El Salvador:</strong> Adopted Bitcoin as legal tender to reduce remittance costs
            </p>
            <p className="text-gray-300 text-sm">
              <strong>Nigeria:</strong> Young people use Bitcoin when local banking fails them
            </p>
          </div>
        </div>
      </div>
    )
  }
];

// Free Bitcoin Learning Resources
const learningResources = [
  {
    title: "The Bitcoin Standard",
    author: "Saifedean Ammous",
    description: "Essential reading on Bitcoin's role as sound money and its economic implications",
    type: "Book",
    difficulty: "Intermediate",
    url: "https://www.amazon.com/Bitcoin-Standard-Decentralized-Alternative-Central/dp/1119473861",
    topics: ["Sound Money", "Economics", "Austrian School"]
  },
  {
    title: "Inventing Bitcoin",
    author: "Yan Pritzker", 
    description: "Technical primer explaining how Bitcoin works under the hood",
    type: "Book",
    difficulty: "Beginner",
    url: "https://www.amazon.com/Inventing-Bitcoin-Technology-Decentralized-Explained/dp/1792326548",
    topics: ["Technology", "Cryptography", "Blockchain"]
  },
  {
    title: "Bitcoin Whitepaper",
    author: "Satoshi Nakamoto",
    description: "The original 9-page paper that started the Bitcoin revolution",
    type: "Paper", 
    difficulty: "Intermediate",
    url: "https://bitcoin.org/bitcoin.pdf",
    topics: ["Original Source", "Technical", "Peer-to-Peer"]
  },
  {
    title: "Mastering Bitcoin",
    author: "Andreas M. Antonopoulos",
    description: "Technical deep-dive into Bitcoin's architecture and programming",
    type: "Book",
    difficulty: "Advanced",
    url: "https://github.com/bitcoinbook/bitcoinbook",
    topics: ["Programming", "Technical", "Development"]
  },
  {
    title: "The Bullish Case for Bitcoin",
    author: "Vijay Boyapati",
    description: "Investment thesis exploring Bitcoin's potential as digital gold",
    type: "Article",
    difficulty: "Beginner",
    url: "https://vijayboyapati.medium.com/the-bullish-case-for-bitcoin-6ecc8bdecc1",
    topics: ["Investment", "Store of Value", "Digital Gold"]
  },
  {
    title: "Bitcoin.org Learn",
    author: "Bitcoin Community",
    description: "Official Bitcoin learning resources covering basics to advanced topics",
    type: "Website",
    difficulty: "All Levels",
    url: "https://bitcoin.org/en/getting-started",
    topics: ["Getting Started", "Security", "Wallets"]
  }
];

// Educational Websites
const educationalSites = [
  {
    name: "River Learn",
    description: "Comprehensive Bitcoin education from River Financial",
    url: "https://river.com/learn/",
    topics: ["Beginner Friendly", "Investment", "Security"]
  },
  {
    name: "21 Lessons",
    description: "What I learned from falling down the Bitcoin rabbit hole", 
    url: "https://21lessons.com/",
    topics: ["Philosophy", "Economics", "Technology"]
  },
  {
    name: "Bitcoin Only",
    description: "Curated resources focusing exclusively on Bitcoin",
    url: "https://bitcoin-only.com/",
    topics: ["Curated Content", "Tools", "Education"]
  },
  {
    name: "Jameson Lopp's Resources",
    description: "Extensive compilation of Bitcoin educational materials",
    url: "https://www.lopp.net/bitcoin-information.html",
    topics: ["Comprehensive", "Technical", "Research"]
  }
];

export default function BitcoinEducationSection() {
  const [selectedModule, setSelectedModule] = useState<string>(educationModules[0].id);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('modules');

  const handleCompleteModule = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const currentModule = educationModules.find(m => m.id === selectedModule);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
          <BookOpen className="h-4 w-4 text-orange-400" />
          <span className="text-orange-400 font-medium">Bitcoin Education</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Why <span className="text-orange-400">Bitcoin</span>?
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Understand Bitcoin's role as sound money and its importance for economic freedom. 
          Learn why Bitcoin matters beyond just price speculation.
        </p>
      </div>
      
      {/* Learning Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 mb-8">
          <TabsTrigger value="modules" className="data-[state=active]:bg-orange-600">
            Interactive Modules
          </TabsTrigger>
          <TabsTrigger value="books" className="data-[state=active]:bg-orange-600">
            Books & Papers
          </TabsTrigger>
          <TabsTrigger value="websites" className="data-[state=active]:bg-orange-600">
            Educational Sites
          </TabsTrigger>
        </TabsList>

        {/* Interactive Learning Modules */}
        <TabsContent value="modules" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Module Navigation */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">Learning Path</h3>
              <div className="space-y-3">
                {educationModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedModule === module.id
                        ? 'bg-orange-500/10 border-orange-500/50 text-white'
                        : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {module.icon}
                      <span className="font-medium">{module.title}</span>
                      {completedModules.has(module.id) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{module.description}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        module.difficulty === 'Beginner' ? 'border-green-500/50 text-green-400' :
                        module.difficulty === 'Intermediate' ? 'border-yellow-500/50 text-yellow-400' :
                        'border-red-500/50 text-red-400'
                      }`}
                    >
                      {module.difficulty}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Module Content */}
            <div className="lg:col-span-3">
              {currentModule && (
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-600/20 rounded-lg">
                          {currentModule.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white">{currentModule.title}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {currentModule.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`${
                          currentModule.difficulty === 'Beginner' ? 'border-green-500/50 text-green-400' :
                          currentModule.difficulty === 'Intermediate' ? 'border-yellow-500/50 text-yellow-400' :
                          'border-red-500/50 text-red-400'
                        }`}
                      >
                        {currentModule.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentModule.content}
                    
                    {!completedModules.has(currentModule.id) && (
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <Button
                          onClick={() => handleCompleteModule(currentModule.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </Button>
                      </div>
                    )}
                    
                    {completedModules.has(currentModule.id) && (
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="flex items-center gap-2 text-green-400">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm font-medium">Module completed!</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Books & Papers */}
        <TabsContent value="books" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningResources.map((resource, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white mb-1">{resource.title}</CardTitle>
                      <p className="text-sm text-gray-400 mb-2">by {resource.author}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mb-2 ${
                          resource.difficulty === 'Beginner' 
                            ? 'border-green-500/50 text-green-400'
                            : resource.difficulty === 'Intermediate'
                            ? 'border-yellow-500/50 text-yellow-400'
                            : resource.difficulty === 'All Levels'
                            ? 'border-blue-500/50 text-blue-400'
                            : 'border-red-500/50 text-red-400'
                        }`}
                      >
                        {resource.difficulty}
                      </Badge>
                    </div>
                    <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/30">
                      {resource.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-sm mb-4">{resource.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 border-gray-600">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    asChild 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Now
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Educational Websites */}
        <TabsContent value="websites" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educationalSites.map((site, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-orange-400" />
                    {site.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{site.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {site.topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 border-gray-600">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    asChild 
                    variant="outline"
                    className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-600 hover:text-white"
                  >
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      Visit Site
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </a>
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
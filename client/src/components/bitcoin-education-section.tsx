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
          <h3 className="text-xl font-bold text-white mb-4 text-center">Sound Money Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-400">Medium of Exchange</h4>
                <p className="text-gray-300 text-sm">Facilitates trade by eliminating the need for barter, making transactions easier</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-400">Unit of Account</h4>
                <p className="text-gray-300 text-sm">Provides a standard measure of value, allowing prices and economic calculations to be consistent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-purple-400">Store of Value</h4>
                <p className="text-gray-300 text-sm">Retains value over time, enabling savings and deferred consumption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-yellow-400">Portability</h4>
                <p className="text-gray-300 text-sm">Easy to carry and transfer, supporting practical use in daily transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-400">Durability</h4>
                <p className="text-gray-300 text-sm">Withstands physical wear or retains integrity, ensuring long-term usability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-red-400">Divisibility</h4>
                <p className="text-gray-300 text-sm">Can be divided into smaller units to accommodate various transaction sizes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-pink-400">Scarcity</h4>
                <p className="text-gray-300 text-sm">Limited supply or controlled issuance to maintain value and prevent inflation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-cyan-400">Acceptability</h4>
                <p className="text-gray-300 text-sm">Widely recognized and trusted by people within the society for transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-indigo-400">Fungibility</h4>
                <p className="text-gray-300 text-sm">Each unit is interchangeable with another of the same value, simplifying trade</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-emerald-400">Stability</h4>
                <p className="text-gray-300 text-sm">Maintains relatively stable value to support economic planning and trust</p>
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
                <h4 className="font-semibold text-orange-400">Fixed Supply: 21 Million</h4>
                <p className="text-gray-300 text-sm">No central authority can create more Bitcoin, ensuring true scarcity</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Globe className="h-8 w-8 text-blue-400" />
              <div>
                <h4 className="font-semibold text-blue-400">Decentralized Network</h4>
                <p className="text-gray-300 text-sm">No single point of failure or control by governments or corporations</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Zap className="h-8 w-8 text-yellow-400" />
              <div>
                <h4 className="font-semibold text-yellow-400">Peer-to-Peer Transactions</h4>
                <p className="text-gray-300 text-sm">Send value directly without intermediaries or permission</p>
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
          <h3 className="text-xl font-bold text-white mb-4">Economic Sovereignty</h3>
          <p className="text-gray-300 mb-4">
            Bitcoin enables true economic sovereignty by giving individuals complete control over their wealth 
            without relying on banks, governments, or third parties.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg text-center">
              <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <h4 className="font-semibold text-red-400 mb-2">Self-Custody</h4>
              <p className="text-gray-300 text-sm">Be your own bank - full control over your assets</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg text-center">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-green-400 mb-2">Censorship Resistance</h4>
              <p className="text-gray-300 text-sm">Transactions cannot be blocked or reversed</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg text-center">
              <Globe className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-400 mb-2">Global Access</h4>
              <p className="text-gray-300 text-sm">Available to anyone with internet access</p>
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
    console.log('Completing module:', moduleId);
    setCompletedModules(prev => new Set([...Array.from(prev), moduleId]));
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

      {/* Education Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Module Navigation */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Learning Path</h3>
          <div className="space-y-3">
            {educationModules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  console.log('Module clicked:', module.id);
                  setSelectedModule(module.id);
                }}
                className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
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

          {/* Progress */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Progress</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {completedModules.size}/{educationModules.length}
            </div>
            <p className="text-xs text-gray-400">modules completed</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ width: `${(completedModules.size / educationModules.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="lg:col-span-3">
          {currentModule && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center items-center gap-3 mb-6">
                  <div className="p-4 bg-gradient-to-r from-orange-600/20 to-purple-600/20 rounded-xl animate-pulse">
                    {currentModule.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-600 animate-pulse mb-4 px-4">
                  {currentModule.title}
                </CardTitle>
                <CardDescription className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 px-4">
                  {currentModule.description}
                </CardDescription>
                <div className="flex justify-center">
                  <Badge 
                    variant="outline" 
                    className={`text-lg px-6 py-2 animate-bounce ${
                      currentModule.difficulty === 'Beginner' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                      currentModule.difficulty === 'Intermediate' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                      'border-red-500/50 text-red-400 bg-red-500/10'
                    }`}
                  >
                    {currentModule.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentModule.content}
                
                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  {!completedModules.has(currentModule.id) && (
                    <Button 
                      onClick={() => handleCompleteModule(currentModule.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Complete
                    </Button>
                  )}
                  
                  {/* Next Module Button */}
                  {(() => {
                    const currentIndex = educationModules.findIndex(m => m.id === selectedModule);
                    const nextModule = educationModules[currentIndex + 1];
                    
                    return nextModule ? (
                      <Button 
                        onClick={() => {
                          console.log('Next module clicked:', nextModule.id);
                          setSelectedModule(nextModule.id);
                        }}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Next: {nextModule.title}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>


    </div>
  );
}
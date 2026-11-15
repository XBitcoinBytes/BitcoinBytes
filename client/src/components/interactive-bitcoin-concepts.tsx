import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, Zap, Shield, TrendingUp, Globe, Users } from 'lucide-react';

interface ConceptData {
  id: string;
  title: string;
  icon: JSX.Element;
  shortDescription: string;
  fullExplanation: string;
  keyPoints: string[];
  practicalExample: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: string;
}

const bitcoinConcepts: ConceptData[] = [
  {
    id: 'sound-money',
    title: 'Sound Money Principles',
    icon: <Shield className="h-6 w-6" />,
    shortDescription: 'Money that maintains its value over time without debasement',
    fullExplanation: 'Sound money is a form of currency that maintains its purchasing power over time and cannot be arbitrarily inflated or debased by governments or central authorities. Bitcoin embodies sound money principles through its fixed supply cap of 21 million coins and decentralized nature.',
    keyPoints: [
      'Fixed supply prevents inflation and debasement',
      'Decentralized control removes single points of failure',
      'Mathematically enforced scarcity creates store of value',
      'Predictable monetary policy builds long-term trust'
    ],
    practicalExample: 'Unlike fiat currencies that can be printed endlessly, Bitcoin\'s supply is capped at 21 million coins. This scarcity, combined with growing demand, makes Bitcoin a hedge against monetary inflation.',
    difficulty: 'Beginner',
    readTime: '3 min'
  },
  {
    id: 'decentralization',
    title: 'Decentralization & Network Effects',
    icon: <Globe className="h-6 w-6" />,
    shortDescription: 'Distributed network removes single points of control and failure',
    fullExplanation: 'Bitcoin operates on a decentralized network of thousands of computers (nodes) worldwide. No single entity controls the network, making it resistant to censorship, seizure, and manipulation.',
    keyPoints: [
      'No central authority or single point of failure',
      'Network becomes stronger as more nodes join',
      'Consensus mechanisms ensure network integrity',
      'Geographic distribution prevents shutdown'
    ],
    practicalExample: 'Even if entire countries ban Bitcoin mining or node operation, the network continues functioning through nodes in other jurisdictions, demonstrating true decentralization.',
    difficulty: 'Intermediate',
    readTime: '4 min'
  },
  {
    id: 'digital-scarcity',
    title: 'Digital Scarcity',
    icon: <TrendingUp className="h-6 w-6" />,
    shortDescription: 'Creating mathematically provable scarcity in the digital realm',
    fullExplanation: 'Before Bitcoin, digital items could be copied infinitely. Bitcoin solved this "double-spending problem" and created true digital scarcity through cryptographic proof and network consensus.',
    keyPoints: [
      'First successful implementation of digital scarcity',
      'Cryptographic proof prevents counterfeiting',
      'Network consensus validates ownership',
      'Scarcity creates economic incentive structures'
    ],
    practicalExample: 'You cannot copy a Bitcoin like you would copy a digital file. Each Bitcoin is cryptographically unique and tracked on the blockchain, making counterfeiting impossible.',
    difficulty: 'Intermediate',
    readTime: '5 min'
  },
  {
    id: 'energy-security',
    title: 'Energy & Security Model',
    icon: <Zap className="h-6 w-6" />,
    shortDescription: 'Converting energy into monetary security through proof-of-work',
    fullExplanation: 'Bitcoin\'s security comes from the energy expenditure required to mine blocks. This energy cost makes attacking the network extremely expensive, creating a robust security model.',
    keyPoints: [
      'Energy expenditure secures the network',
      'Higher energy cost increases attack resistance',
      'Miners compete for rewards and secure transactions',
      'Renewable energy adoption drives sustainability'
    ],
    practicalExample: 'To attack Bitcoin, an adversary would need to spend more energy (and money) than the entire network of honest miners, making attacks economically irrational.',
    difficulty: 'Advanced',
    readTime: '6 min'
  },
  {
    id: 'monetary-sovereignty',
    title: 'Personal Monetary Sovereignty',
    icon: <Users className="h-6 w-6" />,
    shortDescription: 'Self-custody and financial independence from traditional systems',
    fullExplanation: 'Bitcoin enables individuals to achieve monetary sovereignty by allowing direct ownership and control of their wealth without relying on banks, governments, or third parties.',
    keyPoints: [
      'Self-custody eliminates counterparty risk',
      'Private keys provide direct ownership',
      'Borderless and permissionless transactions',
      'Protection from financial censorship'
    ],
    practicalExample: 'With proper Bitcoin self-custody, you can store and transfer value globally without needing bank accounts, government approval, or traditional financial institutions.',
    difficulty: 'Beginner',
    readTime: '4 min'
  },
  {
    id: 'time-preference',
    title: 'Time Preference & Savings',
    icon: <BookOpen className="h-6 w-6" />,
    shortDescription: 'How sound money encourages long-term thinking and capital formation',
    fullExplanation: 'Sound money like Bitcoin encourages low time preference behavior - the willingness to delay gratification for future benefits. This promotes savings, investment, and long-term economic thinking.',
    keyPoints: [
      'Deflationary nature encourages saving over spending',
      'Rewards patience with purchasing power growth',
      'Promotes capital formation and investment',
      'Reduces short-term consumer debt cycles'
    ],
    practicalExample: 'Instead of rushing to spend depreciating fiat currency, Bitcoin holders are incentivized to save and invest for the future, leading to more thoughtful financial decisions.',
    difficulty: 'Intermediate',
    readTime: '5 min'
  }
];

export default function InteractiveBitcoinConcepts() {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcept(conceptId);
    setExpandedCard(expandedCard === conceptId ? null : conceptId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10';
      case 'Intermediate': return 'text-bitcoin bg-bitcoin/10';
      case 'Advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-surface to-dark-bg">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="tech-heading text-3xl md:text-4xl text-bitcoin mb-4">
            🎓 Interactive Bitcoin Concepts
          </h2>
          <p className="cyber-text text-gray-300 text-lg max-w-3xl mx-auto">
            Master the fundamental principles of Bitcoin and sound money through interactive explanations and real-world examples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bitcoinConcepts.map((concept) => (
            <Card 
              key={concept.id} 
              className={`cyberpunk-card cursor-pointer transition-all duration-500 hover:scale-105 ${
                expandedCard === concept.id 
                  ? 'border-bitcoin bg-gradient-to-br from-bitcoin/10 to-electric/5' 
                  : 'border-bitcoin/30 hover:border-electric/50'
              }`}
              onClick={() => handleConceptSelect(concept.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-bitcoin/20 rounded-full">
                      {concept.icon}
                    </div>
                    <div>
                      <CardTitle className="text-bitcoin text-lg">{concept.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(concept.difficulty)}`}>
                          {concept.difficulty}
                        </span>
                        <span className="text-xs text-gray-400">{concept.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-electric transition-transform duration-300 ${
                    expandedCard === concept.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  {concept.shortDescription}
                </p>

                {expandedCard === concept.id && (
                  <div className="space-y-4 border-t border-bitcoin/20 pt-4 animate-in fade-in duration-300">
                    <div>
                      <h4 className="text-electric font-semibold mb-2">Full Explanation</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {concept.fullExplanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-electric font-semibold mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {concept.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start">
                            <span className="text-bitcoin mr-2 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-electric font-semibold mb-2">Practical Example</h4>
                      <div className="bg-dark-bg/50 rounded-lg p-3 border border-bitcoin/20">
                        <p className="text-gray-300 text-sm italic">
                          {concept.practicalExample}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('/learn', '_blank');
                      }}
                      className="w-full bg-gradient-to-r from-bitcoin to-electric text-black font-bold hover:scale-105 transition-all duration-300"
                    >
                      Continue Learning in Hub
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-bitcoin/10 to-electric/10 rounded-lg p-6 border border-bitcoin/30 max-w-4xl mx-auto">
            <h3 className="text-bitcoin font-bold text-xl mb-4">📚 Ready to Dive Deeper?</h3>
            <p className="text-gray-300 mb-6">
              These concepts are just the beginning. Explore our complete Learning Hub with Bitcoin book discussions, 
              podcast episodes, and comprehensive educational resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/learn'}
                className="cyberpunk-btn text-black font-bold hover:scale-105 transition-all duration-300"
              >
                🎓 Visit Learning Hub
              </Button>
              <Button
                onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="border-bitcoin text-bitcoin hover:bg-bitcoin hover:text-black transition-all duration-300"
              >
                📧 Subscribe for Weekly Lessons
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
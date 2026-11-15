import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink, BookOpen, TrendingUp, Activity, Shield, Zap } from "lucide-react";

interface InteractiveTooltipProps {
  title: string;
  content: string;
  detailedExplanation?: string;
  category?: 'price' | 'technical' | 'educational' | 'news' | 'market' | 'network' | 'trading';
  learnMoreUrl?: string;
  children: React.ReactNode;
  className?: string;
}

const categoryIcons = {
  price: TrendingUp,
  technical: Activity,
  educational: BookOpen,
  news: Info,
  market: Shield,
  network: Zap,
  trading: TrendingUp
};

const categoryColors = {
  price: "text-bitcoin border-bitcoin/30 bg-bitcoin/5",
  technical: "text-electric border-electric/30 bg-electric/5",
  educational: "text-green-400 border-green-400/30 bg-green-400/5",
  news: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  market: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  network: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  trading: "text-red-400 border-red-400/30 bg-red-400/5"
};

export default function InteractiveTooltip({ 
  title, 
  content, 
  detailedExplanation,
  category = 'educational',
  learnMoreUrl,
  children,
  className = ""
}: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const IconComponent = categoryIcons[category];
  const colorClass = categoryColors[category];

  return (
    <>
      <div 
        className={`cursor-pointer hover:scale-105 transition-all duration-300 ${className}`}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(true);
          }
        }}
      >
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg border ${colorClass}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
                <div className={`text-sm px-2 py-1 rounded-full border inline-block mt-1 ${colorClass}`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
              </div>
            </div>
            <DialogDescription className="text-gray-300 text-base leading-relaxed">
              {content}
            </DialogDescription>
          </DialogHeader>

          {detailedExplanation && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">Detailed Explanation</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {detailedExplanation}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {learnMoreUrl && (
              <Button
                onClick={() => window.open(learnMoreUrl, '_blank')}
                variant="outline"
                className="border-gray-600 hover:border-bitcoin hover:bg-bitcoin/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-bitcoin hover:bg-bitcoin/80"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink } from "lucide-react";

interface QuickExplainerProps {
  title: string;
  explanation: string;
  learnMoreUrl?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export default function QuickExplainer({ 
  title, 
  explanation, 
  learnMoreUrl,
  children,
  side = "top"
}: QuickExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        side={side}
        className="w-80 bg-gray-900 border-gray-700 text-white p-4"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-bitcoin" />
            <h4 className="font-semibold">{title}</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {explanation}
          </p>
          {learnMoreUrl && (
            <Button
              onClick={() => window.open(learnMoreUrl, '_blank')}
              variant="outline"
              size="sm"
              className="w-full border-gray-600 hover:border-bitcoin hover:bg-bitcoin/10"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Learn More
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
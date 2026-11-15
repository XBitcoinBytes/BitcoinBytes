import { Wifi, WifiOff, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealTimeIndicatorProps {
  isConnected: boolean;
  className?: string;
  showText?: boolean;
}

export const RealTimeIndicator = ({ 
  isConnected, 
  className = "", 
  showText = false 
}: RealTimeIndicatorProps) => {
  return (
    <div className={cn(
      "flex items-center gap-1 transition-all duration-300",
      isConnected ? "text-green-400" : "text-gray-400",
      className
    )}>
      {isConnected ? (
        <>
          <Zap className="w-3 h-3 animate-pulse" />
          {showText && <span className="text-xs font-medium">LIVE</span>}
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          {showText && <span className="text-xs font-medium">CACHED</span>}
        </>
      )}
    </div>
  );
};
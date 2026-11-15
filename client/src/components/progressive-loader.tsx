import { useState, useEffect, ReactNode } from 'react';
import LoadingSkeleton from './loading-skeleton';

interface ProgressiveLoaderProps {
  children: ReactNode;
  skeletonType: 'price-card' | 'news-card' | 'chart' | 'stats' | 'hero';
  isLoading: boolean;
  error?: any;
  showImmediate?: boolean;
  delay?: number;
  count?: number;
}

export default function ProgressiveLoader({ 
  children, 
  skeletonType, 
  isLoading, 
  error, 
  showImmediate = true,
  delay = 0,
  count = 1 
}: ProgressiveLoaderProps) {
  const [showSkeleton, setShowSkeleton] = useState(showImmediate);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  useEffect(() => {
    if (!isLoading && !error) {
      // Smooth transition from skeleton to content
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        setShowContent(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error]);

  // Show skeleton during loading or for immediate feedback
  if ((isLoading && showSkeleton) || (showImmediate && !showContent)) {
    return <LoadingSkeleton type={skeletonType} count={count} />;
  }

  // Show error state with skeleton structure
  if (error) {
    return (
      <div className="opacity-50">
        <LoadingSkeleton type={skeletonType} count={count} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
          <div className="text-sm text-gray-400">Loading data...</div>
        </div>
      </div>
    );
  }

  // Show actual content with smooth transition
  return (
    <div className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
}
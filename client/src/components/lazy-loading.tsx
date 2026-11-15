import React, { Suspense, lazy } from 'react';

// Performance optimization: Lazy loading wrapper component
export const LazyWrapper = ({ 
  children, 
  fallback = <div className="lazy-container animate-shimmer" />,
  className = ""
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`gpu-accelerated ${className}`}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

// Lazy loaded components for better performance
export const LazyHeroSection = lazy(() => import('./hero-section'));
export const LazyLivePrices = lazy(() => import('./live-prices'));
export const LazyAIIntelligenceDashboard = lazy(() => import('./ai-intelligence-dashboard'));
export const LazyMarketStats = lazy(() => import('./market-stats'));
// Note: BitcoinChart component loaded directly in charts section
export const LazyBitcoinEducationSection = lazy(() => import('./bitcoin-education-section'));

// Loading skeleton component
export const ComponentSkeleton = ({ height = "h-48", className = "" }: { height?: string, className?: string }) => (
  <div className={`${height} ${className} bg-gray-800/50 rounded-lg border border-gray-700 animate-shimmer`}>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
    </div>
  </div>
);
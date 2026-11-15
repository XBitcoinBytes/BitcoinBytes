import { lazy, Suspense, useEffect } from 'react';
import LoadingSkeleton from './loading-skeleton';
import { performanceTracker } from '@/utils/mobile-optimization';

// Lazy load heavy components for Phase 2B performance optimization
export const LazyPriceCharts = lazy(() => import('./price-charts'));
export const LazyAIIntelligenceDashboard = lazy(() => import('./ai-intelligence-dashboard'));
export const LazyBitcoinEducationSection = lazy(() => import('./bitcoin-education-section'));
export const LazyEnhancedMarketIndicators = lazy(() => import('./enhanced-market-indicators'));
export const LazyInteractiveBitcoinConcepts = lazy(() => import('./interactive-bitcoin-concepts'));
export const LazyBitcoinEcosystemDashboard = lazy(() => import('./bitcoin-ecosystem-dashboard'));

// Phase 2C/2D: Advanced Content Enhancement Components
export const LazyAdvancedBitcoinAcademy = lazy(() => import('./advanced-bitcoin-academy'));
export const LazyPersonalizedInsightsDashboard = lazy(() => import('./personalized-insights-dashboard'));
export const LazyInteractiveMarketSimulator = lazy(() => import('./interactive-market-simulator'));

// Phase 3: Market Leadership Components
export const LazyCommunityForum = lazy(() => import('./community-forum'));
export const LazyAchievementLeaderboard = lazy(() => import('./achievement-leaderboard'));
export const LazyAdvancedAnalyticsDashboard = lazy(() => import('./advanced-analytics-dashboard'));

// Wrapper components with appropriate fallbacks and performance tracking
export function LazyPriceChartsWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('PriceCharts');
    return () => {
      const loadTime = performanceTracker.endTiming('PriceCharts');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('PriceCharts', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="chart" count={1} />}>
      <LazyPriceCharts />
    </Suspense>
  );
}

export function LazyAIIntelligenceWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={4} />}>
      <LazyAIIntelligenceDashboard />
    </Suspense>
  );
}

export function LazyEducationWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={3} />}>
      <LazyBitcoinEducationSection />
    </Suspense>
  );
}

export function LazyMarketIndicatorsWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={6} />}>
      <LazyEnhancedMarketIndicators />
    </Suspense>
  );
}

export function LazyConceptsWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={4} />}>
      <LazyInteractiveBitcoinConcepts />
    </Suspense>
  );
}

export function LazyEcosystemWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={5} />}>
      <LazyBitcoinEcosystemDashboard />
    </Suspense>
  );
}

// Phase 2C/2D: Advanced Content Enhancement Wrappers
export function LazyAdvancedAcademyWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('AdvancedBitcoinAcademy');
    return () => {
      const loadTime = performanceTracker.endTiming('AdvancedBitcoinAcademy');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('AdvancedBitcoinAcademy', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={6} />}>
      <LazyAdvancedBitcoinAcademy />
    </Suspense>
  );
}

export function LazyPersonalizedInsightsWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('PersonalizedInsightsDashboard');
    return () => {
      const loadTime = performanceTracker.endTiming('PersonalizedInsightsDashboard');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('PersonalizedInsightsDashboard', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={4} />}>
      <LazyPersonalizedInsightsDashboard />
    </Suspense>
  );
}

export function LazyMarketSimulatorWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('InteractiveMarketSimulator');
    return () => {
      const loadTime = performanceTracker.endTiming('InteractiveMarketSimulator');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('InteractiveMarketSimulator', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="chart" count={1} />}>
      <LazyInteractiveMarketSimulator />
    </Suspense>
  );
}

// Phase 3: Market Leadership Wrappers
export function LazyCommunityForumWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('CommunityForum');
    return () => {
      const loadTime = performanceTracker.endTiming('CommunityForum');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('CommunityForum', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={4} />}>
      <LazyCommunityForum />
    </Suspense>
  );
}

export function LazyAchievementLeaderboardWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('AchievementLeaderboard');
    return () => {
      const loadTime = performanceTracker.endTiming('AchievementLeaderboard');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('AchievementLeaderboard', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="stats" count={5} />}>
      <LazyAchievementLeaderboard />
    </Suspense>
  );
}

export function LazyAdvancedAnalyticsWrapper() {
  useEffect(() => {
    performanceTracker.startTiming('AdvancedAnalyticsDashboard');
    return () => {
      const loadTime = performanceTracker.endTiming('AdvancedAnalyticsDashboard');
      if (loadTime > 0) {
        performanceTracker.logComponentLoad('AdvancedAnalyticsDashboard', loadTime);
      }
    };
  }, []);

  return (
    <Suspense fallback={<LoadingSkeleton type="chart" count={2} />}>
      <LazyAdvancedAnalyticsDashboard />
    </Suspense>
  );
}
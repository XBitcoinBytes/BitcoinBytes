import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from './lib/queryClient';
import { ErrorBoundary } from '@/components/error-boundary';
import { Suspense, lazy } from 'react';
import React from 'react';

// Eagerly-loaded
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';

// Lazily-loaded secondary pages
const Methodology = lazy(() => import('@/pages/methodology'));
const Fees = lazy(() => import('@/pages/fees'));
const Beginners = lazy(() => import('@/pages/beginners'));
const Learn = lazy(() => import('@/pages/learn'));
const Legal = lazy(() => import('@/pages/legal'));
const DataStatus = lazy(() => import('@/pages/data-status'));

// Archived — accessible but removed from navigation
const Prices = lazy(() => import('@/pages/prices'));

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-[#f7931a]/40 border-t-[#f7931a] rounded-full animate-spin"
        role="status"
        aria-label="Loading page"
      />
    </div>
  );
}

/** Factory that returns a ComponentType satisfying ErrorBoundary's fallback prop */
function makeRouteFallback(routeName: string): React.ComponentType<{ error: Error; resetError: () => void }> {
  function RouteFallback() {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-[#f7931a] text-4xl mb-4" aria-hidden="true">⚠</div>
          <h2 className="text-white text-xl font-semibold mb-2">Page error</h2>
          <p className="text-white/50 text-sm mb-6">
            The {routeName} page encountered an error. This section is isolated —
            the rest of the app is unaffected.
          </p>
          <a
            href="/"
            className="text-[#f7931a] hover:text-[#f7931a]/80 underline text-sm"
          >
            Return to comparison tool
          </a>
        </div>
      </div>
    );
  }
  return RouteFallback;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/">
        <ErrorBoundary fallback={makeRouteFallback('home')}>
          <Home />
        </ErrorBoundary>
      </Route>

      <Route path="/methodology">
        <ErrorBoundary fallback={makeRouteFallback('methodology')}>
          <Suspense fallback={<PageSkeleton />}>
            <Methodology />
          </Suspense>
        </ErrorBoundary>
      </Route>

      <Route path="/fees">
        <ErrorBoundary fallback={makeRouteFallback('fees')}>
          <Suspense fallback={<PageSkeleton />}>
            <Fees />
          </Suspense>
        </ErrorBoundary>
      </Route>

      <Route path="/beginners">
        <ErrorBoundary fallback={makeRouteFallback('beginners')}>
          <Suspense fallback={<PageSkeleton />}>
            <Beginners />
          </Suspense>
        </ErrorBoundary>
      </Route>

      <Route path="/learn">
        <ErrorBoundary fallback={makeRouteFallback('learn')}>
          <Suspense fallback={<PageSkeleton />}>
            <Learn />
          </Suspense>
        </ErrorBoundary>
      </Route>

      <Route path="/legal">
        <ErrorBoundary fallback={makeRouteFallback('legal')}>
          <Suspense fallback={<PageSkeleton />}>
            <Legal />
          </Suspense>
        </ErrorBoundary>
      </Route>

      <Route path="/data-status">
        <ErrorBoundary fallback={makeRouteFallback('data-status')}>
          <Suspense fallback={<PageSkeleton />}>
            <DataStatus />
          </Suspense>
        </ErrorBoundary>
      </Route>

      {/* Archived — kept for backward-compatible links, removed from navigation */}
      <Route path="/prices">
        <ErrorBoundary fallback={makeRouteFallback('prices')}>
          <Suspense fallback={<PageSkeleton />}>
            <Prices />
          </Suspense>
        </ErrorBoundary>
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppRoutes />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

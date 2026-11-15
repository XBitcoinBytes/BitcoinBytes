import { useEffect, useState } from 'react';
import { performanceCache } from '../lib/performance-cache';

interface PerformanceMetrics {
  cacheStats: any;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  loadTime: number;
  apiLatency: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheStats: {},
    connectionStatus: 'disconnected',
    loadTime: 0,
    apiLatency: 0
  });

  useEffect(() => {
    // Monitor performance metrics
    const startTime = performance.now();
    
    const updateMetrics = () => {
      setMetrics({
        cacheStats: performanceCache.getStats(),
        connectionStatus: navigator.onLine ? 'connected' : 'disconnected',
        loadTime: performance.now() - startTime,
        apiLatency: 0 // This would be updated by API calls
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
      <div>Cache: {metrics.cacheStats.size || 0} items</div>
      <div>Memory: {metrics.cacheStats.memoryUsage || '0 KB'}</div>
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div className={`${metrics.connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
        {metrics.connectionStatus}
      </div>
    </div>
  );
};
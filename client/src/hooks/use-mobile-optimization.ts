import { useEffect, useState } from 'react';
import { getViewportInfo, optimizeForMobile, throttleResize, type ViewportInfo } from '@/utils/mobile-optimization';

export function useMobileOptimization() {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    if (typeof window !== 'undefined') {
      return getViewportInfo();
    }
    return {
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      devicePixelRatio: 1
    };
  });

  useEffect(() => {
    // Initial optimization
    optimizeForMobile();

    // Throttled resize handler for performance
    const handleResize = throttleResize(() => {
      const newViewport = getViewportInfo();
      setViewport(newViewport);
      optimizeForMobile();
    }, 250);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export function useConnectionSpeed() {
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');

  useEffect(() => {
    // Check for Network Information API (experimental)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateConnectionSpeed = () => {
          // Consider 2G/slow-2g as slow, everything else as fast
          const slowConnections = ['slow-2g', '2g'];
          const effectiveType = connection?.effectiveType || 'unknown';
          setConnectionSpeed(
            slowConnections.includes(effectiveType) ? 'slow' : 'fast'
          );
        };

        updateConnectionSpeed();
        connection.addEventListener('change', updateConnectionSpeed);

        return () => {
          connection.removeEventListener('change', updateConnectionSpeed);
        };
      }
    }
  }, []);

  return connectionSpeed;
}
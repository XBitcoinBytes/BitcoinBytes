// Mobile Performance Optimization Utilities for Phase 2B
export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  devicePixelRatio: number;
}

export function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return {
    width,
    height,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    devicePixelRatio: window.devicePixelRatio || 1
  };
}

export function optimizeForMobile() {
  const viewport = getViewportInfo();
  
  // Reduce animations on mobile for better performance
  if (viewport.isMobile) {
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    document.documentElement.style.setProperty('--transition-duration', '0.15s');
  } else {
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    document.documentElement.style.setProperty('--transition-duration', '0.25s');
  }
  
  // Optimize scroll behavior for mobile
  if (viewport.isMobile && 'scrollBehavior' in document.documentElement.style) {
    document.documentElement.style.scrollBehavior = 'auto';
  }
}

export function throttleResize(callback: () => void, delay: number = 250) {
  let timeoutId: number;
  let lastExecTime = 0;
  
  return function () {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      callback();
      lastExecTime = currentTime;
    } else {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback();
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Performance monitoring for Phase 2B
export class PerformanceTracker {
  private metrics: Record<string, number> = {};
  
  startTiming(label: string) {
    this.metrics[`${label}_start`] = performance.now();
  }
  
  endTiming(label: string): number {
    const startTime = this.metrics[`${label}_start`];
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics[`${label}_duration`] = duration;
      return duration;
    }
    return 0;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  logComponentLoad(componentName: string, loadTime: number) {
    console.log(`📊 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    this.metrics[`component_${componentName}`] = loadTime;
  }
}

export const performanceTracker = new PerformanceTracker();
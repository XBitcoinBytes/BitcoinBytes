/**
 * Global Rate Limiter - Coordinates all external API calls across the application
 * Prevents API rate limiting by managing request timing globally
 */
class GlobalRateLimiter {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 2000; // 2 seconds between API calls
  private maxConcurrentRequests = 1; // Only 1 API call at a time
  private activeRequests = 0;

  /**
   * Add an API request to the coordinated queue
   */
  async addRequest<T>(requestFn: () => Promise<T>, priority: 'high' | 'normal' = 'normal'): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest = async () => {
        try {
          await this.waitForSlot();
          this.activeRequests++;
          
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.lastRequestTime = Date.now();
          this.processQueue();
        }
      };

      // High priority requests go to front of queue
      if (priority === 'high') {
        this.requestQueue.unshift(queuedRequest);
      } else {
        this.requestQueue.push(queuedRequest);
      }

      this.processQueue();
    });
  }

  /**
   * Process the request queue respecting rate limits
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    if (this.activeRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.isProcessing = true;

    const nextRequest = this.requestQueue.shift();
    if (nextRequest) {
      // Execute immediately in background
      nextRequest().finally(() => {
        this.isProcessing = false;
        // Continue processing queue
        setTimeout(() => this.processQueue(), 100);
      });
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Wait for available slot respecting timing constraints
   */
  private async waitForSlot(): Promise<void> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Get current rate limiter status
   */
  getStatus() {
    return {
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests,
      isProcessing: this.isProcessing,
      lastRequestTime: this.lastRequestTime,
      minRequestInterval: this.minRequestInterval
    };
  }

  /**
   * Clear the queue (emergency use only)
   */
  clearQueue(): void {
    this.requestQueue = [];
    console.warn('Rate limiter queue cleared');
  }
}

export const globalRateLimiter = new GlobalRateLimiter();
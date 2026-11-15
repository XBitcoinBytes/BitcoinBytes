// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Check if already initialized
  if (typeof window.gtag === 'function') {
    return;
  }

  try {
    // Initialize dataLayer safely
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function without document.write
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    // Add Google Analytics script safely
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onload = () => {
      // Initialize gtag configuration after script loads
      gtag('js', new Date());
      gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href
      });
    };
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Failed to initialize Google Analytics:', error);
  }
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  try {
    window.gtag('config', measurementId, {
      page_path: url
    });
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};
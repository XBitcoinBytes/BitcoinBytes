import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { performanceCache } from '../lib/performance-cache';

interface RealTimePriceData {
  price: number;
  source: string;
  timestamp: Date;
  confidence: number;
}

interface PriceUpdate {
  current: RealTimePriceData | null;
  previous: RealTimePriceData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const useRealTimePrices = () => {
  const [priceData, setPriceData] = useState<PriceUpdate>({
    current: null,
    previous: null,
    isLoading: true,
    error: null,
    lastUpdate: null
  });

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const handlePriceMessage = useCallback((message: any) => {
    if (message.type === 'price-update' && message.data) {
      setPriceData(prev => ({
        current: {
          price: message.data.price,
          source: message.data.source,
          timestamp: new Date(message.data.timestamp),
          confidence: message.data.confidence
        },
        previous: prev.current,
        isLoading: false,
        error: null,
        lastUpdate: new Date()
      }));
    }
  }, []);

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    onConnect: () => {
      console.log('🚀 Connected to real-time price feed');
      setConnectionStatus('connected');
      subscribe('price-updates');
      
      // Get cached price for immediate display
      const cachedPrice = performanceCache.get('latest-price');
      if (cachedPrice) {
        setPriceData(prev => ({
          ...prev,
          current: cachedPrice,
          isLoading: false
        }));
      }
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from price feed');
      setConnectionStatus('disconnected');
    },
    onMessage: handlePriceMessage,
    onError: (error) => {
      console.error('Price feed error:', error);
      setPriceData(prev => ({
        ...prev,
        error: 'Connection error - using cached data',
        isLoading: false
      }));
    }
  });

  // Update connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      unsubscribe('price-updates');
    };
  }, [unsubscribe]);

  return {
    ...priceData,
    connectionStatus,
    isRealTime: isConnected
  };
};
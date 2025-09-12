import { useState, useEffect } from 'react';

export interface StripeShippingRate {
  id: string;
  active: boolean;
  amount: number;
  currency: string;
  displayName: string;
  deliveryEstimate: {
    minimum: {
      unit: string;
      value: number;
    };
    maximum: {
      unit: string;
      value: number;
    };
  } | null;
  type: 'fixed_amount' | 'percentage';
  taxBehavior: 'exclusive' | 'inclusive' | 'unspecified';
  metadata: Record<string, string>;
}

interface UseShippingRatesReturn {
  shippingRates: StripeShippingRate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useShippingRates = (): UseShippingRatesReturn => {
  const [shippingRates, setShippingRates] = useState<StripeShippingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShippingRates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/shipping-rates?active=true');
      
      if (!response.ok) {
        // Try to parse error response, but handle cases where it's not JSON
        let errorMessage = 'Failed to fetch shipping rates';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from shipping rates API');
      }
      
      const data = await response.json();
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response structure from shipping rates API');
      }
      
      if (!Array.isArray(data.shippingRates)) {
        throw new Error('Shipping rates data is not an array');
      }
      
      setShippingRates(data.shippingRates);
      
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch shipping rates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingRates();
  }, []);

  const refetch = async () => {
    await fetchShippingRates();
  };

  return {
    shippingRates,
    isLoading,
    error,
    refetch
  };
};

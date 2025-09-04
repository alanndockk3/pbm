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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shipping rates');
      }
      
      const data = await response.json();
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

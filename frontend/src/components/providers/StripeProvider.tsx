// src/components/providers/StripeProvider.tsx
'use client'

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export const StripeProvider = ({ children, clientSecret }: StripeProviderProps) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#ec4899', // Pink color to match your theme
        colorBackground: '#ffffff',
        colorText: '#881337', // Rose-900
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: '1px solid #fda4af', // Rose-300
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          transition: 'border-color 0.2s ease',
        },
        '.Input:focus': {
          borderColor: '#ec4899', // Pink-500
          boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.2)',
          outline: 'none',
        },
        '.Label': {
          color: '#be185d', // Rose-700
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '4px',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
};
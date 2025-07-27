// components/checkout/CheckoutLayout.tsx
import React from 'react';
import { CheckoutStepper } from './CheckoutStepper';

const CHECKOUT_STEPS = [
  { number: 1, title: 'Shipping', description: 'Address details' },
  { number: 2, title: 'Delivery', description: 'Shipping method' },
  { number: 3, title: 'Payment', description: 'Payment details' },
  { number: 4, title: 'Review', description: 'Confirm order' }
];

interface CheckoutLayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

export const CheckoutLayout = ({ currentStep, children }: CheckoutLayoutProps) => {
  return (
    <div className="container mx-auto px-">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
          Secure Checkout
        </h1>
        <p className="text-rose-600 dark:text-rose-400">
          Complete your order in just a few simple steps
        </p>
      </div>

      {/* Progress Stepper */}
      <CheckoutStepper currentStep={currentStep} steps={CHECKOUT_STEPS} />
      
      {/* Main Content */}
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
};
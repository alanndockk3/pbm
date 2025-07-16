// components/checkout/CheckoutStepper.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStepperProps {
  currentStep: number;
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export const CheckoutStepper = ({ currentStep, steps }: CheckoutStepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
              ${currentStep > step.number 
                ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                : currentStep === step.number
                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg animate-pulse'
                  : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
              }
            `}>
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{step.number}</span>
              )}
            </div>
            
            {/* Step Info */}
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                currentStep >= step.number 
                  ? 'text-rose-900 dark:text-rose-100' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step.description}
              </p>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`hidden sm:block w-16 h-0.5 ml-4 transition-all duration-300 ${
                currentStep > step.number 
                  ? 'bg-green-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden mt-4 text-center">
        <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
          Step {currentStep} of {steps.length}: {steps.find(s => s.number === currentStep)?.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {steps.find(s => s.number === currentStep)?.description}
        </p>
      </div>
    </div>
  );
};
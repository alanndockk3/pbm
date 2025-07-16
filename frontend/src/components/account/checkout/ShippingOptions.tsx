// components/checkout/ShippingOptions.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, Zap } from "lucide-react";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import type { ShippingOption } from '../../../../lib/checkout/types';

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 5-7 business days',
    price: 8.99,
    estimatedDays: '5-7 days'
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivery in 2-3 business days',
    price: 15.99,
    estimatedDays: '2-3 days'
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    price: 29.99,
    estimatedDays: '1 day'
  }
];

export const ShippingOptions = () => {
  const { shippingOption, setShippingOption, setStep, totals } = useCheckoutStore();

  const handleOptionSelect = (option: ShippingOption) => {
    setShippingOption(option);
  };

  const handleContinue = () => {
    if (shippingOption) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const getShippingIcon = (optionId: string) => {
    switch (optionId) {
      case 'standard':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'express':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'overnight':
        return <Zap className="w-5 h-5 text-purple-500" />;
      default:
        return <Truck className="w-5 h-5" />;
    }
  };

  // Show free shipping message if applicable
  const showFreeShipping = totals.subtotal >= 75;

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
          Choose Shipping Method
        </CardTitle>
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          Select your preferred delivery option.
        </p>
        {showFreeShipping && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              🎉 You qualify for free standard shipping!
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {SHIPPING_OPTIONS.map((option) => {
          const isSelected = shippingOption?.id === option.id;
          const finalPrice = showFreeShipping && option.id === 'standard' ? 0 : option.price;
          
          return (
            <div
              key={option.id}
              onClick={() => handleOptionSelect({ ...option, price: finalPrice })}
              className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
                  : 'border-gray-200 hover:border-pink-300 bg-white dark:bg-rose-800/10 dark:border-rose-700'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getShippingIcon(option.id)}
                  <div>
                    <h3 className="font-medium text-rose-900 dark:text-rose-100">
                      {option.name}
                    </h3>
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-rose-900 dark:text-rose-100">
                    {finalPrice === 0 ? (
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    ) : (
                      `$${finalPrice.toFixed(2)}`
                    )}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {option.estimatedDays}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-4 flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            Back to Shipping
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!shippingOption}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
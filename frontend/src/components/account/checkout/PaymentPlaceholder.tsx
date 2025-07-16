// components/checkout/PaymentPlaceholder.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';

export const PaymentPlaceholder = () => {
  const { setStep } = useCheckoutStore();
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
          💳 Payment Information
        </CardTitle>
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          Secure payment processing will be integrated here.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection Placeholder */}
        <div className="space-y-4">
          <h3 className="font-medium text-rose-900 dark:text-rose-100">Payment Method</h3>
          <div className="grid gap-3">
            <div className="border-2 border-pink-500 bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">💳</span>
                  </div>
                  <span className="font-medium text-rose-900 dark:text-rose-100">Credit/Debit Card</span>
                </div>
                <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-rose-700 rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">📱</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">Apple Pay (Coming Soon)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Form Placeholder */}
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-center">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                🔧 Stripe Integration Coming Next
              </h4>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                This will include secure card input fields, validation, and payment processing.
              </p>
            </div>
          </div>

          {/* Mock Card Form */}
          <div className="space-y-3 opacity-50">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Card Number</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                <span className="text-gray-400">•••• •••• •••• ••••</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Expiry</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  <span className="text-gray-400">MM/YY</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">CVC</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  <span className="text-gray-400">•••</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(2)}
            className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            ← Back to Shipping
          </Button>
          <Button
            onClick={() => setStep(4)}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            Continue to Review →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
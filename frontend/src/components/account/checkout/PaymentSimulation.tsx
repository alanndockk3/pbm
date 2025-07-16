// components/checkout/PaymentSimulation.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react';

// Generate random order ID and confirmation number
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `PBM${timestamp}${random}`;
};

const generateConfirmationNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let result = '';
  
  // Generate format: ABC123DEF
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  return result;
};

type PaymentState = 'idle' | 'processing' | 'success' | 'error';

export const PaymentSimulation = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { shippingAddress, shippingOption, totals, items } = useCheckoutStore();
  
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');

  const simulatePayment = async () => {
    setPaymentState('processing');

    // Simulate payment processing time (2-4 seconds)
    const processingTime = Math.random() * 2000 + 2000; // 2-4 seconds
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate success (you could add error simulation here too)
    setPaymentState('success');

    // Generate order details
    const orderId = generateOrderId();
    const confirmationNumber = generateConfirmationNumber();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (shippingOption?.estimatedDays ? parseInt(shippingOption.estimatedDays.split('-')[1]) : 7));

    // Create URL search params with order details
    const searchParams = new URLSearchParams({
      orderId,
      confirmationNumber,
      total: totals.total.toFixed(2),
      subtotal: totals.subtotal.toFixed(2),
      shipping: totals.shipping.toFixed(2),
      tax: totals.tax.toFixed(2),
      itemCount: items.length.toString(),
      customerEmail: user?.email || '',
      customerName: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
      shippingMethod: shippingOption?.name || '',
      estimatedDelivery: estimatedDelivery.toISOString(),
      paymentMethod: selectedMethod,
      // Add shipping address to params
      shippingCity: shippingAddress.city || '',
      shippingState: shippingAddress.state || '',
      shippingZip: shippingAddress.zipCode || '',
    });

    // Short delay to show success state
    setTimeout(() => {
      router.push(`/dashboard/checkout/success?${searchParams.toString()}`);
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Payment Information
        </CardTitle>
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          Complete your order securely
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-rose-900 dark:text-rose-100">
            Payment Method
          </h3>
          
          <div className="grid gap-3">
            {/* Credit Card */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedMethod === 'card'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                  : 'border-rose-200 dark:border-rose-700 hover:border-rose-300'
              }`}
              onClick={() => setSelectedMethod('card')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="font-medium text-rose-900 dark:text-rose-100">
                    Credit or Debit Card
                  </h4>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    Visa, MasterCard, American Express
                  </p>
                </div>
              </div>
            </div>

            {/* Apple Pay */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedMethod === 'apple_pay'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                  : 'border-rose-200 dark:border-rose-700 hover:border-rose-300'
              }`}
              onClick={() => setSelectedMethod('apple_pay')}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-black dark:bg-white rounded text-white dark:text-black flex items-center justify-center text-xs font-bold">
                  
                </div>
                <div>
                  <h4 className="font-medium text-rose-900 dark:text-rose-100">
                    Apple Pay
                  </h4>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    Pay with Touch ID or Face ID
                  </p>
                </div>
              </div>
            </div>

            {/* Google Pay */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedMethod === 'google_pay'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                  : 'border-rose-200 dark:border-rose-700 hover:border-rose-300'
              }`}
              onClick={() => setSelectedMethod('google_pay')}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded text-white flex items-center justify-center text-xs font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-medium text-rose-900 dark:text-rose-100">
                    Google Pay
                  </h4>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    Pay with your Google account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulated Card Details (only show for card method) */}
        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={paymentState === 'processing'}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={paymentState === 'processing'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={paymentState === 'processing'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-rose-200 dark:border-rose-700 pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-rose-600 dark:text-rose-400">Subtotal:</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-600 dark:text-rose-400">Shipping:</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-600 dark:text-rose-400">Tax:</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-rose-200 dark:border-rose-700">
              <span className="text-rose-900 dark:text-rose-100">Total:</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment State Display */}
        {paymentState === 'processing' && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-600" />
            <p className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
              Processing Payment...
            </p>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Please don't close this window
            </p>
          </div>
        )}

        {paymentState === 'success' && (
          <div className="text-center py-6">
            <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
              Payment Successful!
            </p>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Redirecting to confirmation...
            </p>
          </div>
        )}

        {/* Complete Order Button */}
        {paymentState === 'idle' && (
          <Button
            onClick={simulatePayment}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 text-lg font-semibold transition-all duration-300"
          >
            <Lock className="w-5 h-5 mr-2" />
            Complete Order - ${totals.total.toFixed(2)}
          </Button>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-rose-500 dark:text-rose-400">
          <Lock className="w-4 h-4 inline mr-1" />
          Your payment information is encrypted and secure
        </div>
      </CardContent>
    </Card>
  );
};
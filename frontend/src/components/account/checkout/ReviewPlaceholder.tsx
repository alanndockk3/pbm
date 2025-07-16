// components/checkout/ReviewPlaceholder.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';

export const ReviewPlaceholder = () => {
  const { setStep, resetCheckout, shippingAddress, shippingOption, totals, items } = useCheckoutStore();
  const router = useRouter();
  
  const handlePlaceOrder = () => {
    alert(`🎉 Order placed successfully!\n\nOrder Details:\n• ${items.length} items\n• Total: $${totals.total.toFixed(2)}\n• Shipping to: ${shippingAddress.city}, ${shippingAddress.state}\n\nThis is just a simulation - real order processing will be added with Stripe!`);
    resetCheckout();
    router.push('/dashboard');
  };
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
          📋 Review Your Order
        </CardTitle>
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          Please review all details before placing your order.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Order Items */}
        <div>
          <h3 className="font-medium text-rose-900 dark:text-rose-100 mb-3">Order Items</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center py-2 border-b border-rose-100 dark:border-rose-800">
                <div>
                  <span className="text-rose-900 dark:text-rose-100">{item.name}</span>
                  <span className="text-rose-600 dark:text-rose-400 text-sm ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium text-rose-900 dark:text-rose-100">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        <div>
          <h3 className="font-medium text-rose-900 dark:text-rose-100 mb-3">Shipping Information</h3>
          <div className="bg-rose-50 dark:bg-rose-800/20 rounded-lg p-4">
            <div className="space-y-1 text-sm">
              <p className="text-rose-900 dark:text-rose-100 font-medium">
                {shippingAddress.firstName} {shippingAddress.lastName}
              </p>
              <p className="text-rose-700 dark:text-rose-300">{shippingAddress.address1}</p>
              {shippingAddress.address2 && (
                <p className="text-rose-700 dark:text-rose-300">{shippingAddress.address2}</p>
              )}
              <p className="text-rose-700 dark:text-rose-300">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
              <p className="text-rose-700 dark:text-rose-300">{shippingAddress.email}</p>
              <p className="text-rose-700 dark:text-rose-300">{shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Method */}
        <div>
          <h3 className="font-medium text-rose-900 dark:text-rose-100 mb-3">Shipping Method</h3>
          <div className="bg-rose-50 dark:bg-rose-800/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-rose-900 dark:text-rose-100">
                  {shippingOption?.name}
                </p>
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {shippingOption?.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-rose-900 dark:text-rose-100">
                  {shippingOption?.price === 0 ? 'FREE' : `$${shippingOption?.price.toFixed(2)}`}
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {shippingOption?.estimatedDays}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div>
          <h3 className="font-medium text-rose-900 dark:text-rose-100 mb-3">Order Total</h3>
          <div className="bg-rose-50 dark:bg-rose-800/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-rose-700 dark:text-rose-300">Subtotal</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-rose-700 dark:text-rose-300">Shipping</span>
              <span className="text-rose-900 dark:text-rose-100">
                {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-rose-700 dark:text-rose-300">Tax</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-rose-200 dark:border-rose-700 pt-2">
              <div className="flex justify-between font-bold">
                <span className="text-rose-900 dark:text-rose-100">Total</span>
                <span className="text-rose-900 dark:text-rose-100">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 dark:bg-gray-800/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p>
                By placing this order, you agree to our{' '}
                <span className="text-rose-600 dark:text-rose-400 underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-rose-600 dark:text-rose-400 underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Success Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-center">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              ✅ Ready to place your order!
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs mt-1">
              All information has been validated and is ready for processing.
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(3)}
            className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            ← Back to Payment
          </Button>
          <Button
            onClick={handlePlaceOrder}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
          >
            🎉 Place Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
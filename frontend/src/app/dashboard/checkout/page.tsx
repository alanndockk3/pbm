// app/dashboard/checkout/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useCartItems, useCartTotalPrice } from '../../../../lib/profile/useCartStore';
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import { OrderReview } from '@/components/account/checkout/OrderReview';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Lock, Loader2, CreditCard, ShoppingCart } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItems = useCartItems();
  const cartTotalPrice = useCartTotalPrice();
  const { 
    setItems, 
    updateTotals, 
    totals
  } = useCheckoutStore();
  
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize checkout with cart data
  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      router.push('/dashboard/cart');
      return;
    }

    // Convert cart items to checkout format
    const checkoutItems = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      category: item.category || 'Handmade'
    }));

    // Initialize checkout state
    setItems(checkoutItems);
    
    // Don't set shipping cost here - let Stripe handle it
    // Shipping will be calculated by Stripe based on shipping rates
    updateTotals({ shipping: 0 });

    setIsInitializing(false);
  }, [cartItems, cartTotalPrice, setItems, updateTotals, router]);

  const handleBackToCart = () => {
    router.push('/dashboard/cart');
  };

  // Don't render if cart is empty (will redirect)
  if (cartItems.length === 0) {
    return null;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-rose-400 mx-auto mb-4 animate-spin" />
            <p className="text-rose-600 dark:text-rose-400">Preparing your order...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
              Review Your Order
            </h1>
            <p className="text-rose-600 dark:text-rose-400 text-sm md:text-base">
              Almost there! Please review your items before completing your purchase.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Order Review - Takes up 2/3 */}
          <div className="xl:col-span-2">
            <OrderReview />
          </div>
          
          {/* Sidebar - Takes up 1/3 */}
          <div className="space-y-4">
            <Card className="border border-rose-200 dark:border-rose-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-rose-900 dark:text-rose-100 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-rose-600 dark:text-rose-400">Items ({cartItems.length}):</span>
                <span className="text-rose-900 dark:text-rose-100">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rose-600 dark:text-rose-400">Est. Shipping:</span>
                <span className="text-rose-900 dark:text-rose-100 text-sm">
                  Calculated by Stripe
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rose-600 dark:text-rose-400">Tax:</span>
                <span className="text-rose-900 dark:text-rose-100">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-rose-200 dark:border-rose-700 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-rose-900 dark:text-rose-100">Total:</span>
                  <span className="text-rose-900 dark:text-rose-100 text-sm">
                    Calculated by Stripe
                  </span>
                </div>
              </div>
              
              {/* Shipping notice */}
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-2 rounded text-center">
                📦 Shipping rates and final total will be calculated during checkout
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                // This will trigger the OrderReview component's checkout function
                const checkoutButton = document.querySelector('[data-checkout-button]') as HTMLButtonElement;
                if (checkoutButton) checkoutButton.click();
              }}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Continue to Payment
            </Button>
            
            <Button
              variant="outline"
              onClick={handleBackToCart}
              className="w-full h-10 border-rose-200 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Lock className="w-4 h-4" />
              <span className="text-xs">
                <strong>Secure Checkout:</strong> Your payment information is protected by Stripe's industry-leading 
                security standards. We never store your payment details.
              </span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

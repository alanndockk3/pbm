// app/dashboard/checkout/cancelled/page.tsx
'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../../lib/auth/useAuthStore';
import { useCartItems } from '../../../../../lib/profile/useCartStore';
import { useCheckoutStore } from '../../../../../lib/checkout/useCheckoutStore';
import { XCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function CancelledCheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItems = useCartItems();
  const { resetCheckout } = useCheckoutStore();

  useEffect(() => {
    // Ensure user is authenticated
    if (!user) {
      router.push('/');
      return;
    }

    // Reset checkout state when page loads
    resetCheckout();
  }, [user, router, resetCheckout]);

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleReturnToCart = () => {
    router.push('/dashboard/cart');
  };

  const handleRetryCheckout = () => {
    router.push('/dashboard/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold text-rose-800 mb-4">
            Checkout Cancelled
          </h1>
          <p className="text-lg text-rose-600 max-w-2xl mx-auto">
            Your checkout process was cancelled. Don't worry - your items are still safely in your cart and ready for checkout when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Cart Summary */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-rose-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length > 0 ? (
                <div className="space-y-3">
                  {cartItems.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-pink-600">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-rose-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-rose-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <span className="font-semibold text-rose-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-center text-sm text-rose-600 py-2">
                      +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''} in your cart
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-rose-500 text-center py-4">
                  Your cart is empty
                </p>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-rose-800">
                What Would You Like to Do?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleRetryCheckout}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Checkout Again
                </Button>
                
                <Button
                  onClick={handleReturnToCart}
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 py-3"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Review Cart
                </Button>
                
                <Button
                  onClick={handleContinueShopping}
                  variant="ghost"
                  className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-3"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-50 to-pink-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-rose-800">
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-rose-700">
              <div>
                <h4 className="font-semibold mb-2">Common Reasons for Cancellation:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Changed your mind about the purchase</li>
                  <li>Wanted to review cart items first</li>
                  <li>Technical issues during checkout</li>
                  <li>Need to update shipping information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Your Items Are Safe:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Cart contents are preserved</li>
                  <li>No charges were made</li>
                  <li>You can checkout anytime</li>
                  <li>Shipping options remain available</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
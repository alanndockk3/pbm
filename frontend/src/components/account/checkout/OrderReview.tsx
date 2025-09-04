// components/checkout/OrderReview.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useCartItems } from '../../../../lib/profile/useCartStore';
import { useShippingRates } from '../../../../lib/checkout/useShippingRates';
import { getAuth } from 'firebase/auth';
import { 
  Package, 
  Truck, 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ShoppingCart,
  Clock,
  ArrowRight
} from 'lucide-react';

type PaymentState = 'idle' | 'creating' | 'redirecting' | 'error';

// Separate component for order items
const OrderItemsList = ({ items }: { items: any[] }) => (
  <Card className="border border-rose-200 dark:border-rose-800 shadow-sm">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-rose-900 dark:text-rose-100">
        <Package className="w-5 h-5" />
        Order Items ({items.length})
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800/50">
          {item.image && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-rose-200 dark:border-rose-700">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-rose-900 dark:text-rose-100 text-sm">
              {item.name}
            </h4>
            {item.category && (
              <Badge variant="secondary" className="text-xs mt-1 bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300">
                {item.category}
              </Badge>
            )}
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
              Qty: {item.quantity} × ${item.price.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <div className="font-bold text-rose-900 dark:text-rose-100">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// Separate component for shipping notice
const ShippingNotice = () => (
  <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
    <CardContent className="p-3">
      <div className="flex items-start gap-2">
        <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-full">
          <Truck className="w-3 h-3 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-800 dark:text-green-200 text-xs mb-0.5">
            Free Local Delivery Available
          </h4>
          <p className="text-green-700 dark:text-green-300 text-xs leading-tight">
            Customers in Kokomo, IN receive FREE shipping on all orders. 
            Final shipping costs will be calculated during checkout based on your delivery address.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// What Happens Next component
const WhatHappensNext = () => (
  <Card className="border border-rose-200 dark:border-rose-800 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base text-rose-900 dark:text-rose-100 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" />
        What Happens Next
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0 space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">1</span>
        </div>
        <div>
          <h4 className="font-medium text-rose-900 dark:text-rose-100 text-xs">Secure Checkout</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 leading-tight">
            You'll be redirected to Stripe's secure payment page.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">2</span>
        </div>
        <div>
          <h4 className="font-medium text-rose-900 dark:text-rose-100 text-xs">Order Confirmation</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 leading-tight">
            After payment, you'll receive confirmation and tracking.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">3</span>
        </div>
        <div>
          <h4 className="font-medium text-rose-900 dark:text-rose-100 text-xs">Order Processing</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 leading-tight">
            Your order will be processed and shipped promptly.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);





export const OrderReview = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItems = useCartItems();
  const { 
    totals, 
    items
  } = useCheckoutStore();
  const { shippingRates, isLoading: shippingRatesLoading } = useShippingRates();
  
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleProceedToCheckout = async () => {
    if (!user?.uid) {
      setErrorMessage('You must be logged in to complete checkout');
      return;
    }

    if (shippingRatesLoading) {
      setErrorMessage('Shipping rates are still loading. Please wait and try again.');
      return;
    }

    setPaymentState('creating');
    setErrorMessage('');

    try {
      console.log('Creating Stripe checkout session...');

      // Get the Firebase Auth instance and current user
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Get the user's Firebase ID token for authentication
      const idToken = await currentUser.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      // Build line_items with product IDs in metadata
      const line_items = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
              category: item.category || 'Handmade'
            }
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Enhanced metadata for order creation (keeping it under 500 chars)
      const sessionMetadata = {
        userId: user.uid,
        itemCount: items.length.toString(),
        // Store only essential item info without long URLs
        itemSummary: JSON.stringify(items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'Handmade'
        }))),
        originalSubtotal: totals.subtotal.toFixed(2),
        originalShipping: '0.00', // Shipping will be calculated by Stripe
        originalTax: totals.tax.toFixed(2),
        originalTotal: '0.00' // Total will be calculated by Stripe
      };

      // Check if shipping rates are available
      if (!shippingRates || shippingRates.length === 0) {
        throw new Error('Shipping rates not available. Please try again or contact support.');
      }

      // Debug: Check each rate's structure
      shippingRates.forEach((rate, index) => {
        console.log(`Rate ${index}:`, {
          id: rate.id,
          type: rate.type,
          displayName: rate.displayName,
          amount: rate.amount,
          currency: rate.currency,
          hasRequiredFields: {
            type: !!rate.type,
            displayName: !!rate.displayName,
            amount: rate.amount !== undefined && rate.amount !== null,
            currency: !!rate.currency
          }
        });
      });

      // Filter out any shipping rates that don't have required fields
      // Note: amount can be 0 for free shipping, so we check if it's defined, not truthy
      const validShippingRates = shippingRates.filter(rate => 
        rate.type && rate.displayName && (rate.amount !== undefined && rate.amount !== null) && rate.currency
      );
      
      if (validShippingRates.length === 0) {
        throw new Error('No valid shipping rates available. Please contact support.');
      }

      // Use all available shipping rates including the Kokomo free shipping
      const shippingOptions = validShippingRates.map(rate => ({
        shipping_rate: rate.id
      }));
      
      console.log('🚚 Shipping options being sent to Stripe:', shippingOptions);

      // Call the Stripe checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          line_items,
          shipping_address_collection: {
            allowed_countries: ['US']
          },
          shipping_options: shippingOptions,
          metadata: sessionMetadata,
          customer_email: user.email,
          success_url: `${window.location.origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/dashboard/checkout/cancelled`,
          phone_number_collection: {
            enabled: true
          },
          consent_collection: {
            terms_of_service: 'required'
          },
          allow_promotion_codes: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url, sessionId } = await response.json();

      if (!url) {
        throw new Error('No checkout URL received from Stripe');
      }

      console.log('Stripe checkout session created:', sessionId);
      setPaymentState('redirecting');

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create checkout session');
      setPaymentState('error');
    }
  };

  const handleBackToCart = () => {
    router.push('/dashboard/cart');
  };

  return (
    <div className="w-full">
      {/* Main Content - Single Column Layout */}
      <div className="space-y-4">
        {/* Order Items Section */}
        <div className="w-full">
          <OrderItemsList items={items} />
        </div>
        
        {/* What Happens Next and Shipping/Processing Info */}
        <div className="w-full space-y-3">
          <WhatHappensNext />
          
          {/* Shipping and Processing Info */}
          <div className="grid gap-3 md:grid-cols-2">
            <ShippingNotice />
            <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-800 rounded-full">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-xs mb-0.5">
                      Processing Time
                    </h4>
                    <p className="text-amber-700 dark:text-amber-300 text-xs leading-tight">
                      Handmade items typically require 3-5 business days for processing before shipping.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden checkout button for external triggering */}
      <button
        data-checkout-button
        onClick={handleProceedToCheckout}
        disabled={paymentState === 'creating' || paymentState === 'redirecting' || shippingRatesLoading}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Error Message */}
        {errorMessage && (
          <div className="mt-8">
            <Card className="border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200 text-sm">
                      Something went wrong
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};